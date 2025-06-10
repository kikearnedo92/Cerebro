
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Brain, Mail, Lock, Eye, EyeOff, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'

const RETORNA_AREAS = [
  'Customer Success',
  'Tesorería', 
  'Compliance',
  'Growth',
  'Producto',
  'Operaciones',
  'People',
  'Administración',
  'Otros'
]

const ROLES_EMPRESA = [
  'Agente',
  'Analista',
  'Manager',
  'Director'
]

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    area: '',
    rol_empresa: ''
  })

  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('📝 Form submitted', { isLogin, email: formData.email })
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Email y contraseña son requeridos",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      if (isLogin) {
        console.log('🔑 Attempting signin...')
        await signIn(formData.email, formData.password)
        console.log('✅ Signin successful')
        toast({
          title: "¡Bienvenido a Cerebro!",
          description: "Has iniciado sesión correctamente."
        })
      } else {
        console.log('📝 Attempting signup...')
        
        if (!formData.full_name || !formData.area || !formData.rol_empresa) {
          toast({
            title: "Error",
            description: "Todos los campos son requeridos para el registro",
            variant: "destructive"
          })
          return
        }
        
        await signUp(formData.email, formData.password, {
          full_name: formData.full_name,
          area: formData.area,
          rol_empresa: formData.rol_empresa
        })
        console.log('✅ Signup successful')
        toast({
          title: "Registro exitoso",
          description: "Tu cuenta ha sido creada. Revisa tu email para confirmar."
        })
      }
    } catch (error: any) {
      console.error('❌ Auth error:', error)
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
    <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              CEREBRO
            </h1>
            <span className="text-sm text-gray-500 font-medium">by Retorna</span>
          </div>
        </div>
        <div>
          <CardTitle className="text-xl">
            {isLogin ? 'Accede a tu conocimiento' : 'Únete a Cerebro'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {isLogin ? 'La plataforma de conocimiento de Retorna' : 'Solo empleados con email @retorna.app'}
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="full_name"
                  type="text"
                  placeholder="Tu nombre completo"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="pl-10"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="tu@retorna.app"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="space-y-2">
                <Label htmlFor="area">Área de Retorna</Label>
                <Select onValueChange={(value) => setFormData({...formData, area: value})} required={!isLogin}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu área" />
                  </SelectTrigger>
                  <SelectContent>
                    {RETORNA_AREAS.map(area => (
                      <SelectItem key={area} value={area}>{area}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rol_empresa">Rol en la empresa</Label>
                <Select onValueChange={(value) => setFormData({...formData, rol_empresa: value})} required={!isLogin}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES_EMPRESA.map(rol => (
                      <SelectItem key={rol} value={rol}>{rol}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 shadow-lg" 
            disabled={loading}
          >
            {loading 
              ? (isLogin ? "Accediendo..." : "Registrando...") 
              : (isLogin ? "Acceder a Cerebro" : "Unirse a Cerebro")
            }
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-purple-600 hover:text-purple-700 hover:underline"
            disabled={loading}
          >
            {isLogin 
              ? "¿No tienes cuenta? Regístrate aquí" 
              : "¿Ya tienes cuenta? Inicia sesión"
            }
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

export default AuthForm
