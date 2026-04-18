import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { Settings, CreditCard, Bell, Shield, ExternalLink } from 'lucide-react'

const SettingsPage = () => {
  const { profile } = useAuth()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuracion</h1>
        <p className="text-slate-500">Administra tu cuenta y suscripcion</p>
      </div>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Suscripcion
              </CardTitle>
              <CardDescription>Tu plan actual y facturacion</CardDescription>
            </div>
            <Badge className="bg-amber-100 text-amber-800 border-amber-200">
              Trial - 14 dias
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Plan: Free Trial</p>
                <p className="text-sm text-slate-500">Tu prueba gratuita esta activa</p>
              </div>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                Elegir plan
                <ExternalLink className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Al elegir un plan seras redirigido a Stripe para completar el pago de forma segura.
          </p>
        </CardContent>
      </Card>

      {/* Company info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Empresa
          </CardTitle>
          <CardDescription>Informacion de tu organizacion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-500">Nombre</span>
              <span className="text-sm font-medium text-slate-900">
                {profile?.company_name || 'Sin configurar'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-500">Plan</span>
              <span className="text-sm font-medium text-slate-900">Free Trial</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-slate-500">Usuarios activos</span>
              <span className="text-sm font-medium text-slate-900">1 / 10</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificaciones
          </CardTitle>
          <CardDescription>Configura como recibes actualizaciones</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Proximamente: notificaciones por email sobre uso y actividad.</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default SettingsPage
