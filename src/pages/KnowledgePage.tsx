
import React, { useState } from 'react'
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, FileText, Upload, Loader2, AlertCircle, CheckCircle, Edit, Trash2, Eye, MoreVertical } from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { toast } from '@/hooks/use-toast'
import QuickFileUpload from '@/components/admin/QuickFileUpload'

const KnowledgePage = () => {
  const { items, isLoading, error, deleteItem, toggleActive } = useKnowledgeBase()
  const { isAdmin } = useAuth()
  const [showUpload, setShowUpload] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

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

  // Filter documents based on search term
  const filteredItems = items?.filter(item => {
    if (!searchTerm) return true
    return item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
           item.project.toLowerCase().includes(searchTerm.toLowerCase())
  }) || []

  const handleDeleteDocument = async (id: string, title: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar "${title}"?`)) {
      try {
        await deleteItem(id)
        toast({
          title: "Documento eliminado",
          description: "El documento se ha eliminado correctamente"
        })
      } catch (error) {
        console.error('Error deleting document:', error)
      }
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await toggleActive(id, !currentStatus)
    } catch (error) {
      console.error('Error toggling document status:', error)
    }
  }

  // Clean up document title for display
  const getCleanTitle = (item: any) => {
    if (item.title.includes('.pdf') || item.title.includes('.docx') || item.title.includes('.txt')) {
      return item.title.replace(/\.[^/.]+$/, "").replace(/^b5091918-c9da-4167-94d9-[a-f0-9-]+_/, "")
    }
    return item.title
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Base de Conocimiento - Retorna</h1>
          <p className="text-gray-600">
            {filteredItems.length > 0 
              ? `${filteredItems.length} documento${filteredItems.length === 1 ? '' : 's'} disponible${filteredItems.length === 1 ? '' : 's'}`
              : 'Gestiona el contenido de la base de conocimiento'
            }
          </p>
        </div>
        
        {isAdmin && (
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline"
              onClick={() => setShowUpload(!showUpload)}
            >
              <Upload className="w-4 h-4 mr-2" />
              {showUpload ? 'Ocultar Upload' : 'Subir Documento'}
            </Button>
          </div>
        )}
      </div>

      {/* Status Info */}
      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <CheckCircle className="w-4 h-4 text-blue-500" />
        <span className="text-sm text-blue-700">
          Sistema real activado - Documentos procesados con IA - Storage en Supabase
        </span>
      </div>

      {/* Quick Upload Component */}
      {isAdmin && showUpload && (
        <QuickFileUpload />
      )}

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar en la base de conocimiento..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {!filteredItems || filteredItems.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron documentos' : 'Base de conocimiento lista para usar'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda.'
                  : isAdmin 
                    ? 'Comienza subiendo documentos PDF, Word o TXT. El sistema procesará automáticamente el contenido.'
                    : 'Los administradores pueden agregar documentos a la base de conocimiento.'
                }
              </p>
              {isAdmin && !searchTerm && (
                <div className="flex justify-center">
                  <Button 
                    variant="outline"
                    onClick={() => setShowUpload(true)}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Subir Primer Documento
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <CardTitle className="text-lg truncate">{getCleanTitle(item)}</CardTitle>
                    </div>
                    <p className="text-sm text-gray-600">
                      Proyecto: {item.project} • Creado: {new Date(item.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Badge variant={item.active ? "default" : "secondary"}>
                      {item.active ? "Activo" : "Inactivo"}
                    </Badge>
                    
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleToggleActive(item.id, item.active)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {item.active ? 'Desactivar' : 'Activar'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              // TODO: Implement edit functionality
                              toast({
                                title: "Función en desarrollo",
                                description: "La edición de documentos estará disponible pronto"
                              })
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteDocument(item.id, getCleanTitle(item))}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
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
                {item.file_url && (
                  <div className="mt-3">
                    <Badge variant="secondary" className="text-xs">
                      <FileText className="w-3 h-3 mr-1" />
                      Archivo Original
                    </Badge>
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
