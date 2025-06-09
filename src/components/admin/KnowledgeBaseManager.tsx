
import React, { useState } from 'react'
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Plus, FileText, Edit, Trash2, Eye, EyeOff, Upload, Database } from 'lucide-react'
import QuickFileUpload from './QuickFileUpload'
import ContentForm from './ContentForm'

const KnowledgeBaseManager = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContent, setSelectedContent] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const { items, isLoading, deleteItem, toggleActive } = useKnowledgeBase()

  // Filter items based on search
  const filteredItems = items?.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || []

  const handleEdit = (content: any) => {
    setSelectedContent(content)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setSelectedContent(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getProjectColor = (project: string) => {
    const colors: Record<string, string> = {
      'ATC': 'bg-blue-100 text-blue-800',
      'Research': 'bg-purple-100 text-purple-800',
      'Onboarding': 'bg-green-100 text-green-800',
      'Políticas': 'bg-red-100 text-red-800',
      'Procedimientos': 'bg-orange-100 text-orange-800',
      'Scripts': 'bg-cyan-100 text-cyan-800',
      'General': 'bg-gray-100 text-gray-800'
    }
    return colors[project] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b bg-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Database className="w-6 h-6" />
              Knowledge Base
            </h1>
            <p className="text-gray-600">Gestiona el contenido y documentos de Cerebro</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Agregar Contenido
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar en knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="upload" className="h-full">
          <div className="px-6 pt-4">
            <TabsList>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Subir Archivos
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Contenido Existente
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="upload" className="px-6 pb-6">
            <QuickFileUpload />
          </TabsContent>

          <TabsContent value="content" className="px-6 pb-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-6 h-6 text-blue-500" />
                    <div>
                      <p className="text-lg font-bold">{items?.length || 0}</p>
                      <p className="text-sm text-gray-600">Total Documentos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-6 h-6 text-green-500" />
                    <div>
                      <p className="text-lg font-bold">
                        {items?.filter(item => item.active).length || 0}
                      </p>
                      <p className="text-sm text-gray-600">Activos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Upload className="w-6 h-6 text-purple-500" />
                    <div>
                      <p className="text-lg font-bold">
                        {items?.filter(item => item.file_url).length || 0}
                      </p>
                      <p className="text-sm text-gray-600">Archivos Subidos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Edit className="w-6 h-6 text-orange-500" />
                    <div>
                      <p className="text-lg font-bold">
                        {new Set(items?.map(item => item.project)).size || 0}
                      </p>
                      <p className="text-sm text-gray-600">Proyectos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content Table */}
            <Card>
              <CardHeader>
                <CardTitle>Contenido de la Base de Conocimiento</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Cargando contenido...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Proyecto</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {item.file_url ? (
                                <FileText className="w-4 h-4 text-blue-500" />
                              ) : (
                                <Edit className="w-4 h-4 text-green-500" />
                              )}
                              <span className="font-medium">{item.title}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getProjectColor(item.project)}>
                              {item.project}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.file_url ? "default" : "secondary"}>
                              {item.file_url ? 'Archivo' : 'Manual'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {item.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {item.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{item.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.active ? "default" : "secondary"}>
                              {item.active ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {formatDate(item.created_at)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleActive(item.id, !item.active)}
                                title={item.active ? 'Desactivar' : 'Activar'}
                              >
                                {item.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(item)}
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => deleteItem(item.id)}
                                className="text-red-600 hover:text-red-700"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {filteredItems.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery ? 'No se encontraron resultados' : 'No hay contenido en la knowledge base'}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Content Form Modal */}
      {showForm && (
        <ContentForm
          content={selectedContent}
          onClose={handleFormClose}
          onSave={handleFormClose}
        />
      )}
    </div>
  )
}

export default KnowledgeBaseManager
