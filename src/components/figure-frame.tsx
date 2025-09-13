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
  researchOptions?: {
    groupId?: string
    month?: number
    season?: 'winter' | 'summer'
  }
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
  className = '',
  researchOptions
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
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {/* Export Controls */}
            <FigureExportControls
              elementRef={ref as React.RefObject<HTMLElement>}
              metadata={metadata}
              filename={filename}
              pageName={pageName}
              figureKey={figureKey}
              supportsSVG={supportsSVG}
              researchOptions={researchOptions}
            />
          </div>
          {subtitle && (
            <CardDescription className="text-sm text-muted-foreground">{subtitle}</CardDescription>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Main Figure Content */}
        <div 
          ref={ref}
          className="relative w-full"
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
