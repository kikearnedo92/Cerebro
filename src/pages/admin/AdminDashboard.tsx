import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, Users, Database, BarChart3, Brain, ArrowLeft, Building2, CreditCard, Activity } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'

const AdminDashboard = () => {
  const { profile, isSuperAdmin } = useAuth()

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Acceso Denegado</h3>
          <p className="text-slate-500">Solo super administradores pueden acceder.</p>
          <Link to="/app">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 w-4 h-4" /> Volver a la app
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Panel de Administracion</h1>
              <p className="text-slate-500 text-sm">Gestion global de Cerebro SaaS</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-red-100 text-red-800">Super Admin</Badge>
            <Link to="/app">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-1 w-4 h-4" /> Volver a la app
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Empresas</p>
                  <p className="text-3xl font-bold text-slate-900">--</p>
                  <p className="text-xs text-slate-400 mt-1">Tenants activos</p>
                </div>
                <Building2 className="w-8 h-8 text-indigo-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Usuarios</p>
                  <p className="text-3xl font-bold text-slate-900">--</p>
                  <p className="text-xs text-slate-400 mt-1">Total registrados</p>
                </div>
                <Users className="w-8 h-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Revenue</p>
                  <p className="text-3xl font-bold text-slate-900">$--</p>
                  <p className="text-xs text-slate-400 mt-1">MRR este mes</p>
                </div>
                <CreditCard className="w-8 h-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Consultas</p>
                  <p className="text-3xl font-bold text-slate-900">--</p>
                  <p className="text-xs text-slate-400 mt-1">Este mes</p>
                </div>
                <Activity className="w-8 h-8 text-violet-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tenants list */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Empresas registradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-slate-400">
              <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Sin empresas aun</p>
              <p className="text-sm">Los tenants apareceran aqui cuando los primeros clientes se registren.</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones rapidas</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
              <h3 className="font-medium text-slate-900 mb-1">Stripe Dashboard</h3>
              <p className="text-sm text-slate-500 mb-3">Ver pagos y suscripciones</p>
              <Button variant="outline" size="sm" asChild>
                <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer">
                  Abrir Stripe
                </a>
              </Button>
            </div>
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
              <h3 className="font-medium text-slate-900 mb-1">Supabase</h3>
              <p className="text-sm text-slate-500 mb-3">Base de datos y auth</p>
              <Button variant="outline" size="sm" asChild>
                <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                  Abrir Supabase
                </a>
              </Button>
            </div>
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
              <h3 className="font-medium text-slate-900 mb-1">Anthropic Console</h3>
              <p className="text-sm text-slate-500 mb-3">Uso de API Claude</p>
              <Button variant="outline" size="sm" asChild>
                <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer">
                  Abrir Anthropic
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard
