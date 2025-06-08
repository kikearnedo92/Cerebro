
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, User, RegisterData } from '@/types';
import { toast } from '@/hooks/use-toast';

const AuthContext = createContext<AuthUser | undefined>(undefined);

// Mock data para desarrollo
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@retorna.com',
    nombre: 'Admin',
    apellido: 'Retorna',
    rol: 'admin',
    fecha_creacion: new Date(),
    activo: true
  },
  {
    id: '2',
    email: 'user@retorna.com',
    nombre: 'Usuario',
    apellido: 'Demo',
    rol: 'user',
    fecha_creacion: new Date(),
    activo: true
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay una sesión guardada
    const savedUser = localStorage.getItem('retorna_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('retorna_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Mock authentication - en producción esto sería una llamada a la API
      const foundUser = mockUsers.find(u => u.email === email);
      
      if (!foundUser) {
        throw new Error('Usuario no encontrado');
      }

      // Mock password validation (en producción validarías el hash)
      if (password !== 'password') {
        throw new Error('Contraseña incorrecta');
      }

      const userWithLastAccess = {
        ...foundUser,
        ultimo_acceso: new Date()
      };

      setUser(userWithLastAccess);
      localStorage.setItem('retorna_user', JSON.stringify(userWithLastAccess));
      
      toast({
        title: "¡Bienvenido!",
        description: `Hola ${foundUser.nombre}, has iniciado sesión correctamente.`,
      });
    } catch (error) {
      toast({
        title: "Error de autenticación",
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('retorna_user');
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    });
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    
    try {
      // Mock registration - en producción esto sería una llamada a la API
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        nombre: userData.nombre,
        apellido: userData.apellido,
        rol: userData.rol || 'user',
        fecha_creacion: new Date(),
        activo: true
      };

      mockUsers.push(newUser);
      
      toast({
        title: "Usuario registrado",
        description: `Usuario ${newUser.nombre} ${newUser.apellido} registrado correctamente.`,
      });
    } catch (error) {
      toast({
        title: "Error en registro",
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthUser = {
    user,
    loading,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
