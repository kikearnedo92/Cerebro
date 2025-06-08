
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  ThumbsUp,
  Download,
  Calendar,
  Filter,
  Activity,
  Target,
  Clock,
  Star
} from 'lucide-react';
import { DashboardStats } from '@/types';

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Mock data para el demo
  useEffect(() => {
    const mockStats: DashboardStats = {
      total_consultas_hoy: 127,
      total_consultas_semana: 892,
      total_consultas_mes: 3456,
      usuarios_activos: 23,
      rating_promedio: 4.2,
      proyectos_mas_consultados: [
        { proyecto: 'ATC', consultas: 342 },
        { proyecto: 'Políticas-Colombia', consultas: 298 },
        { proyecto: 'Scripts-Respuesta', consultas: 256 },
        { proyecto: 'Normativas-Compliance', consultas: 187 },
        { proyecto: 'Research-Nuevas', consultas: 123 }
      ],
      usage_trends: [
        { fecha: '2024-01-08', consultas: 45 },
        { fecha: '2024-01-09', consultas: 52 },
        { fecha: '2024-01-10', consultas: 48 },
        { fecha: '2024-01-11', consultas: 61 },
        { fecha: '2024-01-12', consultas: 55 },
        { fecha: '2024-01-13', consultas: 73 },
        { fecha: '2024-01-14', consultas: 67 }
      ],
      top_topics: [
        { topic: 'Remesas Colombia', count: 89 },
        { topic: 'Atención al cliente', count: 76 },
        { topic: 'Compliance', count: 54 },
        { topic: 'Políticas España', count: 43 },
        { topic: 'Scripts respuesta', count: 38 }
      ]
    };
    setStats(mockStats);
  }, []);

  const pieColors = ['#1E40AF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (!stats) {
    return <div>Cargando estadísticas...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Métricas de uso y rendimiento de Retorna AI</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Último día</SelectItem>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Exportar Reporte
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Consultas Hoy</p>
                <p className="text-3xl font-bold text-primary">{stats.total_consultas_hoy}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% vs ayer
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                <p className="text-3xl font-bold text-green-600">{stats.usuarios_activos}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +5% esta semana
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Consultas del Mes</p>
                <p className="text-3xl font-bold text-blue-600">{stats.total_consultas_mes.toLocaleString()}</p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +28% vs mes anterior
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rating Promedio</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.rating_promedio}</p>
                <div className="flex items-center mt-1">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= Math.floor(stats.rating_promedio)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">de 5</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ThumbsUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Tendencia de Uso</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.usage_trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="fecha" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
                  formatter={(value) => [value, 'Consultas']}
                />
                <Line 
                  type="monotone" 
                  dataKey="consultas" 
                  stroke="#1E40AF" 
                  strokeWidth={3}
                  dot={{ fill: '#1E40AF', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Proyectos Más Consultados</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.proyectos_mas_consultados} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="proyecto" type="category" width={100} />
                <Tooltip formatter={(value) => [value, 'Consultas']} />
                <Bar dataKey="consultas" fill="#1E40AF" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Topics Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Temas Más Consultados</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.top_topics}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  nameKey="topic"
                  label={({ topic, percent }) => `${topic} ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.top_topics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Actividad Reciente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { user: 'María G.', action: 'Consultó sobre políticas de Colombia', time: 'Hace 5 min', type: 'query' },
                { user: 'Carlos R.', action: 'Agregó nuevo documento de compliance', time: 'Hace 12 min', type: 'upload' },
                { user: 'Ana L.', action: 'Valoró positivamente una respuesta', time: 'Hace 18 min', type: 'rating' },
                { user: 'Diego M.', action: 'Inició nueva conversación', time: 'Hace 25 min', type: 'chat' },
                { user: 'Sofia P.', action: 'Exportó conversación a PDF', time: 'Hace 32 min', type: 'export' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    activity.type === 'query' ? 'bg-blue-100 text-blue-700' :
                    activity.type === 'upload' ? 'bg-green-100 text-green-700' :
                    activity.type === 'rating' ? 'bg-yellow-100 text-yellow-700' :
                    activity.type === 'chat' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {activity.user.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                    <p className="text-xs text-gray-600 truncate">{activity.action}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Métricas de Rendimiento</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Tiempo de Respuesta</span>
                  <span className="text-sm text-gray-600">1.2s promedio</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Precisión de Respuestas</span>
                  <span className="text-sm text-gray-600">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Satisfacción del Usuario</span>
                  <span className="text-sm text-gray-600">4.2/5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '84%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Uso de la Base de Conocimiento</span>
                  <span className="text-sm text-gray-600">78%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Consultas resueltas automáticamente:</span>
                  <Badge variant="secondary">89%</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Escalaciones a humanos:</span>
                  <Badge variant="outline">11%</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
