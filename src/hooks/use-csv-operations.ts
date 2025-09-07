import { useCallback } from 'react'
import { useKinneretStore } from '@/store/kinneret-store'
import { parseCSV, generateCSVTemplate, downloadFile, readFileAsText } from '@/lib/csv-utils'

export function useCSVOperations() {
  const { importCSV, exportJSON, exportCSV, setError } = useKinneretStore()

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      setError(null)
      const fileContent = await readFileAsText(file)
      const csvData = parseCSV(fileContent)
      importCSV(csvData)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process CSV file')
    }
  }, [importCSV, setError])

  const handleExportJSON = useCallback(() => {
    try {
      const jsonData = exportJSON()
      downloadFile(jsonData, 'kinneret-data.json', 'application/json')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to export JSON')
    }
  }, [exportJSON, setError])

  const handleExportCSV = useCallback(() => {
    try {
      const csvData = exportCSV()
      downloadFile(csvData, 'kinneret-data.csv', 'text/csv')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to export CSV')
    }
  }, [exportCSV, setError])

  const downloadTemplate = useCallback(() => {
    try {
      const template = generateCSVTemplate()
      downloadFile(template, 'kinneret-template.csv', 'text/csv')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate template')
    }
  }, [setError])

  return {
    handleFileUpload,
    handleExportJSON,
    handleExportCSV,
    downloadTemplate,
  }
}
