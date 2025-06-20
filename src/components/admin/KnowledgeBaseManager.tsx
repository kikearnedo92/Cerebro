
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { FileText, Upload, Download, Trash2, Edit, Plus, Search, Filter, RefreshCw, Sync } from 'lucide-react'
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase'
import { toast } from '@/hooks/use-toast'

const KnowledgeBaseManager = () => {
  const { 
    items, 
    isLoading, 
    isUploading, 
    addItem, 
    updateItem, 
    toggleActive, 
    deleteItem, 
    uploadFile,
    syncDocuments
  } = useKnowledgeBase()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterProject, setFilterProject] = useState('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [newItem, setNewItem] = useState({
    title: '',
    content: '',
    project: '',
    tags: ''
  })

  const projects = ['ATC', 'Research', 'Onboarding', 'FAQ', 'Política', 'Procedimiento', 'General']
  
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProject = filterProject === 'all' || item.project === filterProject
    return matchesSearch && matchesProject
  })

  const handleAddItem = async () => {
    if (!newItem.title || !newItem.content || !newItem.project) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      })
      return
    }

    try {
      await addItem({
        title: newItem.title,
        content: newItem.content,
        project: newItem.project,
        tags: newItem.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        active: true
      })
      
      setNewItem({ title: '', content: '', project: '', tags: '' })
      setIsAddModalOpen(false)
    } catch (error) {
      console.error('Error adding item:', error)
    }
  }

  const handleEditItem = async () => {
    if (!selectedItem) return

    try {
      await updateItem(selectedItem.id, {
        title: selectedItem.title,
        content: selectedItem.content,
        project: selectedItem.project,
        tags: Array.isArray(selectedItem.tags) ? selectedItem.tags : []
      })
      setIsEditModalOpen(false)
      setSelectedItem(null)
    } catch (error) {
      console.error('Error updating item:', error)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    for (const file of Array.from(files)) {
      try {
        await uploadFile(file, {
          title: file.name.replace(/\.[^/.]+$/, ""),
          project: 'General',
          tags: ['uploaded', 'documento']
        })
      } catch (error) {
        console.error('File upload error:', error)
      }
    }
    
    // Reset file input
    event.target.value = ''
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await syncDocuments()
    } finally {
      setIsSyncing(false)
    }
  }

  const handleDelete = async (id: string) => {
    await deleteItem(id)
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Cargando base de conocimiento...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Base de Conocimiento</h1>
          <p className="text-gray-600">Gestiona el contenido que usa Cerebro para responder</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sync className="w-4 h-4 mr-2" />
            )}
            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
          </Button>
          
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button variant="outline" asChild disabled={isUploading}>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'Subiendo...' : 'Subir Archivos'}
              </span>
            </Button>
          </label>
          
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Contenido
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Contenido</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={newItem.title}
                    onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                    placeholder="Título del contenido"
                  />
                </div>
                
                <div>
                  <Label htmlFor="project">Proyecto *</Label>
                  <Select value={newItem.project} onValueChange={(value) => setNewItem({...newItem, project: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona proyecto" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(project => (
                        <SelectItem key={project} value={project}>{project}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="tags">Tags (separados por coma)</Label>
                  <Input
                    id="tags"
                    value={newItem.tags}
                    onChange={(e) => setNewItem({...newItem, tags: e.target.value})}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
                
                <div>
                  <Label htmlFor="content">Contenido *</Label>
                  <Textarea
                    id="content"
                    value={newItem.content}
                    onChange={(e) => setNewItem({...newItem, content: e.target.value})}
                    placeholder="Contenido del documento..."
                    rows={10}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleAddItem} className="flex-1">
                    Agregar Contenido
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{items.length}</div>
            <div className="text-sm text-gray-600">Total Documentos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{items.filter(i => i.active).length}</div>
            <div className="text-sm text-gray-600">Activos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-500">{items.filter(i => !i.active).length}</div>
            <div className="text-sm text-gray-600">Inactivos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{new Set(items.map(i => i.project)).size}</div>
            <div className="text-sm text-gray-600">Proyectos</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar en contenido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterProject} onValueChange={setFilterProject}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los proyectos</SelectItem>
            {projects.map(project => (
              <SelectItem key={project} value={project}>{project}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content Table */}
      <Card>
        <CardContent className="p-0">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay contenido</h3>
              <p className="text-gray-500 mb-4">Comienza agregando documentos o contenido manualmente</p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Primer Contenido
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Proyecto</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-md">
                          {item.content.substring(0, 100)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.project}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(item.tags || []).slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {(item.tags || []).length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{(item.tags || []).length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={item.active}
                          onCheckedChange={(checked) => toggleActive(item.id, checked)}
                        />
                        <span className="text-sm">
                          {item.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedItem(item)
                            setIsEditModalOpen(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. El documento será eliminado permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(item.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Contenido</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Título</Label>
                <Input
                  id="edit-title"
                  value={selectedItem.title}
                  onChange={(e) => setSelectedItem({...selectedItem, title: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-project">Proyecto</Label>
                <Select value={selectedItem.project} onValueChange={(value) => setSelectedItem({...selectedItem, project: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project} value={project}>{project}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-content">Contenido</Label>
                <Textarea
                  id="edit-content"
                  value={selectedItem.content}
                  onChange={(e) => setSelectedItem({...selectedItem, content: e.target.value})}
                  rows={10}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleEditItem} className="flex-1">
                  Guardar Cambios
                </Button>
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default KnowledgeBaseManager
