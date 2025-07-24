import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EQUIPO_COMPLETO } from "@/types/equipo";
import { FileText, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

export default function ReportesPage() {
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            📊 Reportes
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Análisis de horas trabajadas y cumplimiento legal
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reportes Generados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Cumplimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">95%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alertas Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">3</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Optimización
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">87%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="horas" className="w-full">
        <TabsList>
          <TabsTrigger value="horas">Horas Trabajadas</TabsTrigger>
          <TabsTrigger value="cumplimiento">Cumplimiento Legal</TabsTrigger>
          <TabsTrigger value="eficiencia">Eficiencia</TabsTrigger>
        </TabsList>

        <TabsContent value="horas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Horas por Empleado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {EQUIPO_COMPLETO.map((empleado) => (
                  <div key={empleado.id} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <div className="font-medium">{empleado.nombre}</div>
                      <div className="text-sm text-muted-foreground">{empleado.pais} - {empleado.departamento}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">0 / {empleado.horasMax} horas</div>
                      <Badge variant="secondary">Dentro del límite</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cumplimiento" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>🇨🇴 Colombia</CardTitle>
                <p className="text-sm text-muted-foreground">Límite: 46 horas semanales</p>
              </CardHeader>
              <CardContent>
                <div className="text-green-600 font-medium">6 empleados - 100% en cumplimiento</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🇻🇪 Venezuela</CardTitle>
                <p className="text-sm text-muted-foreground">Límite: 45 horas semanales</p>
              </CardHeader>
              <CardContent>
                <div className="text-green-600 font-medium">5 empleados - 100% en cumplimiento</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🇲🇽 México</CardTitle>
                <p className="text-sm text-muted-foreground">Límite: 44 horas semanales</p>
              </CardHeader>
              <CardContent>
                <div className="text-green-600 font-medium">1 empleado - 100% en cumplimiento</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🇮🇹 Italia</CardTitle>
                <p className="text-sm text-muted-foreground">Límite: 45 horas semanales</p>
              </CardHeader>
              <CardContent>
                <div className="text-green-600 font-medium">1 empleado - 100% en cumplimiento</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="eficiencia" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Cobertura Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">87%</div>
                <p className="text-sm text-muted-foreground">De turnos cubiertos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Eficiencia de Asignación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">92%</div>
                <p className="text-sm text-muted-foreground">Optimización de recursos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Satisfacción del Equipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">89%</div>
                <p className="text-sm text-muted-foreground">Balance trabajo-vida</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}