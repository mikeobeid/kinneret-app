import React, { useEffect, useRef, useState, useMemo } from 'react'
import { generateBiomassHeatmap, getBiomassUnits, getBiomassRange, EnvironmentalConditions } from '@/lib/biomass/response'
import { getBiomassColor, generateColorScale } from '@/lib/biomass/colormap'

interface BiomassHeatmapProps {
  groupId: string
  env: EnvironmentalConditions
  width?: number
  height?: number
  className?: string
}

export function BiomassHeatmap({ 
  groupId, 
  env, 
  width = 500, 
  height = 300, 
  className = '' 
}: BiomassHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [heatmapData, setHeatmapData] = useState<number[][]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Generate heatmap data with stable dependencies
  const processedHeatmapData = useMemo(() => {
    console.log('Generating biomass heatmap for:', groupId, env)
    
    try {
      const result = generateBiomassHeatmap(groupId, env, width, height)
      console.log('Biomass heatmap generated successfully:', result.length, 'rows')
      return result
    } catch (error) {
      console.error('Error generating biomass heatmap:', error)
      return null
    }
  }, [groupId, env.temperature, env.windSpeed, env.windDirection, env.light, env.phosphorus, env.nitrogen, env.silicon, env.depth, env.month, width, height])

  // Update heatmap data with debounce
  useEffect(() => {
    if (!processedHeatmapData) {
      console.log('No processed heatmap data available')
      return
    }
    
    console.log('Setting loading to true, heatmap data:', processedHeatmapData.length, 'rows')
    setIsLoading(true)
    
    // Debounce to prevent constant recalculation
    const timer = setTimeout(() => {
      console.log('Setting heatmap data after timeout')
      setHeatmapData(processedHeatmapData)
      setIsLoading(false)
    }, 300) // Increased debounce time

    return () => clearTimeout(timer)
  }, [processedHeatmapData])

  // Render heatmap to canvas
  useEffect(() => {
    console.log('Canvas render effect triggered. Heatmap data length:', heatmapData.length, 'Canvas ref:', !!canvasRef.current)
    
    if (!heatmapData.length || !canvasRef.current) {
      console.log('Skipping canvas render - no data or canvas')
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.error('Could not get canvas context')
      return
    }
    
    console.log('Rendering heatmap to canvas with dimensions:', width, 'x', height)

    // Set canvas size
    canvas.width = width
    canvas.height = height

    // Get biomass range for color scaling
    const [minBiomass, maxBiomass] = getBiomassRange(groupId)
    
    // Create image data
    const imageData = ctx.createImageData(width, height)
    const data = imageData.data

    // Fill image data with biomass colors
    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        const biomass = heatmapData[j]?.[i] || 0
        const color = getBiomassColor(biomass, minBiomass, maxBiomass)
        
        // Parse RGB color
        const rgb = color.match(/\d+/g)
        if (rgb && rgb.length >= 3) {
          const index = (j * width + i) * 4
          data[index] = parseInt(rgb[0])     // Red
          data[index + 1] = parseInt(rgb[1]) // Green
          data[index + 2] = parseInt(rgb[2]) // Blue
          data[index + 3] = 255              // Alpha
        }
      }
    }

    // Draw image data to canvas
    ctx.putImageData(imageData, 0, 0)

    // Add contour lines if needed
    drawContourLines(ctx, heatmapData, minBiomass, maxBiomass, width, height)

  }, [heatmapData, width, height, groupId])

  // Draw contour lines for biomass levels
  const drawContourLines = (
    ctx: CanvasRenderingContext2D,
    data: number[][],
    min: number,
    max: number,
    width: number,
    height: number
  ) => {
    const contourLevels = [0.1, 0.3, 0.5, 0.7, 0.9] // Relative levels
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.lineWidth = 1
    
    contourLevels.forEach(level => {
      const threshold = min + level * (max - min)
      
      ctx.beginPath()
      let hasPath = false
      
      for (let j = 0; j < height - 1; j++) {
        for (let i = 0; i < width - 1; i++) {
          const val = data[j]?.[i] || 0
          
          if (val >= threshold && !hasPath) {
            ctx.moveTo(i, j)
            hasPath = true
          } else if (val < threshold && hasPath) {
            ctx.lineTo(i, j)
            hasPath = false
          }
        }
      }
      
      if (hasPath) {
        ctx.stroke()
      }
    })
  }

  // Get color scale for legend
  const colorScale = useMemo(() => {
    const [min, max] = getBiomassRange(groupId)
    return generateColorScale(min, max, 8, 'biomass')
  }, [groupId])

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} 
           style={{ width, height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Computing biomass...</p>
          <p className="text-xs text-gray-500 mt-1">Check console for debug info</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`biomass-heatmap ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full rounded-lg border border-gray-200"
      />
      
      {/* Legend */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Biomass ({getBiomassUnits(groupId)})</span>
          <span>{getBiomassRange(groupId)[1].toFixed(3)}</span>
        </div>
        <div className="flex h-3 rounded overflow-hidden">
          {colorScale.map((item, index) => (
            <div
              key={index}
              className="flex-1"
              style={{ backgroundColor: item.color }}
              title={`${item.value.toFixed(3)} ${getBiomassUnits(groupId)}`}
            />
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Min: {getBiomassRange(groupId)[0].toFixed(3)}
        </div>
      </div>
    </div>
  )
}

export default BiomassHeatmap
