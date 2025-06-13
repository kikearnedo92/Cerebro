
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { FileText, CheckCircle, AlertCircle, RefreshCw, ExternalLink, HelpCircle } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface NotionIntegrationProps {
  onStatusChange?: (status: 'connected' | 'disconnected' | 'pending') => void
}

const NotionIntegration = ({ onStatusChange }: NotionIntegrationProps) => {
  const [notionToken, setNotionToken] = useState('')
  const [notionDatabaseId, setNotionDatabaseId] = useState('')
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'pending'>('disconnected')
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [documentsCount, setDocumentsCount] = useState(0)

  const handleConnect = async () => {
    if (!notionToken.trim() || !notionDatabaseId.trim()) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos requeridos",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Validar conexión con Notion
      const { data, error } = await supabase.functions.invoke('notion-integration', {
        body: {
          action: 'connect',
          token: notionToken,
          databaseId: notionDatabaseId
        }
      })

      if (error) throw error

      setStatus('connected')
      setLastSync(new Date().toISOString())
      setDocumentsCount(data.documentsCount || 0)
      onStatusChange?.('connected')
      
      toast({
        title: "Conexión exitosa",
        description: "Notion ha sido conectado correctamente"
      })

      // Limpiar los inputs por seguridad
      setNotionToken('')
      setNotionDatabaseId('')

    } catch (error) {
      console.error('Error connecting to Notion:', error)
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con Notion. Verifica tus credenciales.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      const { data, error } = await supabase.functions.invoke('notion-integration', {
        body: {
          action: 'sync'
        }
      })

      if (error) throw error

      setLastSync(new Date().toISOString())
      setDocumentsCount(data.documentsCount || documentsCount)
      
      toast({
        title: "Sincronización completa",
        description: `Se sincronizaron ${data.newDocuments || 0} documentos nuevos`
      })

    } catch (error) {
      console.error('Error syncing Notion:', error)
      toast({
        title: "Error de sincronización",
        description: "No se pudo sincronizar con Notion",
        variant: "destructive"
      })
    } finally {
      setSyncing(false)
    }
  }

  const handleDisconnect = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.functions.invoke('notion-integration', {
        body: {
          action: 'disconnect'
        }
      })

      if (error) throw error

      setStatus('disconnected')
      setLastSync(null)
      setDocumentsCount(0)
      onStatusChange?.('disconnected')
      
      toast({
        title: "Desconectado",
        description: "Notion ha sido desconectado"
      })

    } catch (error) {
      console.error('Error disconnecting Notion:', error)
      toast({
        title: "Error",
        description: "No se pudo desconectar Notion",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending':
        return <RefreshCw className="w-4 h-4 text-yellow-600 animate-spin" />
      case 'disconnected':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Conectado</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Conectando...</Badge>
      case 'disconnected':
        return <Badge className="bg-red-100 text-red-800">Desconectado</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Notion</CardTitle>
              <p className="text-sm text-gray-600">Sincroniza documentos y bases de conocimiento desde Notion</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'disconnected' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Token de Integración de Notion</label>
              <Input
                type="password"
                placeholder="secret_xxxxx..."
                value={notionToken}
                onChange={(e) => setNotionToken(e.target.value)}
                className="mt-1"
              />
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-500">
                  Obtén tu token en: Notion → Settings → Integrations → Create new integration
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open('https://www.notion.so/my-integrations', '_blank')}
                  className="h-6 px-2"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">ID de Base de Datos</label>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <HelpCircle className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>¿Cómo obtener el ID de la base de datos?</DialogTitle>
                      <DialogDescription className="space-y-3">
                        <p>Para obtener el ID de tu base de datos de Notion:</p>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li>Ve a tu base de datos en Notion</li>
                          <li>Haz clic en los tres puntos (...) en la esquina superior derecha</li>
                          <li>Selecciona "Copy link"</li>
                          <li>El ID está en la URL después de la última barra diagonal (/)</li>
                        </ol>
                        <p className="text-sm text-gray-600">
                          Ejemplo: https://www.notion.so/mi-base-de-datos-<strong>32-caracteres-aqui</strong>
                        </p>
                        <p className="text-sm font-medium">
                          El ID son esos 32 caracteres al final de la URL.
                        </p>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
              <Input
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={notionDatabaseId}
                onChange={(e) => setNotionDatabaseId(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                ID de la base de datos de Notion que quieres sincronizar
              </p>
            </div>
            
            <Button 
              onClick={handleConnect}
              disabled={loading || !notionToken.trim() || !notionDatabaseId.trim()}
              className="w-full"
            >
              {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
              Conectar Notion
            </Button>
          </div>
        )}

        {status === 'connected' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>{documentsCount} documentos sincronizados</span>
              </div>
              {lastSync && (
                <span>Última sync: {new Date(lastSync).toLocaleString()}</span>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={handleSync}
                disabled={syncing}
                variant="outline"
                className="flex-1"
              >
                {syncing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                Sincronizar Ahora
              </Button>
              <Button 
                onClick={handleDisconnect}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                Desconectar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default NotionIntegration
