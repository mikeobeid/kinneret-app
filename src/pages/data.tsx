import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Download, FileText, CheckCircle, AlertCircle, X, Database } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { useDataStore, TimeSeriesData } from '@/store/data-store'

// Mock data for the table
const mockData = [
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

const requiredColumns = ['date', 'diatoms', 'dinoflagellates', 'small_phyto', 'n_fixers', 'microcystis']

export function DataPage() {
  const { timeSeriesData, loadData, clearData, isDataLoaded, dataSource, getDataSummary } = useDataStore()
  const dataSummary = getDataSummary()
  
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Use store data directly instead of local state
  const uploadedData = timeSeriesData

  const handleClearData = () => {
    clearData()
    setUploadStatus('idle')
    setErrorMessage('')
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setIsProcessing(true)
    setUploadStatus('idle')

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string
        const lines = csv.split('\n').filter(line => line.trim())
        
        if (lines.length < 2) {
          throw new Error('CSV file must contain at least a header and one data row')
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
        
        // Validate required columns
        const missingColumns = requiredColumns.filter(col => !headers.includes(col))
        if (missingColumns.length > 0) {
          throw new Error(`Missing required columns: ${missingColumns.join(', ')}`)
        }

        // Parse data rows
        const data = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(v => v.trim())
          const row: any = {}
          
          headers.forEach((header, i) => {
            if (requiredColumns.includes(header)) {
              const value = values[i]
              if (header === 'date') {
                // Validate date format (YYYY-MM-DD)
                if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                  throw new Error(`Invalid date format in row ${index + 2}: ${value}. Expected YYYY-MM-DD`)
                }
                row[header] = value
              } else {
                // Validate numeric values
                const numValue = parseFloat(value)
                if (isNaN(numValue)) {
                  throw new Error(`Invalid numeric value in row ${index + 2}, column ${header}: ${value}`)
                }
                row[header] = numValue
              }
            }
          })
          
          return row
        })

        loadData(data)
        setUploadStatus('success')
        setErrorMessage('')
      } catch (error) {
        setUploadStatus('error')
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred')
      } finally {
        setIsProcessing(false)
      }
    }

    reader.readAsText(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    multiple: false
  })

  const exportToJSON = () => {
    const dataStr = JSON.stringify(uploadedData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'kinneret-data.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportToCSV = () => {
    const headers = requiredColumns
    const csvContent = [
      headers.join(','),
      ...uploadedData.map(row => 
        headers.map(header => row[header] || '').join(',')
      )
    ].join('\n')
    
    const dataBlob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'kinneret-data.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const loadDataIntoApp = () => {
    const typedData: TimeSeriesData[] = uploadedData.map(row => ({
      date: row.date,
      diatoms: row.diatoms,
      dinoflagellates: row.dinoflagellates,
      small_phyto: row.small_phyto,
      n_fixers: row.n_fixers,
      microcystis: row.microcystis
    }))
    
    loadData(typedData)
    setUploadStatus('success')
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Data Management</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Upload, validate, and export phytoplankton data
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Upload Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Data</CardTitle>
              <CardDescription>
                Upload CSV files with phytoplankton data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-primary bg-primary/5' 
                    : uploadStatus === 'success'
                    ? 'border-green-500 bg-green-50 dark:bg-green-950'
                    : uploadStatus === 'error'
                    ? 'border-red-500 bg-red-50 dark:bg-red-950'
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="space-y-4">
                  {isProcessing ? (
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  ) : uploadStatus === 'success' ? (
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                  ) : uploadStatus === 'error' ? (
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                  ) : (
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                  )}
                  
                  <div>
                    <p className="text-lg font-medium">
                      {isProcessing 
                        ? 'Processing...' 
                        : uploadStatus === 'success'
                        ? 'Upload Successful!'
                        : uploadStatus === 'error'
                        ? 'Upload Failed'
                        : isDragActive
                        ? 'Drop the file here'
                        : 'Drag & drop a CSV file here'
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">
                      or click to select a file
                    </p>
                  </div>
                </div>
              </div>

              {uploadStatus === 'error' && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              {uploadStatus === 'success' && (
                <Alert className="mt-4">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Data uploaded successfully! {uploadedData.length} rows processed.
                    {!isDataLoaded && (
                      <div className="mt-2">
                        <Button onClick={loadDataIntoApp} size="sm" className="mt-2">
                          <Database className="mr-2 h-4 w-4" />
                          Load into App
                        </Button>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {isDataLoaded && (
                <Alert className="mt-4">
                  <Database className="h-4 w-4" />
                  <AlertDescription>
                    Data is loaded in the app! ({dataSource} data)
                    <Button onClick={handleClearData} variant="outline" size="sm" className="ml-2">
                      Clear Data
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Required Format */}
          <Card>
            <CardHeader>
              <CardTitle>Required Format</CardTitle>
              <CardDescription>
                CSV file must contain these columns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Required columns:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {requiredColumns.map((column) => (
                    <Badge key={column} variant="outline" className="text-xs">
                      {column}
                    </Badge>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Date format: YYYY-MM-DD</p>
                  <p>• Numeric values for phytoplankton groups</p>
                  <p>• First row must be headers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Data Preview</CardTitle>
                  <CardDescription>
                    {uploadedData.length} rows of data
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={exportToCSV} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    CSV
                  </Button>
                  <Button onClick={exportToJSON} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    JSON
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {requiredColumns.map((column) => (
                        <th key={column} className="text-left p-2 font-medium">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {uploadedData.slice(0, 10).map((row, index) => (
                      <tr key={index} className="border-b">
                        {requiredColumns.map((column) => (
                          <td key={column} className="p-2">
                            {typeof row[column] === 'number' 
                              ? row[column].toFixed(2) 
                              : row[column]
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {uploadedData.length > 10 && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Showing first 10 rows of {uploadedData.length} total
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Data Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Data Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Rows</p>
                  <p className="font-medium">{dataSummary.totalRows}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date Range</p>
                  <p className="font-medium">{dataSummary.dateRange}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Groups</p>
                  <p className="font-medium">{dataSummary.groups}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <div className="font-medium">
                    <Badge variant={isDataLoaded ? "default" : "outline"}>
                      {dataSummary.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}