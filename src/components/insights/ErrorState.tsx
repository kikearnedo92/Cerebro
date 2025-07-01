
import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface ErrorStateProps {
  error: string
  onRetry: () => void
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-600 mb-4">Error al cargar datos REALES de Amplitude</p>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <Button onClick={onRetry} variant="outline">Reintentar Conexión</Button>
      </div>
    </div>
  )
}
