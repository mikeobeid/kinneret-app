import React from 'react'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ParamSpec {
  key: string
  name: string
  description?: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  disabled?: boolean
}

interface ParamSlidersProps {
  title?: string
  description?: string
  params: ParamSpec[]
  onChange: (key: string, value: number) => void
  showValues?: boolean
  className?: string
}

export function ParamSliders({
  title = 'Parameters',
  description,
  params,
  onChange,
  showValues = true,
  className = ''
}: ParamSlidersProps) {
  const handleSliderChange = (key: string, values: number[]) => {
    onChange(key, values[0])
  }

  const formatValue = (param: ParamSpec) => {
    const formatted = param.value.toFixed(param.step < 1 ? 2 : 1)
    return param.unit ? `${formatted} ${param.unit}` : formatted
  }

  return (
    <Card className={`rounded-2xl shadow-sm ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {params.map((param) => (
          <div key={param.key} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">{param.name}</h4>
                {param.description && (
                  <p className="text-xs text-muted-foreground">{param.description}</p>
                )}
              </div>
              {showValues && (
                <Badge variant="outline" className="text-xs">
                  {formatValue(param)}
                </Badge>
              )}
            </div>
            
            <div className="px-2">
              <Slider
                value={[param.value]}
                onValueChange={(values) => handleSliderChange(param.key, values)}
                min={param.min}
                max={param.max}
                step={param.step}
                disabled={param.disabled}
                className="w-full"
              />
              
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{param.min}{param.unit}</span>
                <span>{param.max}{param.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
