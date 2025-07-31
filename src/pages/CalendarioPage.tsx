import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StaffEditor } from "@/components/ui/StaffEditor";
import { BusinessRulesEditor } from "@/components/ui/BusinessRulesEditor";
import { type TipoSemana, type TurnoType, type AsignacionTurno, type Empleado } from "@/types/equipo";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Users, Settings, UserPlus, RotateCcw } from "lucide-react";

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// Configuración de demanda por tipo de semana
const DEMAND_CONFIG = {
  alta: {
    madrugada: { total: 1, atc: 1, onb: 0 },
    manana: { total: 7, atc: 6, onb: 1 },
    tarde: { total: 5, atc: 4, onb: 1 },
    senior_nocturno: { total: 1, atc: 1, onb: 0 }
  },
  media: {
    madrugada: { total: 1, atc: 1, onb: 0 },
    manana: { total: 6, atc: 5, onb: 1 },
    tarde: { total: 4, atc: 3, onb: 1 },
    senior_nocturno: { total: 1, atc: 1, onb: 0 }
  },
  valle: {
    madrugada: { total: 1, atc: 1, onb: 0 },
    manana: { total: 5, atc: 4, onb: 1 },
    tarde: { total: 3, atc: 2, onb: 1 },
    senior_nocturno: { total: 1, atc: 1, onb: 0 }
  }
};

export default function CalendarioPage() {
  const [mesActual, setMesActual] = useState(new Date().getMonth());
  const [anoActual, setAnoActual] = useState(new Date().getFullYear());
  const [asignaciones, setAsignaciones] = useState<AsignacionTurno[]>([]);
  const [empleadoArrastrado, setEmpleadoArrastrado] = useState<string | null>(null);
  const [showStaffEditor, setShowStaffEditor] = useState(false);
  const [showRulesEditor, setShowRulesEditor] = useState(false);
  const [customHours, setCustomHours] = useState<{[key: string]: number}>({});
  
  // Personal inicial corregido
  const [equipoConHoras, setEquipoConHoras] = useState<Empleado[]>([
    { id: 'helen', nombre: 'Helen', pais: 'Venezuela', departamento: 'ATC', tipo: 'Senior', horasMax: 45, lider: 'Edison', especialidad: 'Senior', horasAsignadas: 0, activo: true, fechaIngreso: '2022-01-15', nivel: 'Senior' },
    { id: 'mayra', nombre: 'Mayra', pais: 'Venezuela', departamento: 'ATC', tipo: 'Senior', horasMax: 45, lider: 'Edison', especialidad: 'Senior', horasAsignadas: 0, activo: true, fechaIngreso: '2022-03-20', nivel: 'Senior' },
    { id: 'jose', nombre: 'José Manuel', pais: 'Venezuela', departamento: 'ATC', tipo: 'Senior', horasMax: 45, lider: 'Edison', especialidad: 'Senior', horasAsignadas: 0, activo: true, fechaIngreso: '2022-02-10', nivel: 'Senior' },
    { id: 'stella', nombre: 'Stella', pais: 'Colombia', departamento: 'ATC', tipo: 'Regular', horasMax: 44, lider: 'Edison', especialidad: 'ATC', horasAsignadas: 0, activo: true, fechaIngreso: '2023-01-15', nivel: 'Semi-Senior' },
    { id: 'diana', nombre: 'Diana', pais: 'Colombia', departamento: 'ATC', tipo: 'Regular', horasMax: 44, lider: 'Edison', especialidad: 'ATC', horasAsignadas: 0, activo: true, fechaIngreso: '2023-02-20', nivel: 'Semi-Senior' },
    { id: 'juan', nombre: 'Juan Carlos', pais: 'Colombia', departamento: 'ATC', tipo: 'Regular', horasMax: 44, lider: 'Edison', especialidad: 'ATC', horasAsignadas: 0, activo: true, fechaIngreso: '2023-03-10', nivel: 'Semi-Senior' },
    { id: 'thalia', nombre: 'Thalia', pais: 'Colombia', departamento: 'ATC', tipo: 'Regular', horasMax: 44, lider: 'Edison', especialidad: 'ATC', horasAsignadas: 0, activo: true, fechaIngreso: '2023-04-15', nivel: 'Junior' },
    { id: 'alejandra', nombre: 'Alejandra', pais: 'Colombia', departamento: 'ATC', tipo: 'Regular', horasMax: 44, lider: 'Edison', especialidad: 'ATC', horasAsignadas: 0, activo: true, fechaIngreso: '2023-05-20', nivel: 'Junior' },
    { id: 'cristian', nombre: 'Cristian', pais: 'Colombia', departamento: 'ATC', tipo: 'Regular', horasMax: 44, lider: 'Edison', especialidad: 'ATC', horasAsignadas: 0, activo: true, fechaIngreso: '2023-06-10', nivel: 'Junior' },
    { id: 'ashley', nombre: 'Ashley', pais: 'Colombia', departamento: 'ONB', tipo: 'Onboarding', horasMax: 44, lider: 'Edison', especialidad: 'ONB', horasAsignadas: 0, activo: true, fechaIngreso: '2023-07-15', nivel: 'Junior' },
    { id: 'fernando', nombre: 'Fernando', pais: 'Colombia', departamento: 'ONB', tipo: 'Onboarding', horasMax: 44, lider: 'Edison', especialidad: 'ONB', horasAsignadas: 0, activo: true, fechaIngreso: '2023-08-20', nivel: 'Junior' },
    { id: 'carmen', nombre: 'Carmen', pais: 'México', departamento: 'ATC', tipo: 'Regular', horasMax: 44, lider: 'Edison', especialidad: 'ATC', horasAsignadas: 0, activo: true, fechaIngreso: '2023-09-10', nivel: 'Semi-Senior' },
    { id: 'sugli', nombre: 'Sugli', pais: 'Italia', departamento: 'ATC', tipo: 'Regular', horasMax: 45, lider: 'Edison', especialidad: 'ATC', horasAsignadas: 0, activo: true, fechaIngreso: '2023-10-15', nivel: 'Semi-Senior' },
    { id: 'nerean', nombre: 'Nerean', pais: 'Venezuela', departamento: 'ATC', tipo: 'Regular', horasMax: 45, lider: 'Edison', especialidad: 'ATC', horasAsignadas: 0, activo: true, fechaIngreso: '2023-11-20', nivel: 'Junior' },
    { id: 'belkis', nombre: 'Belkis', pais: 'Venezuela', departamento: 'ATC', tipo: 'Regular', horasMax: 45, lider: 'Edison', especialidad: 'ATC', horasAsignadas: 0, activo: true, fechaIngreso: '2023-12-10', nivel: 'Junior' },
    { id: 'nocturno', nombre: 'Nocturno ATC', pais: 'Europa', departamento: 'ATC', tipo: 'Regular', horasMax: 40, lider: 'Edison', especialidad: 'ATC', horasAsignadas: 0, activo: true, fechaIngreso: '2024-01-15', nivel: 'Semi-Senior' }
  ]);

  // Funciones auxiliares
  const getWeeksInMonth = (month: number, year: number) => {
    const weeks = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Empezar desde el domingo anterior o el primer día del mes
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());
    
    const currentDate = new Date(startDate);
    
    while (currentDate <= lastDay || currentDate.getDay() !== 0) {
      const weekStart = new Date(currentDate);
      const weekDays = [];
      
      for (let i = 0; i < 7; i++) {
        weekDays.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      weeks.push({
        start: weekStart,
        days: weekDays,
        id: weekStart.toISOString().split('T')[0]
      });
      
      if (currentDate.getDay() === 0 && currentDate > lastDay) break;
    }
    
    return weeks;
  };

  const determineWeekType = (weekStart: Date): TipoSemana => {
    const day = weekStart.getDate();
    
    if ([1,2,3,4,5,28,29,30,31].includes(day)) return 'alta';
    if ([13,14,15,16,17].includes(day)) return 'media';
    return 'valle';
  };

  const isDateInPast = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const canAutoAssignWeek = (weekDays: Date[]): boolean => {
    return weekDays.some(day => !isDateInPast(day));
  };

  // Funciones de drag and drop
  const handleDragStart = (e: React.DragEvent, empleadoId: string) => {
    setEmpleadoArrastrado(empleadoId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, fecha: Date, turno: TurnoType) => {
    e.preventDefault();
    
    if (!empleadoArrastrado || isDateInPast(fecha)) {
      setEmpleadoArrastrado(null);
      return;
    }

    const empleado = equipoConHoras.find(emp => emp.id === empleadoArrastrado);
    if (!empleado) return;

    const horasDelTurno = customHours[`${fecha.toDateString()}-${turno}-${empleadoArrastrado}`] || 8;
    
    // Verificar límite de horas
    if (empleado.horasAsignadas + horasDelTurno > empleado.horasMax) {
      toast({
        title: "Error",
        description: `${empleado.nombre} excedería su límite de ${empleado.horasMax}h semanales`,
        variant: "destructive"
      });
      setEmpleadoArrastrado(null);
      return;
    }

    // Crear nueva asignación
    const nuevaAsignacion: AsignacionTurno = {
      id: `${empleadoArrastrado}-${fecha.toISOString()}-${turno}`,
      empleadoId: empleadoArrastrado,
      fecha: fecha.toISOString().split('T')[0],
      turno,
      horas: horasDelTurno
    };

    setAsignaciones(prev => [...prev, nuevaAsignacion]);
    
    // Actualizar horas del empleado
    setEquipoConHoras(prev => prev.map(emp => 
      emp.id === empleadoArrastrado 
        ? { ...emp, horasAsignadas: emp.horasAsignadas + horasDelTurno }
        : emp
    ));

    setEmpleadoArrastrado(null);
    
    toast({
      title: "Asignación exitosa",
      description: `${empleado.nombre} asignado a ${turno} (${horasDelTurno}h)`
    });
  };

  // Auto-asignación inteligente
  const autoAssignWeek = (weekStart: Date, weekDays: Date[]) => {
    if (!canAutoAssignWeek(weekDays)) {
      toast({
        title: "Error",
        description: "No se puede auto-asignar en fechas pasadas",
        variant: "destructive"
      });
      return;
    }

    const weekType = determineWeekType(weekStart);
    const config = DEMAND_CONFIG[weekType];
    
    // Limpiar asignaciones existentes de esta semana
    const weekId = weekStart.toISOString().split('T')[0];
    setAsignaciones(prev => prev.filter(asig => 
      !weekDays.some(day => day.toISOString().split('T')[0] === asig.fecha)
    ));

    const nuevasAsignaciones: AsignacionTurno[] = [];
    
    weekDays.forEach((day, dayIndex) => {
      if (isDateInPast(day)) return;
      
      const dayName = DIAS_SEMANA[day.getDay()];
      
      // Asignaciones fijas
      if (dayName !== 'Vie') {
        // Sugli en madrugada (excepto viernes)
        nuevasAsignaciones.push({
          id: `sugli-${day.toISOString()}-madrugada`,
          empleadoId: 'sugli',
          fecha: day.toISOString().split('T')[0],
          turno: 'madrugada' as TurnoType,
          horas: 8
        });
      } else {
        // Diana reemplaza a Sugli los viernes
        nuevasAsignaciones.push({
          id: `diana-${day.toISOString()}-madrugada`,
          empleadoId: 'diana',
          fecha: day.toISOString().split('T')[0],
          turno: 'madrugada' as TurnoType,
          horas: 8
        });
      }

      // Ashley en mañana (ONB fijo)
      nuevasAsignaciones.push({
        id: `ashley-${day.toISOString()}-manana`,
        empleadoId: 'ashley',
        fecha: day.toISOString().split('T')[0],
        turno: 'manana' as TurnoType,
        horas: 8
      });

      // Fernando en tarde (ONB fijo)
      nuevasAsignaciones.push({
        id: `fernando-${day.toISOString()}-tarde`,
        empleadoId: 'fernando',
        fecha: day.toISOString().split('T')[0],
        turno: 'tarde' as TurnoType,
        horas: 8
      });

      // Senior nocturno rotativo (solo lunes a sábado)
      if (dayName !== 'Dom') {
        const seniors = ['helen', 'mayra', 'jose'];
        const seniorIndex = dayIndex % 3;
        const seniorId = seniors[seniorIndex];
        
        nuevasAsignaciones.push({
          id: `${seniorId}-${day.toISOString()}-senior_nocturno`,
          empleadoId: seniorId,
          fecha: day.toISOString().split('T')[0],
          turno: 'senior_nocturno' as TurnoType,
          horas: 8
        });
      }
    });

    setAsignaciones(prev => [...prev, ...nuevasAsignaciones]);
    
    // Recalcular horas de todos los empleados
    recalcularHorasEquipo();
    
    toast({
      title: "Auto-asignación completada",
      description: `Semana ${weekType} configurada correctamente`
    });
  };

  const recalcularHorasEquipo = () => {
    setEquipoConHoras(prev => prev.map(empleado => {
      const horasAsignadas = asignaciones
        .filter(asig => asig.empleadoId === empleado.id)
        .reduce((total, asig) => total + asig.horas, 0);
      
      return { ...empleado, horasAsignadas };
    }));
  };

  const limpiarSemana = (weekStart: Date, weekDays: Date[]) => {
    setAsignaciones(prev => prev.filter(asig => 
      !weekDays.some(day => day.toISOString().split('T')[0] === asig.fecha)
    ));
    recalcularHorasEquipo();
    toast({
      title: "Semana limpiada",
      description: "Todas las asignaciones de la semana han sido eliminadas"
    });
  };

  const updateCustomHours = (assignmentKey: string, hours: number) => {
    setCustomHours(prev => ({
      ...prev,
      [assignmentKey]: hours
    }));
  };

  const getAssignmentsForDay = (fecha: Date, turno: TurnoType) => {
    return asignaciones.filter(asig => 
      asig.fecha === fecha.toISOString().split('T')[0] && asig.turno === turno
    );
  };

  // Render
  const weeks = getWeeksInMonth(mesActual, anoActual);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (mesActual === 0) {
                setMesActual(11);
                setAnoActual(anoActual - 1);
              } else {
                setMesActual(mesActual - 1);
              }
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <h1 className="text-2xl font-bold">
            {MESES[mesActual]} {anoActual}
          </h1>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (mesActual === 11) {
                setMesActual(0);
                setAnoActual(anoActual + 1);
              } else {
                setMesActual(mesActual + 1);
              }
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex space-x-2">
          <Dialog open={showStaffEditor} onOpenChange={setShowStaffEditor}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Gestionar Personal
              </Button>
            </DialogTrigger>
          </Dialog>
          
          <Dialog open={showRulesEditor} onOpenChange={setShowRulesEditor}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Reglas de Negocio
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Personal disponible */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Personal Disponible
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {equipoConHoras.map(empleado => {
              const porcentaje = (empleado.horasAsignadas / empleado.horasMax) * 100;
              return (
                <div
                  key={empleado.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, empleado.id)}
                  className="p-3 border rounded-lg cursor-grab hover:shadow-md transition-shadow bg-white"
                >
                  <div className="text-sm font-medium">{empleado.nombre}</div>
                  <div className="text-xs text-gray-500 mb-2">
                    <Badge variant="outline" className="text-xs mr-1">
                      {empleado.pais}
                    </Badge>
                    <Badge variant={empleado.departamento === 'ATC' ? 'default' : 'secondary'} className="text-xs">
                      {empleado.departamento}
                    </Badge>
                  </div>
                  <div className="text-xs">
                    <div className="font-medium text-gray-700">
                      {empleado.horasAsignadas}h / {empleado.horasMax}h
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className={`h-2 rounded-full ${
                          porcentaje > 100 ? 'bg-red-500' : 
                          porcentaje > 90 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(porcentaje, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {porcentaje.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Calendario por semanas */}
      <div className="space-y-6">
        {weeks.map(week => {
          const weekType = determineWeekType(week.start);
          const canAutoAssign = canAutoAssignWeek(week.days);
          
          return (
            <Card key={week.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <CardTitle className="text-lg">
                      Semana del {week.start.getDate()} de {MESES[week.start.getMonth()]} 
                      al {week.days[6].getDate()} de {MESES[week.days[6].getMonth()]}
                    </CardTitle>
                    <Badge variant={
                      weekType === 'alta' ? 'destructive' : 
                      weekType === 'media' ? 'default' : 'secondary'
                    }>
                      {weekType}
                    </Badge>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => autoAssignWeek(week.start, week.days)}
                      disabled={!canAutoAssign}
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      {canAutoAssign ? 'Auto-asignar' : 'Fecha Pasada'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => limpiarSemana(week.start, week.days)}
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Limpiar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border p-2 bg-gray-50 text-left w-32">Turno</th>
                        {week.days.map(day => (
                          <th 
                            key={day.toISOString()} 
                            className={`border p-2 text-center min-w-32 ${
                              isDateInPast(day) ? 'bg-gray-100 text-gray-500' : 'bg-gray-50'
                            }`}
                          >
                            <div className="font-medium">{DIAS_SEMANA[day.getDay()]}</div>
                            <div className="text-sm text-gray-600">{day.getDate()}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(['madrugada', 'manana', 'tarde', 'senior_nocturno'] as TurnoType[]).map(turno => (
                        <tr key={turno}>
                          <td className="border p-2 bg-gray-50 font-medium capitalize">
                            {turno.replace('_', ' ')}
                          </td>
                          {week.days.map(day => (
                            <td
                              key={`${day.toISOString()}-${turno}`}
                              className={`border p-2 min-h-20 ${
                                isDateInPast(day) ? 'bg-gray-50' : 'bg-white'
                              }`}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, day, turno)}
                            >
                              <div className="space-y-1">
                                {getAssignmentsForDay(day, turno).map(asignacion => {
                                  const empleado = equipoConHoras.find(emp => emp.id === asignacion.empleadoId);
                                  if (!empleado) return null;
                                  
                                  return (
                                    <div
                                      key={asignacion.id}
                                      className="p-2 bg-blue-100 rounded text-xs flex justify-between items-center"
                                    >
                                      <span className="font-medium">{empleado.nombre}</span>
                                      <input
                                        type="number"
                                        min="1"
                                        max="12"
                                        value={asignacion.horas}
                                        onChange={(e) => {
                                          const newHours = parseInt(e.target.value) || 8;
                                          setAsignaciones(prev => prev.map(asig => 
                                            asig.id === asignacion.id 
                                              ? { ...asig, horas: newHours }
                                              : asig
                                          ));
                                          recalcularHorasEquipo();
                                        }}
                                        className="w-12 text-center border rounded"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialogs */}
      <StaffEditor
        staff={equipoConHoras}
        onUpdateStaff={setEquipoConHoras}
        open={showStaffEditor}
        onOpenChange={setShowStaffEditor}
      />
      
      <BusinessRulesEditor
        open={showRulesEditor}
        onOpenChange={setShowRulesEditor}
        onSave={(rules) => {
          console.log('Nuevas reglas guardadas:', rules);
          toast({
            title: "Reglas actualizadas",
            description: "Las reglas de negocio han sido guardadas correctamente"
          });
        }}
      />
    </div>
  );
}