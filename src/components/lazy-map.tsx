import { lazy, Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy load the map component
const LazyMapView = lazy(() => import('@/components/map-view').then(module => ({
  default: module.MapView
})))

interface LazyMapProps {
  title: string
  description: string
  center: [number, number]
  zoom: number
  rasterUrl: string
  rasterBounds: [[number, number], [number, number]]
  markers: Array<{
    id: string
    position: [number, number]
    title: string
    description: string
    color: string
  }>
  height?: number
}

export function LazyMap(props: LazyMapProps) {
  return (
    <Suspense fallback={<Skeleton className="w-full" style={{ height: `${props.height || 500}px` }} />}>
      <LazyMapView {...props} />
    </Suspense>
  )
}
