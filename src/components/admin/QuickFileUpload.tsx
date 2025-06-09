
import React, { useState, useCallback } from 'react'
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, X, Plus } from 'lucide-react'

const QuickFileUpload = () => {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [project, setProject] = useState('')
  const [tags, setTags] = useState('')
  const { uploadFile, isUploading } = useKnowledgeBase()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files)
      setFiles(prev => [...prev, ...newFiles])
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files)
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    
    for (const file of files) {
      await uploadFile(file, {
        title: file.name,
        project: project || 'General',
        tags: tagsArray
      })
    }
    
    // Reset form
    setFiles([])
    setProject('')
    setTags('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Subida Rápida de Archivos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drag and Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-8 h-8 mx-auto mb-3 text-gray-400" />
          <p className="text-sm font-medium mb-1">
            Arrastra archivos aquí o haz clic para seleccionar
          </p>
          <p className="text-xs text-gray-500 mb-3">
            PDF, Word, TXT, CSV, Excel (máximo 10MB)
          </p>
          <Button variant="outline" size="sm" asChild>
            <label className="cursor-pointer">
              Seleccionar Archivos
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </Button>
        </div>

        {/* Selected Files */}
        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Archivos seleccionados:</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="truncate">{file.name}</span>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      ({(file.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-6 w-6 p-0 flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="project" className="text-xs">Proyecto</Label>
            <Input
              id="project"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="ATC, Research, Onboarding..."
              className="h-8"
            />
          </div>
          <div>
            <Label htmlFor="tags" className="text-xs">Tags (separados por comas)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="política, procedimiento, FAQ..."
              className="h-8"
            />
          </div>
        </div>

        {/* Upload Button */}
        <Button 
          onClick={handleUpload}
          disabled={files.length === 0 || isUploading}
          className="w-full"
          size="sm"
        >
          {isUploading ? (
            'Subiendo...'
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Subir {files.length} archivo(s)
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

export default QuickFileUpload
