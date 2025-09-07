import React, { forwardRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FigureExportControls } from '@/components/figure-export-controls'
import { FigureMetadata } from '@/lib/figure/engine'

interface FigureFrameProps {
  title: string
  subtitle?: string
  caption?: string
  units?: string
  source?: string
  pageName: string
  figureKey: string
  children: React.ReactNode
  supportsSVG?: boolean
  className?: string
}

export const FigureFrame = forwardRef<HTMLDivElement, FigureFrameProps>(({
  title,
  subtitle,
  caption,
  units,
  source,
  pageName,
  figureKey,
  children,
  supportsSVG = true,
  className = ''
}, ref) => {
  
  const metadata: FigureMetadata = {
    title,
    subtitle,
    caption,
    units,
    source: source || 'Lake Kinneret monitoring program',
    timestamp: new Date().toISOString(),
    appName: 'Kinneret BioGeo Lab',
    appVersion: '1.0.0'
  }

  const filename = `${pageName}-${figureKey}`

  return (
    <Card className={`relative ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg sm:text-xl break-words">{title}</CardTitle>
            {subtitle && (
              <CardDescription className="mt-1 text-sm break-words">{subtitle}</CardDescription>
            )}
          </div>
          
          {/* Export Controls */}
          <div className="flex-shrink-0">
            <FigureExportControls
              elementRef={ref}
              metadata={metadata}
              filename={filename}
              pageName={pageName}
              figureKey={figureKey}
              supportsSVG={supportsSVG}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Main Figure Content */}
        <div 
          ref={ref}
          className="relative overflow-x-auto"
          style={{ minHeight: '250px' }}
        >
          {children}
        </div>
        
        {/* Caption and Metadata (subtle on-screen display) */}
        {(caption || units) && (
          <div className="mt-4 pt-3 border-t border-muted/50">
            <div className="text-sm text-muted-foreground space-y-1">
              {caption && (
                <div className="font-medium">{caption}</div>
              )}
              {units && (
                <div className="text-xs">Units: {units}</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
