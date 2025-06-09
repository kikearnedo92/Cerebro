
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Upload, FileText, Search, Plus, Trash2, Download } from 'lucide-react'
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'

const KnowledgePage = () => {
  const { items, isLoading, isUploading, uploadFile, deleteItem } = useKnowledgeBase()
  const { isAdmin } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    project: '',
    tags: [] as string[]
  })

  const handleFileUpload = async (files: FileList) => {
    if (!isAdmin) {
      toast({
        title: "Acceso denegado",
        description: "Solo los administradores pueden subir documentos",
        variant: "destructive"
      })
      return
    }

    const file = files[0]
    if (!file) return

    try {
      await uploadFile(file, {
        title: uploadForm.title || file.name.replace(/\.[^/.]+$/, ""),
        project: uploadForm.project || 'General',
        tags: uploadForm.tags.length > 0 ? uploadForm.tags : ['general']
      })

      setIsUploadModalOpen(false)
      setUploadForm({ title: '', project: '', tags: [] })
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTag = !selectedTag || item.tags?.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  const allTags = Array.from(new Set(items.flatMap(item => item.tags || [])))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600">Cargando documentos...</span>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Base de Conocimiento</h1>
          <p className="text-gray-600">
            {items.length === 0 
              ? "No hay documentos. " + (isAdmin ? "Sube el primer documento." : "Esperando que un administrador suba documentos.")
              : `${items.length} documento${items.length === 1 ? '' : 's'} disponible${items.length === 1 ? '' : 's'}`
            }
          </p>
        </div>
        
        {isAdmin && (
          <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Subir Documento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Subir Nuevo Documento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título (opcional)</Label>
                  <Input
                    id="title"
                    placeholder="Ej: Manual de Onboarding"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="project">Proyecto</Label>
                  <Select value={uploadForm.project} onValueChange={(value) => setUploadForm(prev => ({ ...prev, project: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proyecto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ATC">ATC</SelectItem>
                      <SelectItem value="Research">Research</SelectItem>
                      <SelectItem value="Onboarding">Onboarding</SelectItem>
                      <SelectItem value="Politicas">Políticas</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Arrastra un archivo aquí
                  </h3>
                  <p className="text-gray-600 mb-4">
                    O haz clic para seleccionar
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    id="file-input"
                    accept=".pdf,.docx,.txt,.csv"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-input')?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? 'Subiendo...' : 'Seleccionar Archivo'}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    PDF, DOCX, TXT, CSV (máximo 10MB)
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {allTags.length > 0 && (
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los tags</SelectItem>
              {allTags.map(tag => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Documents List */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {items.length === 0 ? 'Sin documentos' : 'No se encontraron documentos'}
            </h3>
            <p className="text-gray-600 mb-4">
              {items.length === 0 
                ? (isAdmin 
                   ? 'La base de conocimiento está vacía. Sube el primer documento para comenzar.' 
                   : 'La base de conocimiento está vacía. Un administrador debe subir documentos.')
                : 'Intenta con otros términos de búsqueda'
              }
            </p>
            {isAdmin && items.length === 0 && (
              <Button onClick={() => setIsUploadModalOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Subir Primer Documento
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Proyecto: {item.project} • {new Date(item.created_at).toLocaleDateString()}
                      </p>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {item.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {item.file_url && (
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    {isAdmin && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-700 line-clamp-3">
                  {item.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default KnowledgePage
