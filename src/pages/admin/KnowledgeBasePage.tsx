
import React, { useState, useEffect } from 'react'
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Upload, FileText, X, Plus, Edit, Trash2, Eye, EyeOff, Search } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import QuickFileUpload from '@/components/admin/QuickFileUpload'

const KnowledgeBasePage = () => {
  const { items, isLoading, addItem, updateItem, deleteItem, toggleActive, fetchItems } = useKnowledgeBase()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    project: 'General',
    tags: ''
  })

  useEffect(() => {
    fetchItems()
  }, [])

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Error",
        description: "Título y contenido son requeridos",
        variant: "destructive"
      })
      return
    }

    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      
      if (editingItem) {
        await updateItem(editingItem.id, {
          ...formData,
          tags: tagsArray
        })
        setEditingItem(null)
      } else {
        await addItem({
          ...formData,
          tags: tagsArray,
          active: true
        })
      }

      setFormData({ title: '', content: '', project: 'General', tags: '' })
      setShowAddForm(false)
      await fetchItems()
    } catch (error) {
      console.error('Error saving item:', error)
    }
  }

  const handleEdit = (item: any) => {
    setFormData({
      title: item.title,
      content: item.content,
      project: item.project,
      tags: item.tags.join(', ')
    })
    setEditingItem(item)
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
      await deleteItem(id)
      await fetchItems()
    }
  }

  const handleToggleActive = async (id: string, active: boolean) => {
    await toggleActive(id, !active)
    await fetchItems()
  }

  return (
    <div className="h-full p-6 space-y-6 overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Knowledge Base
          </h1>
          <p className="text-gray-600">Gestiona el contenido que Cerebro utiliza para responder</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Agregar Contenido
        </Button>
      </div>

      {/* Quick File Upload */}
      <QuickFileUpload />

      {/* Manual Content Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingItem ? 'Editar Contenido' : 'Agregar Nuevo Contenido'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Título del contenido"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="project">Proyecto</Label>
                  <Input
                    id="project"
                    value={formData.project}
                    onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
                    placeholder="Nombre del proyecto"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="content">Contenido</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Contenido del documento..."
                  className="min-h-32"
                  required
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (separados por comas)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="política, procedimiento, FAQ..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingItem(null)
                    setFormData({ title: '', content: '', project: 'General', tags: '' })
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingItem ? 'Actualizar' : 'Guardar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Content Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Contenido Existente ({filteredItems.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar contenido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No se encontraron resultados' : 'No hay contenido disponible'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Proyecto</TableHead>
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
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {item.content.substring(0, 100)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.project}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {item.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
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
                      {new Date(item.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(item.id, item.active)}
                        >
                          {item.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-700"
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
        </CardContent>
      </Card>
    </div>
  )
}

export default KnowledgeBasePage
