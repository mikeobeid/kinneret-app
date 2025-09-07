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
    <Card className={`relative responsive-card ${className}`}>
      <CardHeader className="pb-3">
        <div className="responsive-flex-col sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="responsive-heading responsive-text-wrap">{title}</CardTitle>
            {subtitle && (
              <CardDescription className="mt-1 responsive-text responsive-text-wrap">{subtitle}</CardDescription>
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
          className="relative overflow-x-auto responsive-chart"
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
