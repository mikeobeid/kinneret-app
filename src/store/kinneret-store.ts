import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { 
  KinneretData, 
  KinneretDataSchema, 
  GroupParams, 
  Nutrients, 
  PhytoplanktonGroup,
  TimeSeriesPoint,
  CSVUpload,
  CSVUploadSchema
} from '@/lib/schemas'
import kinneretData from '@/data/kinneret.json'

interface KinneretStore {
  // State
  data: KinneretData
  isLoading: boolean
  error: string | null
  selectedGroup: PhytoplanktonGroup | null
  selectedDate: string | null
  
  // Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSelectedGroup: (group: PhytoplanktonGroup | null) => void
  setSelectedDate: (date: string | null) => void
  
  // Group parameters
  updateGroupParams: (group: PhytoplanktonGroup, params: Partial<GroupParams>) => void
  resetGroupParams: (group: PhytoplanktonGroup) => void
  
  // Nutrients
  updateNutrients: (nutrients: Partial<Nutrients>) => void
  resetNutrients: () => void
  
  // Time series
  addTimeSeriesPoint: (point: TimeSeriesPoint) => void
  updateTimeSeriesPoint: (date: string, point: Partial<TimeSeriesPoint>) => void
  removeTimeSeriesPoint: (date: string) => void
  
  // CSV operations
  importCSV: (csvData: CSVUpload[]) => void
  exportJSON: () => string
  exportCSV: () => string
  
  // Data management
  resetData: () => void
  loadData: (data: KinneretData) => void
}

// Model calculations
export const calculateGrowth = (
  group: PhytoplanktonGroup,
  params: GroupParams,
  nutrients: Nutrients
): number => {
  const { mu, KsP, KsN, KsFe, Rsip } = params
  const { P, N, Fe, Si } = nutrients
  
  // Growth rate calculation based on limiting nutrient
  const pGrowth = P / (KsP + P)
  const nGrowth = N / (KsN + N)
  const feGrowth = Fe / (KsFe + Fe)
  const siGrowth = Rsip > 0 ? Si / (Rsip + Si) : 1
  
  // Return minimum of all growth factors (Liebig's law)
  return mu * Math.min(pGrowth, nGrowth, feGrowth, siGrowth)
}

export const calculateBiomass = (
  currentBiomass: number,
  growth: number,
  mortality: number = 0.02
): number => {
  return currentBiomass * (1 + growth - mortality)
}

export const useKinneretStore = create<KinneretStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        data: kinneretData as KinneretData,
        isLoading: false,
        error: null,
        selectedGroup: null,
        selectedDate: null,
        
        // Basic setters
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
        setSelectedGroup: (group) => set({ selectedGroup: group }),
        setSelectedDate: (date) => set({ selectedDate: date }),
        
        // Group parameters
        updateGroupParams: (group, params) => set((state) => {
          if (state.data.groups[group]) {
            state.data.groups[group] = { ...state.data.groups[group], ...params }
          }
        }),
        
        resetGroupParams: (group) => set((state) => {
          const originalData = kinneretData as KinneretData
          if (state.data.groups[group] && originalData.groups[group]) {
            state.data.groups[group] = { ...originalData.groups[group] }
          }
        }),
        
        // Nutrients
        updateNutrients: (nutrients) => set((state) => {
          state.data.nutrients = { ...state.data.nutrients, ...nutrients }
        }),
        
        resetNutrients: () => set((state) => {
          const originalData = kinneretData as KinneretData
          state.data.nutrients = { ...originalData.nutrients }
        }),
        
        // Time series
        addTimeSeriesPoint: (point) => set((state) => {
          // Validate the point
          const validatedPoint = CSVUploadSchema.parse(point)
          const timeSeriesPoint: TimeSeriesPoint = {
            date: validatedPoint.date,
            diatom: validatedPoint.diatom,
            dinoflagellates: validatedPoint.dinoflagellates,
            small_phyto: validatedPoint.small_phyto,
            n_fixers: validatedPoint.n_fixers,
            microcystis: validatedPoint.microcystis,
          }
          
          // Check if date already exists
          const existingIndex = state.data.timeseries.findIndex(p => p.date === point.date)
          if (existingIndex >= 0) {
            state.data.timeseries[existingIndex] = timeSeriesPoint
          } else {
            state.data.timeseries.push(timeSeriesPoint)
            // Sort by date
            state.data.timeseries.sort((a, b) => a.date.localeCompare(b.date))
          }
        }),
        
        updateTimeSeriesPoint: (date, point) => set((state) => {
          const index = state.data.timeseries.findIndex(p => p.date === date)
          if (index >= 0) {
            state.data.timeseries[index] = { ...state.data.timeseries[index], ...point }
          }
        }),
        
        removeTimeSeriesPoint: (date) => set((state) => {
          state.data.timeseries = state.data.timeseries.filter(p => p.date !== date)
        }),
        
        // CSV operations
        importCSV: (csvData) => set((state) => {
          try {
            // Validate all CSV data
            const validatedData = csvData.map(row => CSVUploadSchema.parse(row))
            
            // Convert to time series points
            const timeSeriesPoints: TimeSeriesPoint[] = validatedData.map(row => ({
              date: row.date,
              diatom: row.diatom,
              dinoflagellates: row.dinoflagellates,
              small_phyto: row.small_phyto,
              n_fixers: row.n_fixers,
              microcystis: row.microcystis,
            }))
            
            // Replace existing time series data
            state.data.timeseries = timeSeriesPoints.sort((a, b) => a.date.localeCompare(b.date))
            
            // Update metadata
            state.data.metadata.lastUpdated = new Date().toISOString()
            state.data.metadata.version = '1.1.0'
            
            state.error = null
          } catch (error) {
            state.error = `CSV validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        }),
        
        exportJSON: () => {
          const state = get()
          return JSON.stringify(state.data, null, 2)
        },
        
        exportCSV: () => {
          const state = get()
          const headers = ['date', 'diatom', 'dinoflagellates', 'small_phyto', 'n_fixers', 'microcystis']
          const csvRows = [headers.join(',')]
          
          state.data.timeseries.forEach(point => {
            const row = [
              point.date,
              point.diatom.toString(),
              point.dinoflagellates.toString(),
              point.small_phyto.toString(),
              point.n_fixers.toString(),
              point.microcystis.toString(),
            ]
            csvRows.push(row.join(','))
          })
          
          return csvRows.join('\n')
        },
        
        // Data management
        resetData: () => set((state) => {
          state.data = kinneretData as KinneretData
          state.error = null
        }),
        
        loadData: (data) => set((state) => {
          try {
            const validatedData = KinneretDataSchema.parse(data)
            state.data = validatedData
            state.error = null
          } catch (error) {
            state.error = `Data validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        }),
      })),
      {
        name: 'kinneret-store',
        partialize: (state) => ({
          data: state.data,
          selectedGroup: state.selectedGroup,
          selectedDate: state.selectedDate,
        }),
      }
    ),
    {
      name: 'kinneret-store',
    }
  )
)

// Selectors for common use cases
export const useGroupParams = (group: PhytoplanktonGroup) => 
  useKinneretStore(state => state.data.groups[group])

export const useNutrients = () => 
  useKinneretStore(state => state.data.nutrients)

export const useTimeSeries = () => 
  useKinneretStore(state => state.data.timeseries)

export const useSpatialData = () => 
  useKinneretStore(state => state.data.spatial)

export const useSelectedGroup = () => 
  useKinneretStore(state => state.selectedGroup)

export const useStoreError = () => 
  useKinneretStore(state => state.error)
