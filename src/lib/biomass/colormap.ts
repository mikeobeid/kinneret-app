// Colormap utilities for biomass visualization

export interface ColorMap {
  name: string
  colors: string[]
  description: string
}

export const COLOR_MAPS: Record<string, ColorMap> = {
  turbo: {
    name: 'Turbo',
    colors: ['#30123b', '#4662d7', '#36aeb3', '#4ae54a', '#9be34e', '#fcf534', '#fcad2a', '#f74c1a', '#7a0403'],
    description: 'High contrast colormap for scientific visualization'
  },
  viridis: {
    name: 'Viridis',
    colors: ['#440154', '#482777', '#3f4a8a', '#31678e', '#26838f', '#1f9d8a', '#6cce5a', '#b6de2b', '#fee825'],
    description: 'Perceptually uniform colormap'
  },
  plasma: {
    name: 'Plasma',
    colors: ['#0d0887', '#46039f', '#7201a8', '#9c179e', '#bd3786', '#d8576b', '#ed7953', '#fb9f3a', '#f0f921'],
    description: 'Perceptually uniform colormap with high contrast'
  },
  biomass: {
    name: 'Biomass',
    colors: ['#ffffff', '#e6f3ff', '#b3d9ff', '#80bfff', '#4da6ff', '#1a8cff', '#0073e6', '#0059b3', '#003f80'],
    description: 'Custom colormap for phytoplankton biomass'
  }
}

export function interpolateColor(value: number, colorMap: string[]): string {
  const clampedValue = Math.max(0, Math.min(1, value))
  const scaledValue = clampedValue * (colorMap.length - 1)
  const index = Math.floor(scaledValue)
  const fraction = scaledValue - index

  if (index >= colorMap.length - 1) {
    return colorMap[colorMap.length - 1]
  }

  const color1 = hexToRgb(colorMap[index])
  const color2 = hexToRgb(colorMap[index + 1])

  if (!color1 || !color2) {
    return colorMap[index]
  }

  const r = Math.round(color1.r + (color2.r - color1.r) * fraction)
  const g = Math.round(color1.g + (color2.g - color1.g) * fraction)
  const b = Math.round(color1.b + (color2.b - color1.b) * fraction)

  return `rgb(${r}, ${g}, ${b})`
}

export function hexToRgb(hex: string): { r: number, g: number, b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

export function getBiomassColor(value: number, min: number, max: number, colorMap: string = 'biomass'): string {
  const normalizedValue = (value - min) / (max - min)
  return interpolateColor(normalizedValue, COLOR_MAPS[colorMap].colors)
}

// Generate color scale for legend
export function generateColorScale(
  min: number,
  max: number,
  steps: number = 10,
  colorMap: string = 'biomass'
): Array<{ value: number, color: string }> {
  const scale: Array<{ value: number, color: string }> = []
  
  for (let i = 0; i <= steps; i++) {
    const value = min + (i / steps) * (max - min)
    const color = getBiomassColor(value, min, max, colorMap)
    scale.push({ value, color })
  }
  
  return scale
}

// Create gradient background for legend
export function createGradientBackground(
  width: number,
  height: number,
  colorMap: string = 'biomass'
): string {
  const colors = COLOR_MAPS[colorMap].colors
  const gradient = colors.map((color, index) => 
    `${color} ${(index / (colors.length - 1)) * 100}%`
  ).join(', ')
  
  return `linear-gradient(to right, ${gradient})`
}
