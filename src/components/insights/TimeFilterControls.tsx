
import React from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Filter } from 'lucide-react'
import { format } from 'date-fns'

interface TimeFilterControlsProps {
  selectedPeriod: string
  onPeriodChange: (period: string) => void
  customDateRange?: { from: Date | null; to: Date | null }
  onCustomDateChange?: (range: { from: Date | null; to: Date | null }) => void
}

export const TimeFilterControls: React.FC<TimeFilterControlsProps> = ({
  selectedPeriod,
  onPeriodChange,
  customDateRange,
  onCustomDateChange
}) => {
  const predefinedPeriods = [
    { value: '7d', label: 'Últimos 7 días' },
    { value: '30d', label: 'Últimos 30 días' },
    { value: '90d', label: 'Últimos 3 meses' },
    { value: '6m', label: 'Últimos 6 meses' },
    { value: '1y', label: 'Último año' },
    { value: 'custom', label: 'Rango personalizado' }
  ]

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium">Período:</span>
      </div>
      
      <Select value={selectedPeriod} onValueChange={onPeriodChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Seleccionar período" />
        </SelectTrigger>
        <SelectContent>
          {predefinedPeriods.map((period) => (
            <SelectItem key={period.value} value={period.value}>
              {period.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedPeriod === 'custom' && customDateRange && onCustomDateChange && (
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customDateRange.from ? (
                  customDateRange.to ? (
                    `${format(customDateRange.from, "MMM dd")} - ${format(customDateRange.to, "MMM dd, yyyy")}`
                  ) : (
                    format(customDateRange.from, "MMM dd, yyyy")
                  )
                ) : (
                  "Seleccionar fechas"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={customDateRange.from || new Date()}
                selected={{
                  from: customDateRange.from || undefined,
                  to: customDateRange.to || undefined
                }}
                onSelect={(range) => {
                  onCustomDateChange({
                    from: range?.from || null,
                    to: range?.to || null
                  })
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  )
}
