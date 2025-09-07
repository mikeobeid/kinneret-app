import React, { useEffect } from 'react'
import { useKinneretStore } from '@/store/kinneret-store'
import { KinneretDataSchema } from '@/lib/schemas'
import kinneretData from '@/data/kinneret.json'

interface DataProviderProps {
  children: React.ReactNode
}

export function DataProvider({ children }: DataProviderProps) {
  const { loadData, setLoading, setError } = useKinneretStore()

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Validate the seed data
        const validatedData = KinneretDataSchema.parse(kinneretData)
        loadData(validatedData)
      } catch (error) {
        console.error('Failed to initialize data:', error)
        setError(error instanceof Error ? error.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    initializeData()
  }, [loadData, setLoading, setError])

  return <>{children}</>
}
