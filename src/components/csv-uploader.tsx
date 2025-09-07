import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react'

interface CsvUploaderProps {
  title?: string
  description?: string
  onFileSelect: (file: File) => void
  onClear?: () => void
  isProcessing?: boolean
  status?: 'idle' | 'success' | 'error'
  errorMessage?: string
  acceptedFileTypes?: string[]
  maxFileSize?: number
  className?: string
}

export function CsvUploader({
  title = 'Upload CSV File',
  description = 'Drag and drop a CSV file here, or click to select',
  onFileSelect,
  onClear,
  isProcessing = false,
  status = 'idle',
  errorMessage,
  acceptedFileTypes = ['.csv'],
  maxFileSize = 5 * 1024 * 1024, // 5MB
  className = ''
}: CsvUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      onFileSelect(file)
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': acceptedFileTypes,
      'application/csv': acceptedFileTypes
    },
    maxSize: maxFileSize,
    multiple: false,
    disabled: isProcessing
  })

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-600" />
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-600" />
      default:
        return <Upload className="h-8 w-8 text-muted-foreground" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-dashed border-2 border-muted-foreground/25'
    }
  }

  return (
    <Card className={`rounded-2xl shadow-sm ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          {...getRootProps()}
          className={`
            relative p-8 text-center rounded-xl cursor-pointer transition-colors
            ${getStatusColor()}
            ${isDragActive ? 'border-primary bg-primary/5' : ''}
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted/50'}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-3">
            {getStatusIcon()}
            
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {isProcessing 
                  ? 'Processing file...' 
                  : isDragActive 
                    ? 'Drop the file here' 
                    : 'Click to upload or drag and drop'
                }
              </p>
              <p className="text-xs text-muted-foreground">
                {acceptedFileTypes.join(', ')} files up to {(maxFileSize / 1024 / 1024).toFixed(1)}MB
              </p>
            </div>
          </div>
        </div>

        {status === 'error' && errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {status === 'success' && onClear && (
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">File uploaded successfully</span>
            </div>
            <Button
              onClick={onClear}
              variant="ghost"
              size="sm"
              className="text-green-600 hover:text-green-700 hover:bg-green-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
