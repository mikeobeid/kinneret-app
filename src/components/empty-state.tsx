import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LucideIcon, Database, Upload, BarChart3, MapPin } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  variant?: 'default' | 'data' | 'upload' | 'chart' | 'map'
  className?: string
}

const getDefaultIcon = (variant: EmptyStateProps['variant']) => {
  switch (variant) {
    case 'data':
      return Database
    case 'upload':
      return Upload
    case 'chart':
      return BarChart3
    case 'map':
      return MapPin
    default:
      return Database
  }
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
  className = ''
}: EmptyStateProps) {
  const Icon = icon || getDefaultIcon(variant)
  
  return (
    <Card className={`rounded-2xl shadow-sm border-dashed ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="mb-4 p-4 rounded-full bg-muted/50">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <CardTitle className="text-lg font-semibold mb-2">
          {title}
        </CardTitle>
        
        <CardDescription className="text-sm text-muted-foreground mb-6 max-w-sm">
          {description}
        </CardDescription>
        
        {action && (
          <Button onClick={action.onClick} className="rounded-xl">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
