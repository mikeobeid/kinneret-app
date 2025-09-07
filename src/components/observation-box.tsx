import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon, CheckCircle, AlertTriangle, Info, TrendingUp } from 'lucide-react'

interface Observation {
  text: string
  type?: 'positive' | 'warning' | 'info' | 'neutral'
}

interface ObservationBoxProps {
  title: string
  description?: string
  observations: Observation[]
  icon?: LucideIcon
  className?: string
}

const getIconForType = (type: Observation['type']) => {
  switch (type) {
    case 'positive':
      return CheckCircle
    case 'warning':
      return AlertTriangle
    case 'info':
      return Info
    default:
      return TrendingUp
  }
}

const getIconColor = (type: Observation['type']) => {
  switch (type) {
    case 'positive':
      return 'text-green-600'
    case 'warning':
      return 'text-amber-600'
    case 'info':
      return 'text-blue-600'
    default:
      return 'text-muted-foreground'
  }
}

export function ObservationBox({
  title,
  description,
  observations,
  icon: Icon = TrendingUp,
  className = ''
}: ObservationBoxProps) {
  return (
    <Card className={`rounded-2xl shadow-sm ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {observations.map((observation, index) => {
            const ObservationIcon = getIconForType(observation.type)
            const iconColor = getIconColor(observation.type)
            
            return (
              <li key={index} className="flex items-start gap-3">
                <ObservationIcon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${iconColor}`} />
                <span className="text-sm text-muted-foreground leading-relaxed">
                  {observation.text}
                </span>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
