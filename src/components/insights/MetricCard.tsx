
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle, TrendingUp, TrendingDown } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  description: string
  trend?: {
    value: string
    direction: 'up' | 'down' | 'neutral'
  }
  icon?: React.ComponentType<{ className?: string }>
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  isRealData?: boolean
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  trend,
  icon: Icon,
  color = 'blue',
  isRealData = false
}) => {
  const colorClasses = {
    blue: 'text-blue-600 border-blue-200',
    green: 'text-green-600 border-green-200',
    purple: 'text-purple-600 border-purple-200',
    orange: 'text-orange-600 border-orange-200',
    red: 'text-red-600 border-red-200'
  }

  const TrendIcon = trend?.direction === 'up' ? TrendingUp : TrendingDown

  return (
    <Card className={`border-l-4 ${colorClasses[color]} hover:shadow-md transition-shadow`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-800">{title}</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {Icon && <Icon className={`w-5 h-5 ${colorClasses[color].split(' ')[0]}`} />}
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-2xl font-bold ${colorClasses[color].split(' ')[0]}`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {trend && (
              <div className="flex items-center gap-1 mt-1">
                <TrendIcon className={`w-3 h-3 ${
                  trend.direction === 'up' ? 'text-green-500' : 'text-red-500'
                }`} />
                <span className={`text-xs ${
                  trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trend.value}
                </span>
              </div>
            )}
          </div>
          
          <Badge variant={isRealData ? "default" : "secondary"} className="text-xs">
            {isRealData ? 'REAL' : 'DEMO'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
