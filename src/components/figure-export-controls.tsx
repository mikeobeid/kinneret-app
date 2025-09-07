import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
  Image, 
  FileText, 
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
  sanitizeFileName,
  ExportOptions,
  FigureMetadata,
  FIGURE_SIZES,
  THEME_STYLES
} from '@/lib/figure/engine'

interface FigureExportControlsProps {
  elementRef: React.RefObject<HTMLElement>
  metadata: FigureMetadata
  filename: string
  pageName: string
  figureKey: string
  supportsSVG?: boolean
  className?: string
}

export function FigureExportControls({
  elementRef,
  metadata,
  filename,
  pageName,
  figureKey,
  supportsSVG = true,
  className = ''
}: FigureExportControlsProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportStyle, setExportStyle] = useState<'light' | 'dark' | 'transparent'>('light')
  const [exportSize, setExportSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [includeCaption, setIncludeCaption] = useState(true)
  const [includeMetadata, setIncludeMetadata] = useState(true)

  const handleExport = async (format: 'png' | 'svg') => {
    if (!elementRef.current) {
      console.error('No element reference available for export')
      return
    }

    setIsExporting(true)
    
    try {
      const size = FIGURE_SIZES[exportSize]
      const sanitizedFilename = sanitizeFileName(filename)
      const finalFilename = `kinneret-${pageName}-${figureKey}-${exportStyle}.${format}`
      
      const options: ExportOptions = {
        format,
        scale: format === 'png' ? 2 : 1,
        bg: exportStyle,
        filename: finalFilename,
        includeCaption,
        includeMetadata
      }

      // Apply size to the element before export
      const originalWidth = elementRef.current.style.width
      const originalHeight = elementRef.current.style.height
      
      elementRef.current.style.width = `${size.width}px`
      elementRef.current.style.height = `${size.height}px`
      
      // Wait for layout to update
      await new Promise(resolve => setTimeout(resolve, 100))

      let blob: Blob
      if (format === 'svg') {
        blob = await exportNodeAsSVG(elementRef.current, options, metadata)
      } else {
        blob = await exportNodeAsPNG(elementRef.current, options, metadata)
      }

      downloadBlob(blob, finalFilename)
      
      // Restore original size
      elementRef.current.style.width = originalWidth
      elementRef.current.style.height = originalHeight
      
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
    <Card className={`w-fit max-w-full responsive-card ${className}`}>
      <CardContent className="p-2 sm:p-3">
        <div className="responsive-flex-col sm:flex-row items-stretch sm:items-center">
          {/* Export Buttons */}
          <div className="responsive-flex flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExport('png')}
              disabled={isExporting}
              className="responsive-button flex items-center gap-1"
            >
              <Image className="h-3 w-3" />
              <span className="hidden xs:inline responsive-text">PNG</span>
            </Button>
            
            {supportsSVG && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExport('svg')}
                disabled={isExporting}
                className="responsive-button flex items-center gap-1"
              >
                <FileText className="h-3 w-3" />
                <span className="hidden xs:inline responsive-text">SVG</span>
              </Button>
            )}
          </div>

          {/* Style Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="responsive-button flex items-center gap-1">
                <Palette className="h-3 w-3" />
                {currentStyle?.icon && <currentStyle.icon className="h-3 w-3" />}
                <span className="hidden sm:inline responsive-text">{currentStyle?.label}</span>
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
              <Button size="sm" variant="outline" className="responsive-button flex items-center gap-1">
                <Settings className="h-3 w-3" />
                <span className="hidden sm:inline responsive-text">{currentSize?.label}</span>
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
              <Button size="sm" variant="outline" className="responsive-button flex items-center gap-1">
                <Settings className="h-3 w-3" />
                <span className="hidden sm:inline responsive-text">Options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
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
      </CardContent>
    </Card>
  )
}
