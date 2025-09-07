import { CSVUpload, CSVUploadSchema } from './schemas'

export const parseCSV = (csvText: string): CSVUpload[] => {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row')
  }
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  const requiredHeaders = ['date', 'diatom', 'dinoflagellates', 'small_phyto', 'n_fixers', 'microcystis']
  
  // Validate headers
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`)
  }
  
  const data: CSVUpload[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    
    if (values.length !== headers.length) {
      throw new Error(`Row ${i + 1} has ${values.length} columns, expected ${headers.length}`)
    }
    
    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header] = values[index]
    })
    
    // Convert to proper types
    const csvRow: CSVUpload = {
      date: row.date,
      diatom: parseFloat(row.diatom),
      dinoflagellates: parseFloat(row.dinoflagellates),
      small_phyto: parseFloat(row.small_phyto),
      n_fixers: parseFloat(row.n_fixers),
      microcystis: parseFloat(row.microcystis),
    }
    
    // Validate the row
    try {
      CSVUploadSchema.parse(csvRow)
      data.push(csvRow)
    } catch (error) {
      throw new Error(`Row ${i + 1} validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  return data
}

export const generateCSVTemplate = (): string => {
  const headers = ['date', 'diatom', 'dinoflagellates', 'small_phyto', 'n_fixers', 'microcystis']
  const sampleRow = ['2019-01-01', '0.045', '0.012', '0.023', '0.008', '0.003']
  
  return [headers.join(','), sampleRow.join(',')].join('\n')
}

export const downloadFile = (content: string, filename: string, mimeType: string = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string)
      } else {
        reject(new Error('Failed to read file'))
      }
    }
    reader.onerror = () => reject(new Error('File reading error'))
    reader.readAsText(file)
  })
}
