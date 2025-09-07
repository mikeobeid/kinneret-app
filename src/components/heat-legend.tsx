import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface HeatLegendProps {
  title?: string
  description?: string
  min: number
  max: number
  unit?: string
  colors?: string[]
  className?: string
}

export function HeatLegend({
  title = 'Legend',
  description,
  min,
  max,
  unit = '',
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
  className = ''
}: HeatLegendProps) {
  const steps = colors.length
  const stepValue = (max - min) / (steps - 1)
  
  return (
    <Card className={`rounded-2xl shadow-sm ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {/* Gradient bar */}
          <div className="flex h-4 rounded-lg overflow-hidden">
            {colors.map((color, index) => (
              <div
                key={index}
                className="flex-1"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          
          {/* Value labels */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{min.toFixed(2)}{unit}</span>
            <span>{max.toFixed(2)}{unit}</span>
          </div>
          
          {/* Step values */}
          <div className="flex justify-between text-xs text-muted-foreground">
            {Array.from({ length: steps }, (_, i) => (
              <span key={i}>
                {(min + i * stepValue).toFixed(2)}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
