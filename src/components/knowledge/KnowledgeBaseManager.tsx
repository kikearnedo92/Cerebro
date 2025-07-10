import React, { useState, useRef } from 'react'
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
import { Progress } from '@/components/ui/progress'
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Edit, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye,
  FileImage,
  FileSpreadsheet,
  File,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Brain,
  Target
} from 'lucide-react'
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
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({})
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [newItem, setNewItem] = useState({
    title: '',
    content: '',
    project: '',
    tags: ''
  })

  // Projects extraídos de datos reales de Retorna
  const projects = [
    'ATC', 'Research', 'Onboarding', 'FAQ', 'Política', 
    'Procedimiento', 'General', 'Chile', 'Colombia', 'Perú', 
    'España', 'Europa', 'KYC', 'Compliance'
  ]
  
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProject = filterProject === 'all' || item.project === filterProject
    return matchesSearch && matchesProject
  })

  // Estadísticas comerciales
  const stats = {
    total: items.length,
    active: items.filter(i => i.active).length,
    inactive: items.filter(i => !i.active).length,
    projects: new Set(items.map(i => i.project)).size
  }

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
      
      toast({
        title: "✅ Contenido Agregado",
        description: "Documento procesado y listo para búsquedas inteligentes"
      })
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
      
      toast({
        title: "✅ Documento Actualizado",
        description: "Cambios guardados exitosamente"
      })
    } catch (error) {
      console.error('Error updating item:', error)
    }
  }

  // Drag & Drop con Preview
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFileUpload(files)
  }

  const handleFileUpload = async (files: File[]) => {
    if (!files || files.length === 0) return

    for (const file of files) {
      try {
        const fileId = `${file.name}-${Date.now()}`
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))
        
        // Simular progreso durante upload
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: Math.min((prev[fileId] || 0) + 10, 90)
          }))
        }, 200)

        await uploadFile(file, {
          title: file.name.replace(/\.[^/.]+$/, ""),
          project: 'General',
          tags: ['uploaded', 'documento', getFileTypeTag(file.type)]
        })
        
        clearInterval(progressInterval)
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }))
        
        // Remover progreso después de 2 segundos
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev }
            delete newProgress[fileId]
            return newProgress
          })
        }, 2000)
        
      } catch (error) {
        console.error('File upload error:', error)
        toast({
          title: "❌ Error de Upload",
          description: `Error procesando ${file.name}`,
          variant: "destructive"
        })
      }
    }
  }

  const getFileTypeTag = (mimeType: string) => {
    if (mimeType.includes('pdf')) return 'pdf'
    if (mimeType.includes('word')) return 'word'
    if (mimeType.includes('text')) return 'texto'
    if (mimeType.includes('image')) return 'imagen'
    return 'documento'
  }

  const getFileIcon = (fileType?: string) => {
    if (fileType?.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />
    if (fileType?.includes('word')) return <FileText className="w-4 h-4 text-blue-500" />
    if (fileType?.includes('image')) return <FileImage className="w-4 h-4 text-green-500" />
    if (fileType?.includes('spreadsheet')) return <FileSpreadsheet className="w-4 h-4 text-green-600" />
    return <File className="w-4 h-4 text-gray-500" />
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await syncDocuments()
      toast({
        title: "🔄 Sincronización Completa",
        description: "Base de conocimiento actualizada"
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleDelete = async (id: string) => {
    await deleteItem(id)
    toast({
      title: "🗑️ Documento Eliminado",
      description: "Removido de la base de conocimiento"
    })
  }

  const handleBulkFileSelect = () => {
    fileInputRef.current?.click()
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-muted-foreground">Cargando base de conocimiento...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header comercial */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            Memory Robusto
          </h1>
          <p className="text-muted-foreground mt-1">
            Sistema de gestión de conocimiento empresarial con IA semántica
          </p>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="outline" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Demo Ready
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Target className="w-3 h-3 mr-1" />
              Comercial
            </Badge>
          </div>
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
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.md"
            onChange={(e) => handleFileUpload(Array.from(e.target.files || []))}
            className="hidden"
          />
          
          <Button variant="outline" onClick={handleBulkFileSelect} disabled={isUploading}>
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Procesando...' : 'Upload Masivo'}
          </Button>
          
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

      {/* Stats comerciales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Documentos</div>
              </div>
              <FileText className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                <div className="text-sm text-muted-foreground">Activos</div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-muted-foreground">{stats.inactive}</div>
                <div className="text-sm text-muted-foreground">Inactivos</div>
              </div>
              <XCircle className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.projects}</div>
                <div className="text-sm text-muted-foreground">Proyectos</div>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drag & Drop Zone */}
      <Card 
        className={`border-2 border-dashed transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <CardContent className="p-8 text-center">
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Arrastra archivos aquí o haz clic para seleccionar
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Soporta: PDF, Word, Excel, CSV, TXT, Markdown (máximo 10MB cada uno)
          </p>
          <Button variant="outline" onClick={handleBulkFileSelect}>
            Seleccionar Archivos
          </Button>
          
          {/* Progress indicators */}
          {Object.entries(uploadProgress).length > 0 && (
            <div className="mt-4 space-y-2">
              {Object.entries(uploadProgress).map(([fileId, progress]) => {
                const fileName = fileId.split('-')[0]
                return (
                  <div key={fileId} className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-sm flex-1 text-left">{fileName}</span>
                    <Progress value={progress} className="w-24" />
                    <span className="text-xs text-muted-foreground w-10">{progress}%</span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No hay contenido</h3>
              <p className="text-muted-foreground mb-4">Comienza agregando documentos o contenido manualmente</p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Primer Contenido
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
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
                      <div className="flex items-start gap-3">
                        {getFileIcon(item.file_type)}
                        <div>
                          <div className="font-medium text-foreground">{item.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-md">
                            {item.content.substring(0, 100)}...
                          </div>
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
                      <div className="text-sm text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString('es-ES')}
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
                              className="text-destructive hover:text-destructive"
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
                                className="bg-destructive hover:bg-destructive/90"
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