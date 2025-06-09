
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import { Upload, Search, Plus, FileText, Trash2, Edit, Eye } from 'lucide-react'
import FileUpload from './FileUpload'
import ContentForm from './ContentForm'

const KnowledgeBaseManager = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContent, setSelectedContent] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const queryClient = useQueryClient()

  // Fetch knowledge base content
  const { data: knowledgeBase, isLoading } = useQuery({
    queryKey: ['knowledge-base', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('knowledge_base')
        .select('*')
        .order('created_at', { ascending: false })

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    }
  })

  // Delete content mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] })
      toast({
        title: "Contenido eliminado",
        description: "El contenido ha sido eliminado correctamente."
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string, active: boolean }) => {
      const { error } = await supabase
        .from('knowledge_base')
        .update({ active })
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] })
      toast({
        title: "Estado actualizado",
        description: "El estado del contenido ha sido actualizado."
      })
    }
  })

  const handleEdit = (content: any) => {
    setSelectedContent(content)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setSelectedContent(null)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b bg-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">Knowledge Base</h1>
            <p className="text-gray-600">Gestiona el contenido y documentos de Cerebro</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Agregar Contenido
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
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
              <TabsTrigger value="upload">Subir Archivos</TabsTrigger>
              <TabsTrigger value="content">Contenido Existente</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="upload" className="px-6 pb-6">
            <FileUpload onUploadComplete={() => queryClient.invalidateQueries({ queryKey: ['knowledge-base'] })} />
          </TabsContent>

          <TabsContent value="content" className="px-6 pb-6">
            {isLoading ? (
              <div className="text-center py-8">Cargando contenido...</div>
            ) : (
              <div className="grid gap-4">
                {knowledgeBase?.map((item) => (
                  <Card key={item.id} className={`transition-all ${!item.active ? 'opacity-60' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={item.active ? "default" : "secondary"}>
                              {item.active ? "Activo" : "Inactivo"}
                            </Badge>
                            <Badge variant="outline">{item.project}</Badge>
                            {item.tags?.map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleActiveMutation.mutate({ id: item.id, active: !item.active })}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
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
                            onClick={() => deleteMutation.mutate(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm line-clamp-3">{item.content}</p>
                      {item.file_url && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                          <FileText className="w-4 h-4" />
                          <span>Archivo adjunto</span>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Creado: {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}

                {knowledgeBase?.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No hay contenido en la knowledge base
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Content Form Modal */}
      {showForm && (
        <ContentForm
          content={selectedContent}
          onClose={handleFormClose}
          onSave={() => {
            queryClient.invalidateQueries({ queryKey: ['knowledge-base'] })
            handleFormClose()
          }}
        />
      )}
    </div>
  )
}

export default KnowledgeBaseManager
