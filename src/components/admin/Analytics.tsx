
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { BarChart3, Users, MessageSquare, TrendingUp, Download, Search } from 'lucide-react'

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d')

  // Get usage analytics
  const { data: analytics } = useQuery({
    queryKey: ['analytics', timeRange],
    queryFn: async () => {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
      const since = new Date()
      since.setDate(since.getDate() - days)

      const { data, error } = await supabase
        .from('usage_analytics')
        .select(`
          *,
          profiles!inner(full_name, area, rol_empresa)
        `)
        .gte('created_at', since.toISOString())

      if (error) throw error
      return data
    }
  })

  // Get user stats
  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('area, rol_empresa, created_at, last_login')

      if (error) throw error
      return data
    }
  })

  // Get knowledge base stats
  const { data: kbStats } = useQuery({
    queryKey: ['kb-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('project, active, created_at')

      if (error) throw error
      return data
    }
  })

  // Process data for charts
  const processAnalyticsData = () => {
    if (!analytics) return { dailyUsage: [], topQueries: [], userActivity: [] }

    // Daily usage
    const dailyUsage = analytics.reduce((acc: any, item) => {
      const date = new Date(item.created_at).toLocaleDateString()
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    const dailyUsageArray = Object.entries(dailyUsage).map(([date, count]) => ({
      date,
      queries: count
    }))

    // Top queries (simplified)
    const queryCount = analytics.reduce((acc: any, item) => {
      const query = item.query.substring(0, 50) + '...'
      acc[query] = (acc[query] || 0) + 1
      return acc
    }, {})

    const topQueries = Object.entries(queryCount)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }))

    // User activity by area
    const userActivity = analytics.reduce((acc: any, item) => {
      const area = item.profiles?.area || 'Unknown'
      acc[area] = (acc[area] || 0) + 1
      return acc
    }, {})

    const userActivityArray = Object.entries(userActivity).map(([area, count]) => ({
      area,
      queries: count
    }))

    return { dailyUsageArray, topQueries, userActivityArray }
  }

  const { dailyUsageArray, topQueries, userActivityArray } = processAnalyticsData()

  const processUserStats = () => {
    if (!userStats) return { byArea: [], byRole: [], activeUsers: 0 }

    const byArea = userStats.reduce((acc: any, user) => {
      acc[user.area] = (acc[user.area] || 0) + 1
      return acc
    }, {})

    const byRole = userStats.reduce((acc: any, user) => {
      acc[user.rol_empresa] = (acc[user.rol_empresa] || 0) + 1
      return acc
    }, {})

    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const activeUsers = userStats.filter(user => 
      user.last_login && new Date(user.last_login) > oneWeekAgo
    ).length

    const byAreaArray = Object.entries(byArea).map(([area, count]) => ({
      name: area,
      value: count
    }))

    const byRoleArray = Object.entries(byRole).map(([role, count]) => ({
      name: role,
      value: count
    }))

    return { byAreaArray, byRoleArray, activeUsers }
  }

  const { byAreaArray, byRoleArray, activeUsers } = processUserStats()

  const colors = ['#8B5CF6', '#A855F7', '#C084FC', '#DDD6FE', '#F3E8FF']

  return (
    <div className="h-full overflow-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">Estadísticas de uso y rendimiento de Cerebro</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
              <SelectItem value="90d">90 días</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                En los últimos {timeRange}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                Última semana
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">KB Artículos</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kbStats?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                En knowledge base
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Uso Diario</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyUsageArray}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="queries" stroke="#8B5CF6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Activity by Area */}
          <Card>
            <CardHeader>
              <CardTitle>Actividad por Área</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userActivityArray}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="area" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="queries" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* User Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Área</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={byAreaArray}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {byAreaArray.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribución por Rol</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={byRoleArray}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {byRoleArray.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Queries */}
        <Card>
          <CardHeader>
            <CardTitle>Consultas Más Frecuentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topQueries.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm truncate flex-1">{item.query}</span>
                  <span className="text-sm font-medium ml-2">{item.count}</span>
                </div>
              ))}
              {topQueries.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No hay datos de consultas disponibles
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Analytics
