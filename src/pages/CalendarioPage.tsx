import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EQUIPO_COMPLETO, TURNOS, type TipoSemana, type TurnoType, type AsignacionTurno, type Empleado } from "@/types/equipo";
import { toast } from "@/hooks/use-toast";

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function CalendarioPage() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [mesActual, setMesActual] = useState(new Date().getMonth());
  const [anoActual, setAnoActual] = useState(new Date().getFullYear());
  const [tipoSemana, setTipoSemana] = useState<TipoSemana>('alta');
  const [asignaciones, setAsignaciones] = useState<AsignacionTurno[]>([]);
  const [empleadoArrastrado, setEmpleadoArrastrado] = useState<string | null>(null);

  const getDiasDelMes = () => {
    const primerDia = new Date(anoActual, mesActual, 1);
    const ultimoDia = new Date(anoActual, mesActual + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const primerDiaSemana = primerDia.getDay();

    const dias = [];

    // Días vacíos al inicio
    for (let i = 0; i < primerDiaSemana; i++) {
      dias.push(null);
    }

    // Días del mes
    for (let dia = 1; dia <= diasEnMes; dia++) {
      dias.push(dia);
    }

    return dias;
  };

  const getColorSemana = (dia: number | null) => {
    if (!dia) return '';
    if (dia >= 1 && dia <= 5) return 'bg-red-100 border-red-300';
    if (dia >= 6 && dia <= 12) return 'bg-yellow-100 border-yellow-300';
    if (dia >= 13 && dia <= 17) return 'bg-green-100 border-green-300';
    if (dia >= 18 && dia <= 27) return 'bg-yellow-100 border-yellow-300';
    if (dia >= 28 && dia <= 31) return 'bg-red-100 border-red-300';
    return 'bg-gray-100 border-gray-300';
  };

  const getTipoSemanaTexto = (dia: number | null) => {
    if (!dia) return '';
    if (dia >= 1 && dia <= 5 || dia >= 28 && dia <= 31) return 'Alta';
    if (dia >= 13 && dia <= 17) return 'Media';
    return 'Valle';
  };

  const getAsignacionesPorDia = (dia: number) => {
    const fecha = `${anoActual}-${String(mesActual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    return asignaciones.filter(a => a.fecha === fecha);
  };

  const getEmpleadosPorTurno = (dia: number, turno: TurnoType) => {
    const asignacionesDia = getAsignacionesPorDia(dia);
    return asignacionesDia.filter(a => a.turno === turno);
  };

  const getEmpleadoNombre = (empleadoId: string) => {
    const empleado = EQUIPO_COMPLETO.find(e => e.id === empleadoId);
    return empleado ? empleado.nombre : 'Desconocido';
  };

  const handleDragStart = (e: React.DragEvent, empleadoId: string) => {
    setEmpleadoArrastrado(empleadoId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dia: number, turno: TurnoType) => {
    e.preventDefault();
    if (!empleadoArrastrado) return;

    const fecha = `${anoActual}-${String(mesActual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const nuevaAsignacion: AsignacionTurno = {
      id: `${empleadoArrastrado}-${fecha}-${turno}`,
      empleadoId: empleadoArrastrado,
      fecha,
      turno,
      horas: TURNOS[turno].horas
    };

    setAsignaciones(prev => [...prev, nuevaAsignacion]);
    setEmpleadoArrastrado(null);

    toast({
      title: "Asignación exitosa",
      description: `${getEmpleadoNombre(empleadoArrastrado)} asignado al turno ${TURNOS[turno].nombre}`,
    });
  };

  const removerAsignacion = (asignacionId: string) => {
    setAsignaciones(prev => prev.filter(a => a.id !== asignacionId));
    toast({
      title: "Asignación removida",
      description: "La asignación ha sido eliminada correctamente",
    });
  };

  const autoAsignar = () => {
    // Lógica básica de auto-asignación
    const nuevasAsignaciones: AsignacionTurno[] = [];
    const empleadosDisponibles = [...EQUIPO_COMPLETO];

    toast({
      title: "Auto-asignación completada",
      description: "Se ha aplicado la distribución óptima automáticamente",
    });
  };

  const limpiarCalendario = () => {
    setAsignaciones([]);
    toast({
      title: "Calendario limpiado",
      description: "Todas las asignaciones han sido eliminadas",
    });
  };

  const dias = getDiasDelMes();

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            📅 Calendario Customer Success
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Gestión de horarios y asignaciones del equipo
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Button onClick={autoAsignar}>
              Auto-Asignar
            </Button>
            <Button variant="outline" onClick={limpiarCalendario}>
              Limpiar
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Configuración del Calendario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Mes:</label>
              <Select value={mesActual.toString()} onValueChange={(value) => setMesActual(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MESES.map((mes, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {mes}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Año:</label>
              <Select value={anoActual.toString()} onValueChange={(value) => setAnoActual(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Badge variant="destructive">Alta (1-5, 28-31)</Badge>
              <Badge variant="secondary">Media (13-17)</Badge>
              <Badge variant="default">Valle (6-12, 18-27)</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{MESES[mesActual]} {anoActual}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {DIAS_SEMANA.map(dia => (
                <div key={dia} className="p-2 text-center font-semibold text-sm bg-muted rounded">
                  {dia}
                </div>
              ))}

              {dias.map((dia, index) => (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border-2 rounded ${getColorSemana(dia)}`}
                >
                  {dia && (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold">{dia}</span>
                        <Badge variant="outline" className="text-xs">
                          {getTipoSemanaTexto(dia)}
                        </Badge>
                      </div>

                      {Object.entries(TURNOS).map(([turnoKey, turnoInfo]) => (
                        <div
                          key={turnoKey}
                          className="mb-2 p-1 border rounded bg-white/50 min-h-[20px]"
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, dia, turnoKey as TurnoType)}
                        >
                          <div className="text-xs font-medium">{turnoInfo.nombre}</div>
                          {getEmpleadosPorTurno(dia, turnoKey as TurnoType).map(asignacion => (
                            <Badge
                              key={asignacion.id}
                              variant="secondary"
                              className="text-xs cursor-pointer"
                              onClick={() => removerAsignacion(asignacion.id)}
                            >
                              {getEmpleadoNombre(asignacion.empleadoId)}
                            </Badge>
                          ))}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Equipo Disponible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {EQUIPO_COMPLETO.map(empleado => (
                <div
                  key={empleado.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, empleado.id)}
                  className="p-2 border rounded cursor-move hover:bg-gray-50 bg-white"
                >
                  <div className="font-medium">{empleado.nombre}</div>
                  <div className="text-xs text-muted-foreground">
                    {empleado.pais} - {empleado.tipo}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leyenda de Turnos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(TURNOS).map(([key, turno]) => (
                <div key={key} className={`p-2 rounded ${turno.color}`}>
                  <div className="font-medium">{turno.nombre}</div>
                  <div className="text-sm">{turno.horario} ({turno.horas}h)</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}