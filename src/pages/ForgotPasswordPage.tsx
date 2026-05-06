import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Brain, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast({ title: 'Error', description: 'Ingresa tu correo electrónico', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
      setSent(true)
      toast({
        title: 'Email enviado',
        description: 'Revisa tu correo para el enlace de reseteo.',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No pudimos enviar el email. Intenta de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 antialiased">
      <div className="w-full max-w-md">
        <Link
          to="/auth"
          className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al login
        </Link>

        <Card className="shadow-sm border border-slate-100 rounded-2xl">
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="flex items-center justify-center gap-2">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-slate-900 tracking-tight">cerebro</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                {sent ? 'Revisa tu correo' : 'Recupera tu contraseña'}
              </h1>
              <p className="text-sm text-slate-500">
                {sent
                  ? 'Te enviamos un link para resetear tu contraseña.'
                  : 'Te enviaremos un link para crear una contraseña nueva.'}
              </p>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            {sent ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 py-6">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <p className="text-sm text-slate-600 text-center">
                  Si <strong>{email}</strong> está registrado, recibirás el email en los próximos minutos.
                  Revisa también tu carpeta de spam.
                </p>
                <Link to="/auth">
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 h-11 rounded-lg text-sm">
                    Volver al login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 h-11 rounded-lg text-sm"
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar link de reseteo'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
