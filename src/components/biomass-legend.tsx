import { cn } from '@/lib/utils'

interface BiomassLegendProps {
  min: number
  max: number
  units: string
  className?: string
}

export function BiomassLegend({ min, max, units, className }: BiomassLegendProps) {
  // Calculate tick values
  const tickCount = 4
  const tickValues = Array.from({ length: tickCount }, (_, i) => {
    return min + (max - min) * (i / (tickCount - 1))
  })

  return (
    <div 
      className={cn(
        "flex flex-col items-center space-y-2 p-3 bg-white/90 dark:bg-gray-900/90 rounded-lg shadow-lg border",
        className
      )}
      role="img"
      aria-label={`Biomass legend, units ${units}, range ${min} to ${max}`}
    >
      {/* Legend Title */}
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Biomass
      </div>
      
      {/* Color Bar */}
      <div className="relative w-6 h-48 rounded-sm overflow-hidden">
        <div 
          className="w-full h-full"
          style={{
            background: `linear-gradient(to top, 
              #1e40af 0%, 
              #3b82f6 25%, 
              #60a5fa 50%, 
              #93c5fd 75%, 
              #dbeafe 100%)`
          }}
        />
        
        {/* Tick Marks */}
        {tickValues.map((value, index) => {
          const position = (index / (tickCount - 1)) * 100
          return (
            <div
              key={value}
              className="absolute left-0 w-full h-px bg-gray-600 dark:bg-gray-400"
              style={{ top: `${100 - position}%` }}
            />
          )
        })}
      </div>
      
      {/* Tick Labels */}
      <div className="flex flex-col justify-between h-48 text-xs text-gray-600 dark:text-gray-400">
        {tickValues.map((value, index) => (
          <div
            key={value}
            className="text-right"
            style={{ 
              height: `${100 / (tickCount - 1)}%`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end'
            }}
          >
            {value.toFixed(3)}
          </div>
        ))}
      </div>
      
      {/* Units Label */}
      <div className="text-xs text-gray-500 dark:text-gray-500 font-medium">
        {units}
      </div>
    </div>
  )
}
