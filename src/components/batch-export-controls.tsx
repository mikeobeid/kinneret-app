import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Download, 
  FileArchive, 
  Palette, 
  Monitor, 
  Moon, 
  Sun,
  Settings,
  Check
} from 'lucide-react'
import { 
  exportNodeAsSVG, 
  exportNodeAsPNG, 
  downloadBlob, 
  createFiguresZip,
  sanitizeFileName,
  ExportOptions,
  FigureMetadata,
  FIGURE_SIZES
} from '@/lib/figure/engine'

interface FigureExportItem {
  elementRef: React.RefObject<HTMLElement | null>
  metadata: FigureMetadata
  filename: string
  pageName: string
  figureKey: string
  supportsSVG?: boolean
}

interface BatchExportControlsProps {
  figures: FigureExportItem[]
  pageName: string
  className?: string
}

export function BatchExportControls({
  figures,
  pageName,
  className = ''
}: BatchExportControlsProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportStyle, setExportStyle] = useState<'light' | 'dark' | 'transparent'>('light')
  const [exportSize, setExportSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [exportFormat, setExportFormat] = useState<'png' | 'svg'>('png')
  const [includeCaption, setIncludeCaption] = useState(true)
  const [includeMetadata, setIncludeMetadata] = useState(true)

  const handleBatchExport = async () => {
    if (figures.length === 0) {
      alert('No figures available for export')
      return
    }

    setIsExporting(true)
    
    try {
      const size = FIGURE_SIZES[exportSize]
      const exportedFigures: Array<{ blob: Blob; filename: string }> = []
      
      for (const figure of figures) {
        if (!figure.elementRef.current) {
          console.warn(`No element reference for figure: ${figure.figureKey}`)
          continue
        }

        const sanitizedFilename = sanitizeFileName(figure.filename)
        const finalFilename = `kinneret-${pageName}-${figure.figureKey}-${exportStyle}.${exportFormat}`
        
        // Add timestamp to metadata
        const metadataWithTimestamp = {
          ...figure.metadata,
          timestamp: new Date().toISOString()
        }
        
        const options: ExportOptions = {
          format: exportFormat,
          scale: exportFormat === 'png' ? 2 : 1,
          bg: exportStyle,
          filename: finalFilename,
          includeCaption,
          includeMetadata
        }

        // Apply size to the element before export
        const originalWidth = figure.elementRef.current.style.width
        const originalHeight = figure.elementRef.current.style.height
        
        figure.elementRef.current.style.width = `${size.width}px`
        figure.elementRef.current.style.height = `${size.height}px`
        
        // Wait for layout to update
        await new Promise(resolve => setTimeout(resolve, 100))

        let blob: Blob
        try {
          if (exportFormat === 'svg' && figure.supportsSVG !== false) {
            blob = await exportNodeAsSVG(figure.elementRef.current, options, metadataWithTimestamp)
          } else {
            blob = await exportNodeAsPNG(figure.elementRef.current, options, metadataWithTimestamp)
          }

          exportedFigures.push({ blob, filename: finalFilename })
        } catch (error) {
          console.error(`Failed to export ${figure.figureKey}:`, error)
        }
        
        // Restore original size
        figure.elementRef.current.style.width = originalWidth
        figure.elementRef.current.style.height = originalHeight
      }

      if (exportedFigures.length === 0) {
        alert('No figures could be exported')
        return
      }

      // Create ZIP file
      const zipBlob = await createFiguresZip(exportedFigures)
      downloadBlob(zipBlob, `kinneret-${pageName}-figures.zip`)
      
    } catch (error) {
      console.error('Batch export failed:', error)
      alert('Batch export failed. Please try again.')
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

  const formatOptions = [
    { value: 'png', label: 'PNG (Raster)' },
    { value: 'svg', label: 'SVG (Vector)' }
  ] as const

  const currentStyle = styleOptions.find(s => s.value === exportStyle)
  const currentSize = sizeOptions.find(s => s.value === exportSize)
  const currentFormat = formatOptions.find(f => f.value === exportFormat)


  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Batch Export Button */}
      <Button
        onClick={handleBatchExport}
        disabled={isExporting || figures.length === 0}
        className="flex items-center gap-2"
      >
        <FileArchive className="h-4 w-4" />
        {isExporting ? 'Exporting...' : `Download All (${figures.length})`}
      </Button>

      {/* Style Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Palette className="h-3 w-3" />
            {currentStyle?.icon && <currentStyle.icon className="h-3 w-3" />}
            {currentStyle?.label}
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
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Settings className="h-3 w-3" />
            {currentSize?.label}
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

      {/* Format Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            {currentFormat?.label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {formatOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setExportFormat(option.value as any)}
              className="flex items-center gap-2"
            >
              {option.label}
              {exportFormat === option.value && <Check className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Settings className="h-3 w-3" />
            Options
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="p-2">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="batch-include-caption"
                  checked={includeCaption}
                  onCheckedChange={(checked) => setIncludeCaption(checked as boolean)}
                />
                <label
                  htmlFor="batch-include-caption"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Include captions & metadata
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="batch-include-metadata"
                  checked={includeMetadata}
                  onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
                />
                <label
                  htmlFor="batch-include-metadata"
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
