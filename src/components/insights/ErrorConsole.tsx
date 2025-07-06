
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Eye, EyeOff, Copy, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ErrorLog {
  timestamp: string
  level: 'error' | 'warning' | 'info'
  message: string
  details?: any
}

interface ErrorConsoleProps {
  errors: ErrorLog[]
  onClear: () => void
}

export const ErrorConsole: React.FC<ErrorConsoleProps> = ({ errors, onClear }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [expandedError, setExpandedError] = useState<number | null>(null)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (errors.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isVisible ? (
        <Button
          onClick={() => setIsVisible(true)}
          variant="destructive"
          size="sm"
          className="rounded-full shadow-lg"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          {errors.length} Error{errors.length > 1 ? 'es' : ''}
        </Button>
      ) : (
        <Card className="w-80 max-h-96 overflow-hidden shadow-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Console de Errores ({errors.length})
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  onClick={onClear}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
                <Button
                  onClick={() => setIsVisible(false)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <EyeOff className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-2 max-h-72 overflow-y-auto">
            <div className="space-y-2">
              {errors.map((error, index) => (
                <div
                  key={index}
                  className={`p-2 rounded border text-xs ${getLevelColor(error.level)}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="text-xs">
                      {error.level.toUpperCase()}
                    </Badge>
                    <span className="text-xs opacity-70">
                      {new Date(error.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="font-medium mb-1">{error.message}</div>
                  
                  {error.details && (
                    <div>
                      <Button
                        onClick={() => setExpandedError(expandedError === index ? null : index)}
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1 text-xs"
                      >
                        {expandedError === index ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        Detalles
                      </Button>
                      
                      {expandedError === index && (
                        <div className="mt-1 p-2 bg-white/50 rounded text-xs">
                          <pre className="whitespace-pre-wrap break-all">
                            {typeof error.details === 'string' 
                              ? error.details 
                              : JSON.stringify(error.details, null, 2)
                            }
                          </pre>
                          <Button
                            onClick={() => copyToClipboard(
                              typeof error.details === 'string' 
                                ? error.details 
                                : JSON.stringify(error.details, null, 2)
                            )}
                            variant="ghost"
                            size="sm"
                            className="h-5 px-1 text-xs mt-1"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copiar
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
