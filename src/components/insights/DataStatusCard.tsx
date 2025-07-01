
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, AlertCircle } from 'lucide-react'
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
  const StatusIcon = isRealData ? CheckCircle : AlertCircle
  const dataStatusColor = isRealData ? 'text-green-600' : 'text-orange-600'

  return (
    <Card className={`border-l-4 ${isRealData ? 'border-l-green-500 bg-green-50' : 'border-l-orange-500 bg-orange-50'}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <StatusIcon className={`w-6 h-6 ${dataStatusColor}`} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{dataStatusText}</h3>
              {data?.fetchedAt && (
                <span className="text-sm text-gray-500">
                  • Actualizado: {new Date(data.fetchedAt).toLocaleTimeString()}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div>
                <p className="text-2xl font-bold text-blue-600">{(data?.totalActiveUsers || 0).toLocaleString()}</p>
                <p className="text-sm text-gray-600">Usuarios Activos (REAL)</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{(data?.newUsersLastMonth || 0).toLocaleString()}</p>
                <p className="text-sm text-gray-600">Nuevos Usuarios (REAL)</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{data?.usabilityScore || 0}/100</p>
                <p className="text-sm text-gray-600">Score de Usabilidad</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
