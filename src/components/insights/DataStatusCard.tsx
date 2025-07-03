
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, AlertCircle, Wifi, WifiOff, XCircle, Database, Key } from 'lucide-react'
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
          statusText: '✅ DATOS REALES de Amplitude'
        }
      case 'MISSING_CREDENTIALS':
        return {
          icon: Key,
          color: 'text-red-600',
          bgColor: 'border-l-red-500 bg-red-50',
          statusText: '🔑 Credenciales Faltantes'
        }
      case 'API_KEYS_VALID_NO_DATA':
        return {
          icon: Database,
          color: 'text-orange-600',
          bgColor: 'border-l-orange-500 bg-orange-50',
          statusText: '🔧 API Keys Válidos - Sin Datos'
        }
      case 'SYSTEM_ERROR':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'border-l-red-500 bg-red-50',
          statusText: '❌ Error del Sistema'
        }
      case 'PARTIAL_CONNECTION':
        return {
          icon: Wifi,
          color: 'text-blue-600',
          bgColor: 'border-l-blue-500 bg-blue-50',
          statusText: '🔗 Conexión Parcial'
        }
      default:
        return {
          icon: AlertCircle,
          color: 'text-yellow-600',
          bgColor: 'border-l-yellow-500 bg-yellow-50',
          statusText: '⚠️ Estado Desconocido'
        }
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  const hasData = data?.totalActiveUsers && data.totalActiveUsers > 0
  const isRealConnection = data?.status === 'REAL_DATA_FROM_AMPLITUDE'

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
            {data?.status === 'MISSING_CREDENTIALS' && (
              <p className="text-sm text-red-700 mt-1">
                Configure AMPLITUDE_API_KEY y AMPLITUDE_SECRET_KEY en Supabase para ver datos reales
              </p>
            )}
            
            {data?.status === 'API_KEYS_VALID_NO_DATA' && (
              <p className="text-sm text-orange-700 mt-1">
                Credenciales válidas pero sin acceso a datos. Verifique permisos en Amplitude
              </p>
            )}
            
            {data?.status === 'SYSTEM_ERROR' && (
              <p className="text-sm text-red-700 mt-1">
                Error técnico del sistema. Revise los logs para más detalles
              </p>
            )}

            {data?.status === 'REAL_DATA_FROM_AMPLITUDE' && (
              <p className="text-sm text-green-700 mt-1">
                ¡Conectado exitosamente! Datos actualizados desde tu proyecto de Amplitude
              </p>
            )}

            {data?.status === 'PARTIAL_CONNECTION' && (
              <p className="text-sm text-blue-700 mt-1">
                Conexión establecida pero datos limitados disponibles
              </p>
            )}

            {hasData ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <div>
                  <p className={`text-2xl font-bold ${isRealConnection ? 'text-green-600' : 'text-blue-600'}`}>
                    {(data?.totalActiveUsers || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Usuarios Activos {isRealConnection ? '(REAL)' : '(MOCK)'}
                  </p>
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isRealConnection ? 'text-green-600' : 'text-blue-600'}`}>
                    {(data?.newUsersLastMonth || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Nuevos Usuarios {isRealConnection ? '(REAL)' : '(MOCK)'}
                  </p>
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isRealConnection ? 'text-green-600' : 'text-purple-600'}`}>
                    {data?.usabilityScore || 0}/100
                  </p>
                  <p className="text-sm text-gray-600">Score de Usabilidad</p>
                </div>
              </div>
            ) : (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-800 font-medium">
                  ❌ No hay datos disponibles
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Configure las credenciales de Amplitude para ver datos reales
                </p>
              </div>
            )}
            
            {data?.dataSource && (
              <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                <span>Fuente: {data.dataSource}</span>
                <span>•</span>
                <span className={data.apiCallsSuccessful ? 'text-green-600' : 'text-red-600'}>
                  API: {data.apiCallsSuccessful ? 'Exitoso' : 'Falló'}
                </span>
                {data.status === 'REAL_DATA_FROM_AMPLITUDE' && (
                  <>
                    <span>•</span>
                    <span className="text-green-600 font-medium">✅ DATOS REALES</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
