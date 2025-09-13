// Biomass response model for phytoplankton groups

export interface EnvironmentalConditions {
  temperature: number // °C
  windSpeed: number // m/s
  windDirection: number // degrees
  light: number // 0-1 (0 = overcast, 1 = clear)
  phosphorus: number // mmol P/m³
  nitrogen: number // mmol N/m³
  silicon: number // mmol Si/m³ (for diatoms)
  depth: number // m
  month: number // 1-12
}

export interface PhytoplanktonGroup {
  id: string
  name: string
  description: string
  optimalTemp: number // °C
  tempRange: [number, number] // [min, max] °C
  ksP: number // Half-saturation constant for P (mmol P/m³)
  ksN: number // Half-saturation constant for N (mmol N/m³)
  ksSi: number // Half-saturation constant for Si (mmol Si/m³)
  q10: number // Temperature coefficient
  mixingSensitivity: number // 0-1, how much mixing affects growth
  lightSensitivity: number // 0-1, how much light affects growth
  seasonalPattern: number[] // Monthly growth factors (1-12)
}

export const PHYTOPLANKTON_GROUPS: Record<string, PhytoplanktonGroup> = {
  diatoms: {
    id: 'diatoms',
    name: 'Diatoms',
    description: 'Silicate-dependent phytoplankton, thrive in mixing conditions',
    optimalTemp: 18,
    tempRange: [5, 25],
    ksP: 0.1,
    ksN: 0.5,
    ksSi: 2.0,
    q10: 2.0,
    mixingSensitivity: 0.8,
    lightSensitivity: 0.7,
    seasonalPattern: [0.3, 0.4, 0.8, 1.0, 0.9, 0.6, 0.4, 0.3, 0.4, 0.6, 0.8, 0.5]
  },
  dinoflagellates: {
    id: 'dinoflagellates',
    name: 'Dinoflagellates',
    description: 'Flagellated phytoplankton, prefer stratified conditions',
    optimalTemp: 22,
    tempRange: [10, 30],
    ksP: 0.05,
    ksN: 0.3,
    ksSi: 0, // Not silicate dependent
    q10: 1.8,
    mixingSensitivity: -0.5, // Negative = harmed by mixing
    lightSensitivity: 0.9,
    seasonalPattern: [0.2, 0.3, 0.5, 0.7, 0.8, 0.9, 1.0, 0.9, 0.7, 0.5, 0.4, 0.3]
  },
  small_phyto: {
    id: 'small_phyto',
    name: 'Small Phytoplankton',
    description: 'Picoplankton and small nanoplankton, fast growing',
    optimalTemp: 24,
    tempRange: [8, 32],
    ksP: 0.02,
    ksN: 0.1,
    ksSi: 0,
    q10: 2.2,
    mixingSensitivity: 0.3,
    lightSensitivity: 0.8,
    seasonalPattern: [0.4, 0.5, 0.7, 0.8, 0.9, 1.0, 1.0, 0.9, 0.8, 0.7, 0.6, 0.5]
  },
  n_fixers: {
    id: 'n_fixers',
    name: 'N-fixing Cyanobacteria',
    description: 'Nitrogen-fixing cyanobacteria, high temperature optima',
    optimalTemp: 26,
    tempRange: [15, 35],
    ksP: 0.08,
    ksN: 0, // Can fix N2
    ksSi: 0,
    q10: 2.5,
    mixingSensitivity: -0.7,
    lightSensitivity: 0.6,
    seasonalPattern: [0.1, 0.2, 0.3, 0.5, 0.7, 0.9, 1.0, 1.0, 0.8, 0.5, 0.3, 0.2]
  },
  microcystis: {
    id: 'microcystis',
    name: 'Microcystis',
    description: 'Toxic cyanobacteria, forms blooms in warm, stratified water',
    optimalTemp: 28,
    tempRange: [18, 35],
    ksP: 0.06,
    ksN: 0.2,
    ksSi: 0,
    q10: 2.8,
    mixingSensitivity: -0.9,
    lightSensitivity: 0.5,
    seasonalPattern: [0.05, 0.1, 0.2, 0.4, 0.6, 0.8, 1.0, 1.0, 0.7, 0.4, 0.2, 0.1]
  }
}

// Calculate biomass response for a phytoplankton group
export function calculateBiomassResponse(
  group: PhytoplanktonGroup,
  env: EnvironmentalConditions
): number {
  // Temperature response (Q10 function)
  const tempResponse = q10Response(env.temperature, group.optimalTemp, group.q10, group.tempRange)
  
  // Nutrient response (Michaelis-Menten kinetics)
  const pResponse = saturatingResponse(env.phosphorus, group.ksP)
  const nResponse = group.id === 'n_fixers' ? 1.0 : saturatingResponse(env.nitrogen, group.ksN)
  const siResponse = group.ksSi > 0 ? saturatingResponse(env.silicon, group.ksSi) : 1.0
  
  // Light response
  const lightResponse = env.light * group.lightSensitivity + (1 - group.lightSensitivity)
  
  // Mixing response
  const mixingIndex = calculateMixingIndex(env.windSpeed, env.depth)
  const mixingResponse = group.mixingSensitivity > 0 
    ? 1 + group.mixingSensitivity * mixingIndex
    : 1 + group.mixingSensitivity * mixingIndex // Negative sensitivity reduces growth
  
  // Seasonal response
  const seasonalResponse = group.seasonalPattern[env.month - 1] || 1.0
  
  // Combine all factors
  const response = tempResponse * pResponse * nResponse * siResponse * lightResponse * mixingResponse * seasonalResponse
  
  // Ensure non-negative response
  return Math.max(0, response)
}

// Q10 temperature response function
function q10Response(temp: number, optimal: number, q10: number, range: [number, number]): number {
  const [minTemp, maxTemp] = range
  
  // Outside temperature range
  if (temp < minTemp || temp > maxTemp) {
    return 0
  }
  
  // Q10 response around optimal temperature
  const tempDiff = temp - optimal
  const response = Math.pow(q10, tempDiff / 10)
  
  // Apply temperature range constraints
  const rangeFactor = 1 - Math.abs(tempDiff) / Math.max(optimal - minTemp, maxTemp - optimal)
  
  return response * Math.max(0, rangeFactor)
}

// Saturating response function (Michaelis-Menten)
function saturatingResponse(concentration: number, ks: number): number {
  return concentration / (concentration + ks)
}

// Calculate mixing index from wind speed and depth
function calculateMixingIndex(windSpeed: number, depth: number): number {
  // Simple mixing model based on wind speed and depth
  // Higher wind speed and shallower depth = more mixing
  const mixingPotential = (windSpeed ** 2) / depth
  return Math.min(1, mixingPotential / 10) // Normalize to 0-1
}

// Generate biomass heatmap data
export function generateBiomassHeatmap(
  groupId: string,
  env: EnvironmentalConditions,
  width: number = 500,
  height: number = 300
): number[][] {
  console.log('generateBiomassHeatmap called with:', { groupId, env, width, height })
  
  const group = PHYTOPLANKTON_GROUPS[groupId]
  if (!group) {
    console.error(`Unknown phytoplankton group: ${groupId}`)
    throw new Error(`Unknown phytoplankton group: ${groupId}`)
  }
  
  console.log('Using phytoplankton group:', group)
  
  // Test simple calculation first
  const testResponse = calculateBiomassResponse(group, env)
  console.log('Test biomass response:', testResponse)
  
  const heatmap: number[][] = []
  
  // Create spatial grid
  for (let j = 0; j < height; j++) {
    const row: number[] = []
    for (let i = 0; i < width; i++) {
      // Add spatial variation to environmental conditions
      const spatialEnv = {
        ...env,
        temperature: env.temperature + (Math.random() - 0.5) * 2,
        phosphorus: env.phosphorus + (Math.random() - 0.5) * 0.1,
        nitrogen: env.nitrogen + (Math.random() - 0.5) * 0.2,
        silicon: env.silicon + (Math.random() - 0.5) * 0.5,
        light: env.light + (Math.random() - 0.5) * 0.2
      }
      
      const response = calculateBiomassResponse(group, spatialEnv)
      if (isNaN(response) || !isFinite(response)) {
        console.warn('Invalid biomass response:', response, 'for env:', spatialEnv)
      }
      row.push(response)
    }
    heatmap.push(row)
  }
  
  return heatmap
}

// Get biomass units for a group
export function getBiomassUnits(groupId: string): string {
  return 'mmol P/m³' // Standardized to phosphorus units
}

// Get biomass range for a group
export function getBiomassRange(groupId: string): [number, number] {
  // Typical biomass ranges for different groups
  const ranges: Record<string, [number, number]> = {
    diatoms: [0, 0.08],
    dinoflagellates: [0, 0.05],
    small_phyto: [0, 0.03],
    n_fixers: [0, 0.06],
    microcystis: [0, 0.04]
  }
  
  return ranges[groupId] || [0, 0.05]
}
