import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { BookOpen, Search, FileText, Eye } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

interface Document {
  title: string
  content: string
}

const KnowledgePage = () => {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('knowledge_base')
          .select('title, content')
          .limit(20)

        if (error) {
          console.error('Error:', error)
          setDocuments([])
        } else {
          console.log('Documents loaded:', data?.length)
          setDocuments(data || [])
        }
      } catch (error) {
        console.error('Fetch error:', error)
        setDocuments([])
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-2">Cargando documentos...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Base de Conocimiento</h1>
          <p className="text-gray-600">Documentos disponibles para CEREBRO</p>
        </div>
        <div className="flex items-center space-x-2">
          <BookOpen className="h-8 w-8 text-purple-600" />
          <Badge variant="secondary">{documents.length} documentos</Badge>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {filteredDocuments.length > 0 ? (
        <div className="space-y-4">
          {filteredDocuments.map((doc, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">{doc.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                      {doc.content.substring(0, 300)}...
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const element = document.getElementById(`content-${index}`)
                        if (element) {
                          element.style.display = element.style.display === 'none' ? 'block' : 'none'
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div id={`content-${index}`} style={{ display: 'none' }} className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Contenido completo:</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{doc.content}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <BookOpen className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-500">
                {searchTerm ? 'No se encontraron documentos' : 'No hay documentos disponibles'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default KnowledgePage