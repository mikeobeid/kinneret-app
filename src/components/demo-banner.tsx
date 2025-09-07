import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'

export function DemoBanner() {
  return (
    <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertDescription className="text-blue-800 dark:text-blue-200">
        Demo data. Calibrate with 2019 Kinneret monitoring when available.
      </AlertDescription>
    </Alert>
  )
}
