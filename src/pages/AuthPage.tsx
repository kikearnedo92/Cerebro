import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Navigate, Link, useSearchParams } from 'react-router-dom'
import { Brain, Mail, Lock, Eye, EyeOff, User, Building2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'

const AuthPage = () => {
  const [searchParams] = useSearchParams()
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    company_name: '',
  })

  const { user, loading: authLoading, signIn, signUp } = useAuth()

  useEffect(() => {
    setIsLogin(searchParams.get('mode') !== 'signup')
  }, [searchParams])

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/app" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      toast({ title: "Error", description: "Email y contraseña son requeridos", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      if (isLogin) {
        await signIn(formData.email, formData.password)
        toast({ title: "Bienvenido a Cerebro", description: "Has iniciado sesión correctamente." })
      } else {
        if (!formData.full_name || !formData.company_name) {
          toast({ title: "Error", description: "Nombre y empresa son requeridos", variant: "destructive" })
          setLoading(false)
          return
        }
        await signUp(formData.email, formData.password, {
          full_name: formData.full_name,
          company_name: formData.company_name,
        })
        toast({
          title: "Cuenta creada",
          description: "Revisa tu email para confirmar tu cuenta."
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Error en la autenticación',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 antialiased">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-900 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        <Card className="shadow-sm border border-slate-100 rounded-2xl">
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="flex items-center justify-center gap-2">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-semibold text-slate-900 tracking-tight">cerebro</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                {isLogin ? 'Accede a tu Cerebro' : 'Crea tu Cerebro'}
              </h1>
              <p className="text-sm text-slate-500">
                {isLogin
                  ? 'Ingresa tus credenciales para continuar'
                  : '14 días gratis. Sin tarjeta de crédito.'}
              </p>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Tu nombre</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="full_name"
                        type="text"
                        placeholder="Juan Pérez"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_name">Nombre de tu empresa</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="company_name"
                        type="text"
                        placeholder="Mi Startup SAS"
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@empresa.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 caracteres"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 h-11 rounded-lg text-sm"
                disabled={loading}
              >
                {loading
                  ? 'Procesando...'
                  : isLogin
                  ? 'Iniciar sesión'
                  : 'Crear mi Cerebro gratis'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-slate-600 hover:text-slate-900 hover:underline"
              >
                {isLogin ? '¿No tienes cuenta? Regístrate gratis' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AuthPage
