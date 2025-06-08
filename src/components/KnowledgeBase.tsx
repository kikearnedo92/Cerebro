
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus, 
  Search, 
  Filter, 
  Upload, 
  FileText, 
  Edit, 
  Trash2,
  Download,
  Eye,
  Tag,
  Calendar,
  User,
  FolderOpen
} from 'lucide-react';
import { KnowledgeBase as KnowledgeBaseType, Project } from '@/types';
import { toast } from '@/hooks/use-toast';

const KnowledgeBase: React.FC = () => {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeBaseType[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredItems, setFilteredItems] = useState<KnowledgeBaseType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    project_id: '',
    tipo_contenido: 'manual' as 'manual' | 'archivo',
    tags: [] as string[],
    archivo_url: ''
  });

  // Mock data para el demo
  useEffect(() => {
    const mockProjects: Project[] = [
      { id: '1', nombre: 'ATC', descripcion: 'Atención al Cliente', color: '#10B981', icono: '📞', activo: true, orden_display: 1 },
      { id: '2', nombre: 'Research-Nuevas', descripcion: 'Investigaciones Nuevas', color: '#6366F1', icono: '🔬', activo: true, orden_display: 2 },
      { id: '3', nombre: 'Research-Antiguas', descripcion: 'Investigaciones Históricas', color: '#8B5CF6', icono: '📚', activo: true, orden_display: 3 },
      { id: '4', nombre: 'Políticas-Chile', descripcion: 'Políticas Chile', color: '#EF4444', icono: '🇨🇱', activo: true, orden_display: 4 },
      { id: '5', nombre: 'Políticas-Colombia', descripcion: 'Políticas Colombia', color: '#F59E0B', icono: '🇨🇴', activo: true, orden_display: 5 },
      { id: '6', nombre: 'Políticas-España', descripcion: 'Políticas España', color: '#EC4899', icono: '🇪🇸', activo: true, orden_display: 6 },
      { id: '7', nombre: 'Procedimientos-Operativos', descripcion: 'Procedimientos Operativos', color: '#06B6D4', icono: '⚙️', activo: true, orden_display: 7 },
      { id: '8', nombre: 'Scripts-Respuesta', descripcion: 'Scripts de Respuesta', color: '#84CC16', icono: '💬', activo: true, orden_display: 8 },
      { id: '9', nombre: 'Normativas-Compliance', descripcion: 'Normativas y Compliance', color: '#F97316', icono: '📋', activo: true, orden_display: 9 }
    ];

    const mockKnowledge: KnowledgeBaseType[] = [
      {
        id: '1',
        titulo: 'Manual de Atención al Cliente v2.1',
        contenido: 'Guía completa para el manejo de consultas y resolución de problemas de clientes...',
        project_id: '1',
        tipo_contenido: 'archivo',
        archivo_url: '/files/manual-atc-v2.1.pdf',
        tags: ['manual', 'atención', 'procedimientos'],
        fecha_creacion: new Date(Date.now() - 86400000),
        creado_por: 'admin@retorna.com',
        activo: true,
        version: 1,
        project: mockProjects[0]
      },
      {
        id: '2',
        titulo: 'Regulaciones Colombia 2024',
        contenido: 'Nuevas regulaciones para remesas hacia Colombia vigentes desde enero 2024...',
        project_id: '5',
        tipo_contenido: 'manual',
        tags: ['colombia', 'regulaciones', '2024', 'remesas'],
        fecha_creacion: new Date(Date.now() - 172800000),
        creado_por: 'admin@retorna.com',
        activo: true,
        version: 1,
        project: mockProjects[4]
      },
      {
        id: '3',
        titulo: 'Scripts de Respuesta Comunes',
        contenido: 'Colección de scripts para situaciones frecuentes en atención al cliente...',
        project_id: '8',
        tipo_contenido: 'archivo',
        archivo_url: '/files/scripts-comunes.docx',
        tags: ['scripts', 'respuestas', 'atención'],
        fecha_creacion: new Date(Date.now() - 259200000),
        creado_por: 'supervisor@retorna.com',
        activo: true,
        version: 2,
        project: mockProjects[7]
      },
      {
        id: '4',
        titulo: 'Estudio de Mercado Q4 2024',
        contenido: 'Análisis del mercado de remesas en el cuarto trimestre de 2024...',
        project_id: '2',
        tipo_contenido: 'archivo',
        archivo_url: '/files/estudio-q4-2024.pdf',
        tags: ['estudio', 'mercado', 'q4', '2024', 'análisis'],
        fecha_creacion: new Date(Date.now() - 345600000),
        creado_por: 'research@retorna.com',
        activo: true,
        version: 1,
        project: mockProjects[1]
      }
    ];

    setProjects(mockProjects);
    setKnowledgeItems(mockKnowledge);
    setFilteredItems(mockKnowledge);
  }, []);

  // Filtrar elementos
  useEffect(() => {
    let filtered = knowledgeItems;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.contenido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedProject !== 'all') {
      filtered = filtered.filter(item => item.project_id === selectedProject);
    }

    setFilteredItems(filtered);
  }, [searchTerm, selectedProject, knowledgeItems]);

  const handleAddContent = () => {
    if (!formData.titulo || !formData.contenido || !formData.project_id) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos.",
        variant: "destructive",
      });
      return;
    }

    const newItem: KnowledgeBaseType = {
      id: Date.now().toString(),
      titulo: formData.titulo,
      contenido: formData.contenido,
      project_id: formData.project_id,
      tipo_contenido: formData.tipo_contenido,
      archivo_url: formData.archivo_url,
      tags: formData.tags,
      fecha_creacion: new Date(),
      creado_por: 'admin@retorna.com',
      activo: true,
      version: 1,
      project: projects.find(p => p.id === formData.project_id)
    };

    setKnowledgeItems(prev => [newItem, ...prev]);
    setIsAddModalOpen(false);
    setFormData({
      titulo: '',
      contenido: '',
      project_id: '',
      tipo_contenido: 'manual',
      tags: [],
      archivo_url: ''
    });

    toast({
      title: "Contenido agregado",
      description: "El contenido se ha agregado exitosamente a la base de conocimiento.",
    });
  };

  const handleDeleteItem = (id: string) => {
    setKnowledgeItems(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Contenido eliminado",
      description: "El contenido se ha eliminado de la base de conocimiento.",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = e.currentTarget.value.trim();
      if (value && !formData.tags.includes(value)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, value]
        }));
        e.currentTarget.value = '';
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-600">Gestiona el contenido de la base de conocimiento</p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Carga Masiva
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Carga Masiva de Contenido</DialogTitle>
                <DialogDescription>
                  Sube múltiples archivos o usa una plantilla CSV para agregar contenido en lote.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Arrastra archivos aquí o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Soporta: PDF, DOCX, TXT, CSV (máximo 10MB cada uno)
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Plantilla CSV</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Descarga la plantilla CSV para cargar contenido masivo
                  </p>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Plantilla
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

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
                <DialogDescription>
                  Agrega contenido nuevo a la base de conocimiento
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      placeholder="Título del contenido"
                      value={formData.titulo}
                      onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="project">Proyecto *</Label>
                    <Select 
                      value={formData.project_id} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar proyecto" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map(project => (
                          <SelectItem key={project.id} value={project.id}>
                            <div className="flex items-center space-x-2">
                              <span>{project.icono}</span>
                              <span>{project.nombre}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Tabs value={formData.tipo_contenido} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, tipo_contenido: value as 'manual' | 'archivo' }))
                }>
                  <TabsList>
                    <TabsTrigger value="manual">Contenido Manual</TabsTrigger>
                    <TabsTrigger value="archivo">Subir Archivo</TabsTrigger>
                  </TabsList>
                  <TabsContent value="manual" className="space-y-4">
                    <div>
                      <Label htmlFor="contenido">Contenido *</Label>
                      <Textarea
                        id="contenido"
                        placeholder="Escribe el contenido aquí..."
                        className="min-h-32"
                        value={formData.contenido}
                        onChange={(e) => setFormData(prev => ({ ...prev, contenido: e.target.value }))}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="archivo" className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Arrastra un archivo o haz clic para seleccionar</p>
                      <p className="text-xs text-gray-500">PDF, DOCX, TXT (máximo 10MB)</p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="Presiona Enter o coma para agregar tags"
                    onKeyDown={handleTagInput}
                  />
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="cursor-pointer" 
                               onClick={() => removeTag(tag)}>
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddContent}>
                    Agregar Contenido
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar contenido..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por proyecto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los proyectos</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center space-x-2">
                      <span>{project.icono}</span>
                      <span>{project.nombre}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Más Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{knowledgeItems.length}</p>
                <p className="text-sm text-gray-600">Total Documentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FolderOpen className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{projects.length}</p>
                <p className="text-sm text-gray-600">Proyectos Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Upload className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {knowledgeItems.filter(item => item.tipo_contenido === 'archivo').length}
                </p>
                <p className="text-sm text-gray-600">Archivos Subidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Edit className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {knowledgeItems.filter(item => item.tipo_contenido === 'manual').length}
                </p>
                <p className="text-sm text-gray-600">Contenido Manual</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de contenido */}
      <Card>
        <CardHeader>
          <CardTitle>Contenido de la Base de Conocimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Creado por</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {item.tipo_contenido === 'archivo' ? (
                        <FileText className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Edit className="w-4 h-4 text-green-500" />
                      )}
                      <span className="font-medium">{item.titulo}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.project && (
                      <div className="flex items-center space-x-2">
                        <span>{item.project.icono}</span>
                        <Badge style={{ backgroundColor: item.project.color, color: 'white' }}>
                          {item.project.nombre}
                        </Badge>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.tipo_contenido === 'archivo' ? 'default' : 'secondary'}>
                      {item.tipo_contenido === 'archivo' ? 'Archivo' : 'Manual'}
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
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(item.fecha_creacion)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <User className="w-3 h-3" />
                      <span>{item.creado_por.split('@')[0]}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteItem(item.id)}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default KnowledgeBase;
