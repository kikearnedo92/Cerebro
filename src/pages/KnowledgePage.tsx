
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Upload, FileText, Search, Plus, Download, Trash2 } from 'lucide-react'

interface Document {
  id: string
  title: string
  content: string
  tags: string[]
  uploadedBy: string
  uploadedAt: Date
  size: string
}

const KnowledgePage = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      title: 'Manual de Onboarding Retorna.pdf',
      content: 'Proceso de onboarding para nuevos empleados...',
      tags: ['Onboarding', 'RRHH'],
      uploadedBy: 'eduardo@retorna.app',
      uploadedAt: new Date('2024-01-15'),
      size: '2.3 MB'
    },
    {
      id: '2',
      title: 'Scripts ATC Colombia.docx',
      content: 'Scripts de atención al cliente para Colombia...',
      tags: ['ATC', 'Colombia'],
      uploadedBy: 'maria@retorna.app',
      uploadedAt: new Date('2024-01-10'),
      size: '1.8 MB'
    }
  ])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')

  const allTags = Array.from(new Set(documents.flatMap(doc => doc.tags)))

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTag = !selectedTag || doc.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  const handleFileUpload = () => {
    // Simulate file upload
    const newDoc: Document = {
      id: Date.now().toString(),
      title: 'Nuevo Documento.pdf',
      content: 'Contenido del nuevo documento...',
      tags: ['General'],
      uploadedBy: 'usuario@retorna.app',
      uploadedAt: new Date(),
      size: '1.2 MB'
    }
    setDocuments(prev => [newDoc, ...prev])
  }

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Todos los tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
        
        <Button 
          onClick={handleFileUpload}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Subir Documento
        </Button>
      </div>

      {/* Upload Area */}
      <Card className="border-dashed border-2 border-purple-300 bg-purple-50">
        <CardContent className="p-8">
          <div className="text-center">
            <Upload className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Arrastra y suelta archivos aquí
            </h3>
            <p className="text-gray-600 mb-4">
              Soporta PDF, DOCX, TXT, CSV y Excel (máximo 10MB)
            </p>
            <Button variant="outline" onClick={handleFileUpload}>
              Seleccionar Archivos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Documentos ({filteredDocuments.length})
          </h3>
        </div>

        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron documentos
              </h3>
              <p className="text-gray-600">
                {searchTerm || selectedTag ? 'Intenta con otros términos de búsqueda' : 'Sube tu primer documento para comenzar'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{doc.title}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          Por {doc.uploadedBy} • {doc.uploadedAt.toLocaleDateString()} • {doc.size}
                        </p>
                        <div className="flex gap-1 mt-2">
                          {doc.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {doc.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default KnowledgePage
