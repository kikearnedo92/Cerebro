
import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Globe, TrendingUp, Wifi } from 'lucide-react'

interface DashboardHeaderProps {
  isRealData: boolean
  dataStatusText: string
  loading: boolean
  onRefetch: () => void
  onSyncAmplitude: () => Promise<void>
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isRealData,
  dataStatusText,
  loading,
  onRefetch,
  onSyncAmplitude
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Globe className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">Insights de Retorna B2C</h1>
          <div className="flex items-center gap-2">
            <p className="text-gray-600">Analytics de usuarios de la app de remesas</p>
            <Badge variant={isRealData ? "default" : "secondary"} className="flex items-center gap-1">
              <Wifi className="w-3 h-3" />
              {dataStatusText}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={onSyncAmplitude} 
          variant="outline" 
          size="sm"
          disabled={loading}
        >
          <TrendingUp className="w-4 h-4 mr-1" />
          Actualizar Datos Reales
        </Button>
        <Button onClick={onRefetch} variant="outline" size="sm">
          Refrescar
        </Button>
      </div>
    </div>
  )
}
