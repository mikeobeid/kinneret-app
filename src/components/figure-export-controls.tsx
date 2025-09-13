import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Download, 
  Image, 
  FileText, 
  Palette, 
  Monitor, 
  Moon, 
  Sun,
  Settings,
  Check,
  ChevronDown
} from 'lucide-react'
import { 
  exportNodeAsSVG, 
  downloadBlob, 
  ExportOptions,
  FigureMetadata,
  FIGURE_SIZES
} from '@/lib/figure/engine'

interface FigureExportControlsProps {
  elementRef: React.RefObject<HTMLElement>
  metadata: FigureMetadata
  filename: string
  pageName: string
  figureKey: string
  supportsSVG?: boolean
  className?: string
  // Research specific props
  researchOptions?: {
    groupId?: string
    month?: number
    season?: 'winter' | 'summer'
  }
}

export function FigureExportControls({
  elementRef,
  metadata,
  filename,
  pageName,
  figureKey,
  supportsSVG = true,
  className = '',
  researchOptions
}: FigureExportControlsProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportStyle, setExportStyle] = useState<'light' | 'dark' | 'transparent'>('light')
  const [exportSize, setExportSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [exportFormat, setExportFormat] = useState<'png' | 'svg' | 'pdf'>('png')
  const [includeCaption, setIncludeCaption] = useState(true)
  const [includeMetadata, setIncludeMetadata] = useState(true)

  const handleExport = async (format: 'png' | 'svg' | 'pdf') => {
    if (!elementRef.current) {
      console.error('No element reference available for export')
      return
    }

    setIsExporting(true)
    
    try {
      const size = FIGURE_SIZES[exportSize]
      
      // Generate wind lab specific filename
      let finalFilename: string
      if (researchOptions && pageName === 'research') {
        const { groupId = 'diatoms', month = 6, season = 'summer' } = researchOptions
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const monthName = monthNames[month - 1] || 'Jun'
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
        finalFilename = `kinneret-research-${groupId}-${monthName}-${season}-${exportSize}-${dateStr}.${format}`
      } else {
        finalFilename = `kinneret-${pageName}-${figureKey}-${exportStyle}.${format}`
      }
      
      const options: ExportOptions = {
        format: format === 'pdf' ? 'png' : format,
        scale: format === 'png' ? 2 : 1,
        bg: exportStyle,
        filename: finalFilename,
        includeCaption,
        includeMetadata
      }

      // Use html2canvas directly for PNG export to capture the actual rendered content
      if (format === 'png') {
        const html2canvas = (await import('html2canvas')).default
        
        // Create a container to hold the element during export without affecting the original
        const exportContainer = document.createElement('div')
        exportContainer.style.position = 'absolute'
        exportContainer.style.left = '-9999px'
        exportContainer.style.top = '-9999px'
        exportContainer.style.width = `${size.width}px`
        exportContainer.style.height = `${size.height}px`
        exportContainer.style.overflow = 'hidden'
        exportContainer.style.backgroundColor = exportStyle === 'transparent' ? 'transparent' : 
                                             exportStyle === 'dark' ? '#1f2937' : '#ffffff'
        
        // Clone the element for export
        const clonedElement = elementRef.current.cloneNode(true) as HTMLElement
        clonedElement.style.width = `${size.width}px`
        clonedElement.style.height = `${size.height}px`
        clonedElement.style.position = 'relative'
        clonedElement.style.transform = 'none'
        
        // Append to export container
        exportContainer.appendChild(clonedElement)
        document.body.appendChild(exportContainer)
        
        // Wait for layout to update and add delay for user feedback
        // await new Promise(resolve => setTimeout(resolve, 3500))
        
        const canvas = await html2canvas(exportContainer, {
          scale: format === 'png' ? 2 : 1,
          backgroundColor: exportStyle === 'transparent' ? null : 
                         exportStyle === 'dark' ? '#1f2937' : '#ffffff',
          useCORS: true,
          allowTaint: true,
          width: size.width,
          height: size.height
        })
        
        // Clean up the export container
        document.body.removeChild(exportContainer)
        
        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            downloadBlob(blob, finalFilename)
          }
        }, 'image/png')
        
      } else if (format === 'svg') {
        // For SVG, use the original export function
        const blob = await exportNodeAsSVG(elementRef.current, options, metadata)
        downloadBlob(blob, finalFilename)
      } else if (format === 'pdf') {
        // For PDF, use html2canvas + jsPDF
        const html2canvas = (await import('html2canvas')).default
        const { jsPDF } = await import('jspdf')
        
        // Capture the element as canvas
        const canvas = await html2canvas(elementRef.current, {
          scale: 2,
          backgroundColor: exportStyle === 'transparent' ? null : 
                         exportStyle === 'dark' ? '#1f2937' : '#ffffff',
          useCORS: true,
          allowTaint: true,
          width: elementRef.current.scrollWidth,
          height: elementRef.current.scrollHeight
        })
        
        // Create PDF
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
          unit: 'mm',
          format: 'a4'
        })
        
        // Calculate dimensions to fit the page
        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight()
        const imgWidth = canvas.width
        const imgHeight = canvas.height
        const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight)
        const finalWidth = imgWidth * ratio
        const finalHeight = imgHeight * ratio
        
        // Add image to PDF
        pdf.addImage(imgData, 'PNG', 0, 0, finalWidth, finalHeight)
        
        // Add metadata if requested
        if (includeMetadata && metadata) {
          pdf.setFontSize(10)
          pdf.setTextColor(100)
          pdf.text(`Source: ${metadata.source || 'Lake Kinneret monitoring program'}`, 10, pageHeight - 20)
          pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 10, pageHeight - 10)
        }
        
        // Download PDF
        pdf.save(finalFilename.replace('.png', '.pdf'))
      }
      
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const styleOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'transparent', label: 'Transparent', icon: Monitor }
  ] as const

  const sizeOptions = [
    { value: 'small', label: 'Small (1200×800)', size: FIGURE_SIZES.small },
    { value: 'medium', label: 'Medium (1600×1000)', size: FIGURE_SIZES.medium },
    { value: 'large', label: 'Large (2000×1200)', size: FIGURE_SIZES.large }
  ] as const

  const currentStyle = styleOptions.find(s => s.value === exportStyle)
  const currentSize = sizeOptions.find(s => s.value === exportSize)

  return (
    <div className={`flex flex-wrap items-center gap-1 sm:gap-2 ${className}`}>
      {/* Format Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            disabled={isExporting}
            className="flex items-center gap-1 min-w-0"
          >
            {exportFormat === 'png' && <Image className="h-3 w-3 flex-shrink-0" />}
            {exportFormat === 'svg' && <FileText className="h-3 w-3 flex-shrink-0" />}
            {exportFormat === 'pdf' && <FileText className="h-3 w-3 flex-shrink-0" />}
            <span className="text-xs uppercase hidden xs:inline">{exportFormat}</span>
            <ChevronDown className="h-3 w-3 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setExportFormat('png')}>
            <Image className="mr-2 h-4 w-4" />
            PNG
          </DropdownMenuItem>
          {supportsSVG && (
            <DropdownMenuItem onClick={() => setExportFormat('svg')}>
              <FileText className="mr-2 h-4 w-4" />
              SVG
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setExportFormat('pdf')}>
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Export Button */}
      <Button
        size="sm"
        variant="default"
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleExport(exportFormat)
        }}
        disabled={isExporting}
        className="flex items-center gap-1 min-w-0"
      >
        <Download className="h-3 w-3 flex-shrink-0" />
        <span className="text-xs hidden xs:inline">Export</span>
      </Button>

      {/* Style Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="flex items-center gap-1 min-w-0">
            <Palette className="h-3 w-3 flex-shrink-0" />
            {currentStyle?.icon && <currentStyle.icon className="h-3 w-3 flex-shrink-0" />}
            <span className="text-xs hidden sm:inline">{currentStyle?.label}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {styleOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setExportStyle(option.value as any)}
              className="flex items-center gap-2"
            >
              <option.icon className="h-4 w-4" />
              {option.label}
              {exportStyle === option.value && <Check className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Size Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="flex items-center gap-1 min-w-0">
            <Settings className="h-3 w-3 flex-shrink-0" />
            <span className="text-xs hidden md:inline truncate max-w-[120px]">{currentSize?.label}</span>
            <span className="text-xs md:hidden">Size</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {sizeOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setExportSize(option.value as any)}
              className="flex items-center gap-2"
            >
              {option.label}
              {exportSize === option.value && <Check className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="flex items-center gap-1 min-w-0">
            <Settings className="h-3 w-3 flex-shrink-0" />
            <span className="text-xs hidden xs:inline">Options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 max-w-[90vw]">
          <div className="p-2">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-caption"
                  checked={includeCaption}
                  onCheckedChange={(checked) => setIncludeCaption(checked as boolean)}
                />
                <label
                  htmlFor="include-caption"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Include caption & metadata
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-metadata"
                  checked={includeMetadata}
                  onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
                />
                <label
                  htmlFor="include-metadata"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Include technical metadata
                </label>
              </div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
