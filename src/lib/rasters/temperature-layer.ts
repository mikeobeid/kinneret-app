import rastersData from '@/data/rasters.json'

export interface TemperatureRaster {
  id: string
  season: string
  min: number
  max: number
  units: string
  colorbar: string
  url: string
  description: string
}

export interface TemperatureConfig {
  season: 'winter' | 'summer'
  opacity: number // 0-100
  showContours: boolean
  contourInterval: number
}

export const DEFAULT_TEMPERATURE_CONFIG: TemperatureConfig = {
  season: 'summer',
  opacity: 30,
  showContours: false,
  contourInterval: 2
}

export function getTemperatureRaster(season: 'winter' | 'summer'): TemperatureRaster | null {
  return rastersData.find(raster => 
    raster.season.toLowerCase() === season
  ) as TemperatureRaster || null
}

export function getAllTemperatureRasters(): TemperatureRaster[] {
  return rastersData as TemperatureRaster[]
}

// Generate mock temperature data for Lake Kinneret
export function generateMockTemperatureData(season: 'winter' | 'summer'): {
  data: number[][]
  bounds: [[number, number], [number, number]]
  min: number
  max: number
} {
  const nx = 50
  const ny = 40
  const data: number[][] = []
  
  // Lake Kinneret bounds
  const bounds: [[number, number], [number, number]] = [[35.55, 32.65], [35.65, 32.95]]
  
  // Temperature ranges based on season
  const tempRange = season === 'winter' ? { min: 10, max: 20 } : { min: 20, max: 30 }
  
  for (let j = 0; j < ny; j++) {
    const row: number[] = []
    for (let i = 0; i < nx; i++) {
      const x = i / (nx - 1)
      const y = j / (ny - 1)
      
      // Create temperature patterns
      let temp: number
      
      if (season === 'winter') {
        // Winter: cooler in center, warmer near shores
        const centerDist = Math.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2)
        temp = tempRange.max - centerDist * (tempRange.max - tempRange.min) * 0.7
      } else {
        // Summer: warmer in center, cooler near shores due to mixing
        const centerDist = Math.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2)
        temp = tempRange.min + (1 - centerDist) * (tempRange.max - tempRange.min) * 0.8
      }
      
      // Add some noise
      temp += (Math.random() - 0.5) * 1
      temp = Math.max(tempRange.min, Math.min(tempRange.max, temp))
      
      row.push(temp)
    }
    data.push(row)
  }
  
  return {
    data,
    bounds,
    min: tempRange.min,
    max: tempRange.max
  }
}

// Convert temperature data to canvas image
export function temperatureDataToCanvas(
  tempData: number[][],
  min: number,
  max: number,
  width: number = 500,
  height: number = 400
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  
  const imageData = ctx.createImageData(width, height)
  const data = imageData.data
  
  const ny = tempData.length
  const nx = tempData[0].length
  
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      const x = Math.floor((i / width) * nx)
      const y = Math.floor((j / height) * ny)
      
      const temp = tempData[y][x]
      const normalized = (temp - min) / (max - min)
      
      // Use turbo colormap
      const color = turboColormap(normalized)
      
      const index = (j * width + i) * 4
      data[index] = color.r     // Red
      data[index + 1] = color.g // Green
      data[index + 2] = color.b // Blue
      data[index + 3] = 150     // Alpha (more transparent)
    }
  }
  
  ctx.putImageData(imageData, 0, 0)
  return canvas
}

// Turbo colormap implementation
function turboColormap(t: number): { r: number, g: number, b: number } {
  // Clamp t to [0, 1]
  t = Math.max(0, Math.min(1, t))
  
  // Turbo colormap coefficients
  const r = Math.max(0, Math.min(1, 
    34.61 + t * (1172.33 - t * (10793.56 - t * (33300.12 - t * (38394.49 - t * 14825.05))))))
  const g = Math.max(0, Math.min(1,
    23.31 + t * (557.33 + t * (1225.33 - t * (3574.96 - t * (1073.77 + t * 707.56))))))
  const b = Math.max(0, Math.min(1,
    27.2 + t * (3211.1 - t * (12427.0 - t * (18830.0 - t * (12426.0 - t * 2844.0))))))
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

// Create temperature contour lines
export function generateTemperatureContours(
  tempData: number[][],
  min: number,
  max: number,
  interval: number = 2
): Array<{ value: number, points: Array<[number, number]> }> {
  const contours: Array<{ value: number, points: Array<[number, number]> }> = []
  
  for (let temp = min; temp <= max; temp += interval) {
    const points: Array<[number, number]> = []
    
    // Simple contour extraction (would need more sophisticated algorithm for production)
    const ny = tempData.length
    const nx = tempData[0].length
    
    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        const val = tempData[j][i]
        if (Math.abs(val - temp) < interval * 0.1) {
          // Convert grid coordinates to lat/lng
          const lng = 35.55 + (i / nx) * 0.1
          const lat = 32.95 - (j / ny) * 0.3
          points.push([lng, lat])
        }
      }
    }
    
    if (points.length > 0) {
      contours.push({ value: temp, points })
    }
  }
  
  return contours
}
