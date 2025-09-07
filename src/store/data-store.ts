import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface TimeSeriesData {
  date: string
  diatoms: number
  dinoflagellates: number
  small_phyto: number
  n_fixers: number
  microcystis: number
}

interface DataStore {
  timeSeriesData: TimeSeriesData[]
  isDataLoaded: boolean
  dataSource: 'default' | 'uploaded'
  loadData: (data: TimeSeriesData[]) => void
  clearData: () => void
  getDataSummary: () => {
    totalRows: number
    dateRange: string
    groups: number
    status: string
  }
}

// Default data for when no data is loaded
const defaultTimeSeriesData: TimeSeriesData[] = [
  { date: '2019-01-01', diatoms: 0.8, dinoflagellates: 0.6, small_phyto: 0.4, n_fixers: 0.3, microcystis: 0.2 },
  { date: '2019-02-01', diatoms: 0.9, dinoflagellates: 0.7, small_phyto: 0.5, n_fixers: 0.4, microcystis: 0.3 },
  { date: '2019-03-01', diatoms: 0.7, dinoflagellates: 0.8, small_phyto: 0.6, n_fixers: 0.5, microcystis: 0.4 },
  { date: '2019-04-01', diatoms: 0.6, dinoflagellates: 0.9, small_phyto: 0.7, n_fixers: 0.6, microcystis: 0.5 },
  { date: '2019-05-01', diatoms: 0.5, dinoflagellates: 0.8, small_phyto: 0.8, n_fixers: 0.7, microcystis: 0.6 },
  { date: '2019-06-01', diatoms: 0.4, dinoflagellates: 0.7, small_phyto: 0.9, n_fixers: 0.8, microcystis: 0.7 },
  { date: '2019-07-01', diatoms: 0.3, dinoflagellates: 0.6, small_phyto: 0.8, n_fixers: 0.9, microcystis: 0.8 },
  { date: '2019-08-01', diatoms: 0.2, dinoflagellates: 0.5, small_phyto: 0.7, n_fixers: 0.8, microcystis: 0.9 },
  { date: '2019-09-01', diatoms: 0.3, dinoflagellates: 0.6, small_phyto: 0.6, n_fixers: 0.7, microcystis: 0.8 },
  { date: '2019-10-01', diatoms: 0.4, dinoflagellates: 0.7, small_phyto: 0.5, n_fixers: 0.6, microcystis: 0.7 },
  { date: '2019-11-01', diatoms: 0.6, dinoflagellates: 0.8, small_phyto: 0.4, n_fixers: 0.5, microcystis: 0.6 },
  { date: '2019-12-01', diatoms: 0.7, dinoflagellates: 0.7, small_phyto: 0.3, n_fixers: 0.4, microcystis: 0.5 },
]

export const useDataStore = create<DataStore>()(
  persist(
    (set, get) => ({
      timeSeriesData: defaultTimeSeriesData,
      isDataLoaded: false,
      dataSource: 'default',
      
      loadData: (data: TimeSeriesData[]) => {
        set({
          timeSeriesData: data,
          isDataLoaded: true,
          dataSource: 'uploaded'
        })
      },
      
      clearData: () => {
        set({
          timeSeriesData: defaultTimeSeriesData,
          isDataLoaded: false,
          dataSource: 'default'
        })
      },
      
      getDataSummary: () => {
        const { timeSeriesData, isDataLoaded, dataSource } = get()
        
        const sortedData = [...timeSeriesData].sort((a, b) => a.date.localeCompare(b.date))
        const dateRange = `${sortedData[0].date} - ${sortedData[sortedData.length - 1].date}`
        
        return {
          totalRows: timeSeriesData.length,
          dateRange,
          groups: 5, // diatoms, dinoflagellates, small_phyto, n_fixers, microcystis
          status: isDataLoaded ? 'Uploaded' : 'Default'
        }
      }
    }),
    {
      name: 'kinneret-data-store',
      partialize: (state) => ({
        timeSeriesData: state.timeSeriesData,
        isDataLoaded: state.isDataLoaded,
        dataSource: state.dataSource
      })
    }
  )
)
