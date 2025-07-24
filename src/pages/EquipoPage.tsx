import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EQUIPO_COMPLETO } from "@/types/equipo";
import { Users, Clock, Globe, Building } from "lucide-react";

export default function EquipoPage() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroDepartamento, setFiltroDepartamento] = useState("todos");
  const [filtroPais, setFiltroPais] = useState("todos");

  const equipoFiltrado = EQUIPO_COMPLETO.filter(empleado => {
    const cumpleBusqueda = empleado.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                          empleado.especialidad.toLowerCase().includes(busqueda.toLowerCase());
    const cumpleDepartamento = filtroDepartamento === "todos" || empleado.departamento === filtroDepartamento;
    const cumplePais = filtroPais === "todos" || empleado.pais === filtroPais;

    return cumpleBusqueda && cumpleDepartamento && cumplePais;
  });

  const getCountryFlag = (pais: string) => {
    const flags: { [key: string]: string } = {
      'Colombia': '🇨🇴',
      'Venezuela': '🇻🇪',
      'México': '🇲🇽',
      'Italia': '🇮🇹'
    };
    return flags[pais] || '🌍';
  };

  const getTipoColor = (tipo: string) => {
    if (tipo === 'Senior') return 'bg-purple-100 text-purple-800';
    if (tipo === 'Regular') return 'bg-blue-100 text-blue-800';
    if (tipo === 'Híbrido') return 'bg-green-100 text-green-800';
    if (tipo === 'Madrugada') return 'bg-indigo-100 text-indigo-800';
    if (tipo.includes('AM')) return 'bg-yellow-100 text-yellow-800';
    if (tipo.includes('PM')) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Estadísticas del equipo
  const stats = {
    totalMiembros: EQUIPO_COMPLETO.length,
    porDepartamento: {
      ATC: EQUIPO_COMPLETO.filter(e => e.departamento === 'ATC').length,
      Onboarding: EQUIPO_COMPLETO.filter(e => e.departamento === 'Onboarding').length
    },
    porPais: {
      Colombia: EQUIPO_COMPLETO.filter(e => e.pais === 'Colombia').length,
      Venezuela: EQUIPO_COMPLETO.filter(e => e.pais === 'Venezuela').length,
      México: EQUIPO_COMPLETO.filter(e => e.pais === 'México').length,
      Italia: EQUIPO_COMPLETO.filter(e => e.pais === 'Italia').length
    },
    totalHoras: EQUIPO_COMPLETO.reduce((sum, e) => sum + e.horasMax, 0)
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            👥 Gestión de Equipo
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Administra la información y horarios del equipo Customer Success
          </p>
          <div className="flex justify-center mt-4">
            <Button>Agregar Miembro</Button>
          </div>
        </CardHeader>
      </Card>

      {/* Estadísticas del equipo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Miembros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMiembros}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building className="h-4 w-4" />
              Departamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              ATC: {stats.porDepartamento.ATC} | Onboarding: {stats.porDepartamento.Onboarding}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Países
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              CO: {stats.porPais.Colombia} | VE: {stats.porPais.Venezuela} | MX: {stats.porPais.México} | IT: {stats.porPais.Italia}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Total Horas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHoras}</div>
            <p className="text-xs text-muted-foreground">Semanales máximas</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="lista" className="w-full">
        <TabsList>
          <TabsTrigger value="lista">Lista de Equipo</TabsTrigger>
          <TabsTrigger value="distribucion">Distribución</TabsTrigger>
          <TabsTrigger value="horarios">Horarios Asignados</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filtros y Búsqueda</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Buscar por nombre o especialidad..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="max-w-sm"
              />

              <Select value={filtroDepartamento} onValueChange={setFiltroDepartamento}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los departamentos</SelectItem>
                  <SelectItem value="ATC">ATC</SelectItem>
                  <SelectItem value="Onboarding">Onboarding</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtroPais} onValueChange={setFiltroPais}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los países</SelectItem>
                  <SelectItem value="Colombia">Colombia</SelectItem>
                  <SelectItem value="Venezuela">Venezuela</SelectItem>
                  <SelectItem value="México">México</SelectItem>
                  <SelectItem value="Italia">Italia</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Miembros del Equipo ({equipoFiltrado.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>País</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Horas Máx</TableHead>
                    <TableHead>Líder</TableHead>
                    <TableHead>Especialidad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipoFiltrado.map((empleado) => (
                    <TableRow key={empleado.id}>
                      <TableCell className="font-medium">{empleado.nombre}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getCountryFlag(empleado.pais)}
                          {empleado.pais}
                        </div>
                      </TableCell>
                      <TableCell>{empleado.departamento}</TableCell>
                      <TableCell>
                        <Badge className={getTipoColor(empleado.tipo)}>
                          {empleado.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>{empleado.horasMax}h</TableCell>
                      <TableCell>{empleado.lider}</TableCell>
                      <TableCell>
                        <div className="max-w-xs text-sm text-muted-foreground">
                          {empleado.especialidad}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribucion" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por País</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.entries(stats.porPais).map(([pais, cantidad]) => (
                  <div key={pais} className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-2">
                      {getCountryFlag(pais)}
                      {pais}
                    </div>
                    <Badge>{cantidad}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución por Departamento</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.entries(stats.porDepartamento).map(([dept, cantidad]) => (
                  <div key={dept} className="flex justify-between items-center py-2">
                    <span>{dept}</span>
                    <Badge variant="secondary">{cantidad}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="horarios">
          <Card>
            <CardHeader>
              <CardTitle>Horarios Asignados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Esta sección mostrará los horarios actualmente asignados a cada miembro del equipo.
                Funcionalidad en desarrollo.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}