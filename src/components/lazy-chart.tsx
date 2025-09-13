import { lazy, Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy load the chart component
const LazyLineChart = lazy(() => import('recharts').then(module => ({
  default: module.LineChart
})))

const LazyLine = lazy(() => import('recharts').then(module => ({
  default: module.Line
})))

const LazyXAxis = lazy(() => import('recharts').then(module => ({
  default: module.XAxis
})))

const LazyYAxis = lazy(() => import('recharts').then(module => ({
  default: module.YAxis
})))

const LazyCartesianGrid = lazy(() => import('recharts').then(module => ({
  default: module.CartesianGrid
})))

const LazyTooltip = lazy(() => import('recharts').then(module => ({
  default: module.Tooltip
})))

const LazyResponsiveContainer = lazy(() => import('recharts').then(module => ({
  default: module.ResponsiveContainer
})))

interface LazyChartProps {
  data: any[]
  colors: Record<string, string>
  height?: number
}

export function LazyChart({ data, colors, height = 300 }: LazyChartProps) {
  return (
    <Suspense fallback={<Skeleton className="w-full" style={{ height: `${height}px` }} />}>
      <LazyResponsiveContainer width="100%" height={height}>
        <LazyLineChart data={data} margin={{ top: 20, right: 30, left: 60, bottom: 20 }}>
          <LazyCartesianGrid strokeDasharray="3 3" />
          <LazyXAxis dataKey="month" />
          <LazyYAxis 
            domain={[0, 1]} 
            label={{ value: 'Biomass (mmol P/m³)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', dy: 10 } }}
          />
          <LazyTooltip />
          <LazyLine type="monotone" dataKey="diatoms" stroke={colors.diatoms} strokeWidth={2} />
          <LazyLine type="monotone" dataKey="dinoflagellates" stroke={colors.dinoflagellates} strokeWidth={2} />
          <LazyLine type="monotone" dataKey="small_phyto" stroke={colors.small_phyto} strokeWidth={2} />
          <LazyLine type="monotone" dataKey="n_fixers" stroke={colors.n_fixers} strokeWidth={2} />
          <LazyLine type="monotone" dataKey="microcystis" stroke={colors.microcystis} strokeWidth={2} />
        </LazyLineChart>
      </LazyResponsiveContainer>
    </Suspense>
  )
}
