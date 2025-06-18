import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ImageIcon, X } from 'lucide-react'

interface ImageUploadProps {
  onImageSelect: (imageData: string | null) => void
  disabled?: boolean
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, disabled }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona solo archivos de imagen.')
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageData = e.target?.result as string
      setSelectedImage(imageData)
      setFileName(file.name)
      onImageSelect(imageData)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setSelectedImage(null)
    setFileName('')
    onImageSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
      
      {!selectedImage ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="text-purple-600 border-purple-600 hover:bg-purple-50"
        >
          <ImageIcon className="w-4 h-4 mr-1" />
          Imagen
        </Button>
      ) : (
        <div className="flex items-center space-x-2 bg-purple-50 rounded-lg p-2">
          <img
            src={selectedImage}
            alt="Preview"
            className="w-8 h-8 object-cover rounded"
          />
          <span className="text-xs text-purple-700 max-w-20 truncate">
            {fileName}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={removeImage}
            className="p-1 h-auto text-purple-600 hover:text-purple-800"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default ImageUpload