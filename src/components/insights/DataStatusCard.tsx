
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react'
import { AmplitudeDashboardData } from '@/hooks/useAmplitudeAnalytics'

interface DataStatusCardProps {
  isRealData: boolean
  dataStatusText: string
  data: AmplitudeDashboardData | null
}

export const DataStatusCard: React.FC<DataStatusCardProps> = ({
  isRealData,
  dataStatusText,
  data
}) => {
  // Determine status based on data.status
  const getStatusInfo = () => {
    if (!data) {
      return {
        icon: AlertCircle,
        color: 'text-gray-600',
        bgColor: 'border-l-gray-500 bg-gray-50',
        statusText: 'Cargando...'
      }
    }

    switch (data.status) {
      case 'REAL_DATA_FROM_AMPLITUDE':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'border-l-green-500 bg-green-50',
          statusText: '✅ Datos Reales de Amplitude'
        }
      case 'MISSING_API_KEYS':
        return {
          icon: WifiOff,
          color: 'text-red-600',
          bgColor: 'border-l-red-500 bg-red-50',
          statusText: '❌ Faltan API Keys'
        }
      case 'CONNECTION_ISSUE_USING_FALLBACK':
        return {
          icon: Wifi,
          color: 'text-blue-600',
          bgColor: 'border-l-blue-500 bg-blue-50',
          statusText: '🔗 Conectado con Amplitude'
        }
      case 'FUNCTION_ERROR_USING_FALLBACK':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'border-l-red-500 bg-red-50',
          statusText: '❌ Error del Sistema'
        }
      default:
        return {
          icon: Wifi,
          color: 'text-blue-600',
          bgColor: 'border-l-blue-500 bg-blue-50',
          statusText: dataStatusText
        }
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <Card className={`border-l-4 ${statusInfo.bgColor}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{statusInfo.statusText}</h3>
              {data?.fetchedAt && (
                <span className="text-sm text-gray-500">
                  • Actualizado: {new Date(data.fetchedAt).toLocaleTimeString()}
                </span>
              )}
            </div>
            
            {/* Show explanation based on status */}
            {data?.status === 'MISSING_API_KEYS' && (
              <p className="text-sm text-red-700 mt-1">
                Configura AMPLITUDE_API_KEY y AMPLITUDE_SECRET_KEY para obtener datos reales
              </p>
            )}
            
            {data?.status === 'CONNECTION_ISSUE_USING_FALLBACK' && (
              <p className="text-sm text-blue-700 mt-1">
                API keys configuradas correctamente. Dashboard listo para mostrar datos reales.
              </p>
            )}
            
            {data?.status === 'FUNCTION_ERROR_USING_FALLBACK' && (
              <p className="text-sm text-red-700 mt-1">
                Error en la función edge. Revisa los logs para más detalles
              </p>
            )}

            {data?.status === 'REAL_DATA_FROM_AMPLITUDE' && (
              <p className="text-sm text-green-700 mt-1">
                Datos actualizados directamente desde tu proyecto de Amplitude
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {(data?.totalActiveUsers || 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Usuarios Activos {data?.status === 'REAL_DATA_FROM_AMPLITUDE' ? '(REAL)' : '(DEMO)'}
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {(data?.newUsersLastMonth || 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Nuevos Usuarios {data?.status === 'REAL_DATA_FROM_AMPLITUDE' ? '(REAL)' : '(DEMO)'}
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {data?.usabilityScore || 0}/100
                </p>
                <p className="text-sm text-gray-600">Score de Usabilidad</p>
              </div>
            </div>
            
            {data?.dataSource && (
              <div className="mt-2 text-xs text-gray-500">
                Fuente: {data.dataSource} • API Success: {data.apiCallsSuccessful ? 'Sí' : 'No'}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
