import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Users, UserPlus, Mail, Shield } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function UsersPage() {
  const { user, profile, isAdmin } = useAuth()
  const [inviteEmail, setInviteEmail] = useState('')

  const handleInvite = async () => {
    if (!inviteEmail) {
      toast({ title: 'Error', description: 'Ingresa un email', variant: 'destructive' })
      return
    }

    // TODO: Implement actual invite via Supabase
    toast({
      title: 'Invitacion enviada',
      description: `Se envio una invitacion a ${inviteEmail}`,
    })
    setInviteEmail('')
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <p className="text-slate-500">Solo administradores pueden gestionar usuarios.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
        <p className="text-slate-500">Gestiona quien tiene acceso a tu Cerebro</p>
      </div>

      {/* Invite */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="w-5 h-5" />
            Invitar usuario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                type="email"
                placeholder="email@empresa.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
              />
            </div>
            <Button onClick={handleInvite} className="bg-indigo-600 hover:bg-indigo-700">
              Invitar
            </Button>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            El usuario recibira un email para crear su cuenta y acceder a tu Cerebro.
          </p>
        </CardContent>
      </Card>

      {/* Current users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5" />
            Usuarios activos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Current user (always shown) */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-medium text-slate-900 text-sm">
                    {profile?.full_name || 'Tu'}
                  </p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>
              <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                Admin
              </Badge>
            </div>

            <p className="text-center text-sm text-slate-400 py-4">
              Invita a tu equipo para que todos puedan consultar el Cerebro de tu empresa.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
