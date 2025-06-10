
import React from 'react'
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, FileText, Upload, Loader2, AlertCircle } from 'lucide-react'

const KnowledgePage = () => {
  const { items, isLoading, error } = useKnowledgeBase()
  const { isAdmin } = useAuth()

  console.log('KnowledgePage rendered - items:', items?.length, 'loading:', isLoading, 'error:', error)

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-gray-600">Cargando base de conocimiento...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p>Error cargando la base de conocimiento: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Base de Conocimiento</h1>
          <p className="text-gray-600">
            {items?.length > 0 
              ? `${items.length} documento${items.length === 1 ? '' : 's'} disponible${items.length === 1 ? '' : 's'}`
              : 'Gestiona el contenido de la base de conocimiento'
            }
          </p>
        </div>
        
        {isAdmin && (
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Subir Documento
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Contenido
            </Button>
          </div>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar en la base de conocimiento..."
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {!items || items.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Base de conocimiento vacía
              </h3>
              <p className="text-gray-600 mb-6">
                {isAdmin 
                  ? 'Comienza subiendo documentos o agregando contenido manualmente.'
                  : 'Los administradores pueden agregar documentos a la base de conocimiento.'
                }
              </p>
              {isAdmin && (
                <div className="flex justify-center space-x-3">
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Subir Primer Documento
                  </Button>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Contenido
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Proyecto: {item.project} • Creado: {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.file_url && (
                      <Badge variant="secondary">
                        <FileText className="w-3 h-3 mr-1" />
                        Archivo
                      </Badge>
                    )}
                    <Badge variant={item.active ? "default" : "secondary"}>
                      {item.active ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 line-clamp-3">
                  {item.content.substring(0, 200)}
                  {item.content.length > 200 && '...'}
                </p>
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {item.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default KnowledgePage
