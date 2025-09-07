import { z } from 'zod'

// Phytoplankton group names
export const PHYTOPLANKTON_GROUPS = [
  'diatom',
  'dinoflagellates', 
  'small_phyto',
  'n_fixers',
  'microcystis'
] as const

export type PhytoplanktonGroup = typeof PHYTOPLANKTON_GROUPS[number]

// Group parameters schema
export const GroupParamsSchema = z.object({
  mu: z.number().min(0).max(2), // max growth rate [1/d]
  Rnp: z.number().min(0).max(50), // N:P ratio
  Rfep: z.number().min(0).max(10), // Fe:P ratio
  Rsip: z.number().min(0).max(50), // Si:P ratio
  KsP: z.number().min(0).max(1), // P half-saturation [μM P]
  KsN: z.number().min(0).max(2), // N half-saturation [μM N]
  KsFe: z.number().min(0).max(0.1), // Fe half-saturation [μM Fe]
})

export type GroupParams = z.infer<typeof GroupParamsSchema>

// Time series data point schema
export const TimeSeriesPointSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // ISO date format
  diatom: z.number().min(0),
  dinoflagellates: z.number().min(0),
  small_phyto: z.number().min(0),
  n_fixers: z.number().min(0),
  microcystis: z.number().min(0),
})

export type TimeSeriesPoint = z.infer<typeof TimeSeriesPointSchema>

// Spatial data schema
export const SpatialDataSchema = z.object({
  season: z.enum(['winter', 'summer']),
  url: z.string().min(1), // Allow relative paths, not just full URLs
  min: z.number().min(0),
  max: z.number().min(0),
})

export type SpatialData = z.infer<typeof SpatialDataSchema>

// Nutrients schema
export const NutrientsSchema = z.object({
  P: z.number().min(0).max(10), // Phosphorus [μM]
  N: z.number().min(0).max(10), // Nitrogen [μM]
  Fe: z.number().min(0).max(1), // Iron [μM]
  Si: z.number().min(0).max(10), // Silicon [μM]
})

export type Nutrients = z.infer<typeof NutrientsSchema>

// Main data store schema
export const KinneretDataSchema = z.object({
  groups: z.record(z.enum(PHYTOPLANKTON_GROUPS), GroupParamsSchema),
  timeseries: z.array(TimeSeriesPointSchema),
  spatial: z.array(SpatialDataSchema),
  nutrients: NutrientsSchema,
  metadata: z.object({
    version: z.string(),
    lastUpdated: z.string(),
    description: z.string(),
  }),
})

export type KinneretData = z.infer<typeof KinneretDataSchema>

// CSV upload schema
export const CSVUploadSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  diatom: z.number().min(0),
  dinoflagellates: z.number().min(0),
  small_phyto: z.number().min(0),
  n_fixers: z.number().min(0),
  microcystis: z.number().min(0),
})

export type CSVUpload = z.infer<typeof CSVUploadSchema>

// Store state schema
export const StoreStateSchema = z.object({
  data: KinneretDataSchema,
  isLoading: z.boolean(),
  error: z.string().nullable(),
  selectedGroup: z.enum(PHYTOPLANKTON_GROUPS).optional(),
  selectedDate: z.string().optional(),
})

export type StoreState = z.infer<typeof StoreStateSchema>
