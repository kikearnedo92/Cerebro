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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/app" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      toast({ title: "Error", description: "Email y contrasena son requeridos", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      if (isLogin) {
        await signIn(formData.email, formData.password)
        toast({ title: "Bienvenido a Cerebro", description: "Has iniciado sesion correctamente." })
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
        description: error.message || 'Error en la autenticacion',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-8">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="flex items-center justify-center gap-2">
              <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900">CEREBRO</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                {isLogin ? 'Accede a tu Cerebro' : 'Crea tu Cerebro'}
              </h1>
              <p className="text-sm text-slate-500">
                {isLogin
                  ? 'Ingresa tus credenciales para continuar'
                  : '14 dias gratis. Sin tarjeta de credito.'}
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
                        placeholder="Juan Perez"
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
                <Label htmlFor="email">Correo electronico</Label>
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
                <Label htmlFor="password">Contrasena</Label>
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
                className="w-full bg-indigo-600 hover:bg-indigo-700 h-11"
                disabled={loading}
              >
                {loading
                  ? 'Procesando...'
                  : isLogin
                  ? 'Iniciar sesion'
                  : 'Crear mi Cerebro gratis'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                {isLogin ? 'No tienes cuenta? Registrate gratis' : 'Ya tienes cuenta? Inicia sesion'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AuthPage
