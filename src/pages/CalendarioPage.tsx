import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EQUIPO_COMPLETO, TURNOS, type TipoSemana, type TurnoType, type AsignacionTurno, type Empleado } from "@/types/equipo";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, ChevronLeft, ChevronRight, BarChart3, Users, Edit, Calendar } from "lucide-react";

// Demand patterns for intelligent assignment
const REAL_DEMAND_ANALYSIS = {
  monthlyPattern: {
    alta: { 
      days: [1,2,3,4,5,28,29,30,31], 
      volumeIncrease: 125,
      description: "Fin/Inicio mes - Pagos quincenales" 
    },
    media: { 
      days: [13,14,15,16,17], 
      volumeIncrease: 110,
      description: "Quincenas - Pagos quincenales" 
    },
    valle: { 
      days: [6,7,8,9,10,11,12,18,19,20,21,22,23,24,25,26,27], 
      volumeIncrease: 85,
      description: "Post-pico, estabilización" 
    }
  }
};

// Staffing configuration by week type
const STAFFING_CONFIG = {
  ALTA: {
    manana: { total: 7, atc: 6, onb: 1 },
    tarde: { total: 5, atc: 4, onb: 1 },
    madrugada: { total: 1, atc: 1, onb: 0 },
    senior_nocturno: { total: 1, atc: 1, onb: 0 }
  },
  MEDIA: {
    manana: { total: 6, atc: 5, onb: 1 },
    tarde: { total: 4, atc: 3, onb: 1 },
    madrugada: { total: 1, atc: 1, onb: 0 },
    senior_nocturno: { total: 1, atc: 1, onb: 0 }
  },
  VALLE: {
    manana: { total: 5, atc: 4, onb: 1 },
    tarde: { total: 3, atc: 2, onb: 1 },
    madrugada: { total: 1, atc: 1, onb: 0 },
    senior_nocturno: { total: 1, atc: 1, onb: 0 }
  }
};

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function CalendarioPage() {
  const [mesActual, setMesActual] = useState(new Date().getMonth());
  const [anoActual, setAnoActual] = useState(new Date().getFullYear());
  const [asignaciones, setAsignaciones] = useState<AsignacionTurno[]>([]);
  const [empleadoArrastrado, setEmpleadoArrastrado] = useState<string | null>(null);
  const [equipoConHoras, setEquipoConHoras] = useState<Empleado[]>([
    ...EQUIPO_COMPLETO,
    {
      id: 'nocturno-atc',
      nombre: 'Nocturno ATC',
      pais: 'Europa',
      departamento: 'ATC',
      tipo: 'Senior',
      horasMax: 45,
      lider: 'N/A',
      especialidad: 'Senior Nocturno',
      horasAsignadas: 0,
      activo: true,
      fechaIngreso: '2024-01-01',
      nivel: 'Senior'
    } as Empleado
  ]);
  const [staffHours, setStaffHours] = useState<Record<string, number>>({});
  const [editingEmployee, setEditingEmployee] = useState<Empleado | null>(null);

  // Initialize staff hours
  useEffect(() => {
    const initialHours: Record<string, number> = {};
    equipoConHoras.forEach(emp => {
      initialHours[emp.id] = 0;
    });
    setStaffHours(initialHours);
  }, [equipoConHoras]);

  // Recalculate hours when assignments change
  useEffect(() => {
    const newStaffHours: Record<string, number> = {};
    
    equipoConHoras.forEach(emp => {
      const totalHours = asignaciones
        .filter(a => a.empleadoId === emp.id)
        .reduce((sum, a) => sum + a.horas, 0);
      newStaffHours[emp.id] = totalHours;
    });
    
    setStaffHours(newStaffHours);
  }, [asignaciones, equipoConHoras]);

  // Get week type based on day of month
  const getWeekTypeFromDate = (dayOfMonth: number): TipoSemana => {
    if (REAL_DEMAND_ANALYSIS.monthlyPattern.alta.days.includes(dayOfMonth)) return 'alta';
    if (REAL_DEMAND_ANALYSIS.monthlyPattern.media.days.includes(dayOfMonth)) return 'media';
    return 'valle';
  };

  // Get complete calendar including cross-month weeks
  const getCalendarWithCompleteWeeks = () => {
    const startOfMonth = new Date(anoActual, mesActual, 1);
    const endOfMonth = new Date(anoActual, mesActual + 1, 0);
    
    // Start from the Monday of the week containing the 1st
    const startDate = new Date(startOfMonth);
    const dayOfWeek = startDate.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : -(dayOfWeek - 1);
    startDate.setDate(startDate.getDate() + mondayOffset);
    
    // End at the Sunday of the week containing the last day
    const endDate = new Date(endOfMonth);
    const endDayOfWeek = endDate.getDay();
    const sundayOffset = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek;
    endDate.setDate(endDate.getDate() + sundayOffset);
    
    const weeks = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(currentDate);
        const isCurrentMonth = dayDate.getMonth() === mesActual;
        
        week.push({
          date: dayDate.getDate(),
          fullDate: new Date(dayDate),
          dayName: DIAS_SEMANA[dayDate.getDay()],
          isCurrentMonth,
          weekType: isCurrentMonth ? getWeekTypeFromDate(dayDate.getDate()) : 'valle' as TipoSemana,
          fecha: `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
    }
    
    return weeks;
  };

  // Auto-assign intelligent staffing for a week
  const autoAsignarSemana = (weekDays: any[]) => {
    const mondayDate = weekDays.find(d => d.dayName === 'Lun');
    if (!mondayDate) return;
    
    const weekType = mondayDate.weekType.toUpperCase() as 'ALTA' | 'MEDIA' | 'VALLE';
    const config = STAFFING_CONFIG[weekType];
    
    // Clear week first
    const weekDates = weekDays.map(d => d.fecha);
    setAsignaciones(prev => prev.filter(a => !weekDates.includes(a.fecha)));
    
    const nuevasAsignaciones: AsignacionTurno[] = [];
    
    // Assign Monday to Saturday (exclude Sunday for now)
    weekDays.slice(1, 7).forEach(day => {
      const fecha = day.fecha;
      const diaSemana = day.fullDate.getDay();
      
      // Fixed assignments
      assignFixedStaff(nuevasAsignaciones, fecha, diaSemana);
      
      // Fill remaining slots according to configuration
      Object.entries(config).forEach(([turno, shiftConfig]) => {
        fillShiftToCapacity(nuevasAsignaciones, fecha, turno as TurnoType, shiftConfig);
      });
    });
    
    setAsignaciones(prev => [...prev, ...nuevasAsignaciones]);
    
    toast({
      title: "🎯 Auto-asignación Completada",
      description: `Semana ${weekType} asignada con ${nuevasAsignaciones.length} turnos`,
    });
  };

  const assignFixedStaff = (assignments: AsignacionTurno[], fecha: string, diaSemana: number) => {
    // Ashley: Mañana ONB (Monday-Saturday)
    if (diaSemana >= 1 && diaSemana <= 6) {
      const ashley = equipoConHoras.find(e => e.nombre.includes('Ashley'));
      if (ashley && !hasStaffAssignment(assignments, ashley.id, fecha)) {
        assignments.push({
          id: `${ashley.id}-${fecha}-manana-fixed`,
          empleadoId: ashley.id,
          fecha,
          turno: 'manana',
          horas: TURNOS.manana.horas
        });
      }
    }

    // Fernando: Tarde ONB (Monday-Saturday)  
    if (diaSemana >= 1 && diaSemana <= 6) {
      const fernando = equipoConHoras.find(e => e.nombre.includes('Fernando'));
      if (fernando && !hasStaffAssignment(assignments, fernando.id, fecha)) {
        assignments.push({
          id: `${fernando.id}-${fecha}-tarde-fixed`,
          empleadoId: fernando.id,
          fecha,
          turno: 'tarde',
          horas: TURNOS.tarde.horas
        });
      }
    }

    // Sugli: Madrugada (except Friday-Saturday)
    if (diaSemana >= 1 && diaSemana <= 4) {
      const sugli = equipoConHoras.find(e => e.nombre.includes('Sugli'));
      if (sugli && !hasStaffAssignment(assignments, sugli.id, fecha)) {
        assignments.push({
          id: `${sugli.id}-${fecha}-madrugada-fixed`,
          empleadoId: sugli.id,
          fecha,
          turno: 'madrugada',
          horas: TURNOS.madrugada.horas
        });
      }
    } else if (diaSemana === 5 || diaSemana === 6) {
      // Diana replaces Sugli on Friday-Saturday
      const diana = equipoConHoras.find(e => e.nombre.includes('Diana'));
      if (diana && !hasStaffAssignment(assignments, diana.id, fecha)) {
        assignments.push({
          id: `${diana.id}-${fecha}-madrugada-backup`,
          empleadoId: diana.id,
          fecha,
          turno: 'madrugada',
          horas: TURNOS.madrugada.horas
        });
      }
    }
  };

  const fillShiftToCapacity = (assignments: AsignacionTurno[], fecha: string, shift: TurnoType, config: {total: number, atc: number, onb: number}) => {
    const currentAssignments = assignments.filter(a => a.fecha === fecha && a.turno === shift);
    const needed = config.total - currentAssignments.length;
    
    if (needed <= 0) return;
    
    // Get available staff (not assigned on this day)
    const availableStaff = equipoConHoras.filter(emp => 
      !hasStaffAssignment(assignments, emp.id, fecha) &&
      canWorkOnDate(emp, fecha) &&
      !isOverHourLimit(emp.id, assignments)
    );
    
    // Fill ATC positions
    const atcStaff = availableStaff.filter(emp => emp.departamento === 'ATC').slice(0, Math.min(needed, config.atc));
    atcStaff.forEach(emp => {
      assignments.push({
        id: `${emp.id}-${fecha}-${shift}-auto`,
        empleadoId: emp.id,
        fecha,
        turno: shift,
        horas: TURNOS[shift].horas
      });
    });
    
    // Fill ONB positions if needed
    const onbNeeded = needed - atcStaff.length;
    if (onbNeeded > 0) {
      const onbStaff = availableStaff.filter(emp => emp.departamento === 'Onboarding').slice(0, Math.min(onbNeeded, config.onb));
      onbStaff.forEach(emp => {
        assignments.push({
          id: `${emp.id}-${fecha}-${shift}-auto`,
          empleadoId: emp.id,
          fecha,
          turno: shift,
          horas: TURNOS[shift].horas
        });
      });
    }
  };

  const hasStaffAssignment = (assignments: AsignacionTurno[], staffId: string, fecha: string): boolean => {
    return assignments.some(a => a.empleadoId === staffId && a.fecha === fecha);
  };

  const canWorkOnDate = (emp: Empleado, fecha: string): boolean => {
    const date = new Date(fecha);
    const dayOfWeek = date.getDay();
    
    // Colombians can't work on Sundays
    if (emp.pais === 'Colombia' && dayOfWeek === 0) return false;
    
    return true;
  };

  const isOverHourLimit = (staffId: string, assignments: AsignacionTurno[]): boolean => {
    const staff = equipoConHoras.find(e => e.id === staffId);
    if (!staff) return true;
    
    const currentHours = staffHours[staffId] || 0;
    const maxHours = staff.pais === 'Colombia' ? 44 : 45;
    
    return currentHours + 8 > maxHours;
  };

  // Drag and drop functions
  const onDragStart = (e: React.DragEvent, empleadoId: string) => {
    setEmpleadoArrastrado(empleadoId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const element = e.currentTarget as HTMLElement;
    element.classList.add('bg-blue-50', 'border-blue-300');
  };

  const onDragLeave = (e: React.DragEvent) => {
    const element = e.currentTarget as HTMLElement;
    element.classList.remove('bg-blue-50', 'border-blue-300');
  };

  const onDrop = (e: React.DragEvent, fecha: string, turno: TurnoType) => {
    e.preventDefault();
    const element = e.currentTarget as HTMLElement;
    element.classList.remove('bg-blue-50', 'border-blue-300');
    
    if (!empleadoArrastrado) return;

    const empleado = equipoConHoras.find(emp => emp.id === empleadoArrastrado);
    if (!empleado) return;

    // Validations
    const yaAsignado = asignaciones.some(a => a.empleadoId === empleado.id && a.fecha === fecha);
    if (yaAsignado) {
      toast({
        title: "❌ Ya asignado",
        description: `${empleado.nombre} ya tiene turno este día`,
        variant: "destructive"
      });
      setEmpleadoArrastrado(null);
      return;
    }

    // Sunday restriction for Colombians
    const fechaObj = new Date(fecha);
    const esDomingo = fechaObj.getDay() === 0;
    
    if (esDomingo && empleado.pais === 'Colombia') {
      toast({
        title: "❌ Restricción Domingo",
        description: "Empleados colombianos no pueden trabajar domingos",
        variant: "destructive"
      });
      setEmpleadoArrastrado(null);
      return;
    }

    // Hour limits validation
    const horasActuales = staffHours[empleado.id] || 0;
    const maxHoras = empleado.pais === 'Colombia' ? 44 : 45;
    const nuevasHoras = horasActuales + TURNOS[turno].horas;
    
    if (nuevasHoras > maxHoras) {
      toast({
        title: "⚠️ Límite Excedido",
        description: `${empleado.nombre}: ${nuevasHoras}h > ${maxHoras}h máximo`,
        variant: "destructive"
      });
      setEmpleadoArrastrado(null);
      return;
    }

    // Create assignment
    const nuevaAsignacion: AsignacionTurno = {
      id: `${empleado.id}-${fecha}-${turno}-${Date.now()}`,
      empleadoId: empleado.id,
      fecha,
      turno,
      horas: TURNOS[turno].horas
    };

    setAsignaciones(prev => [...prev, nuevaAsignacion]);
    setEmpleadoArrastrado(null);
    
    toast({
      title: "✅ Asignado",
      description: `${empleado.nombre} → ${TURNOS[turno].nombre} (${nuevasHoras}h total)`,
    });
  };

  // Remove assignment
  const eliminarAsignacion = (assignmentId: string) => {
    setAsignaciones(prev => prev.filter(a => a.id !== assignmentId));
    toast({
      title: "🗑️ Eliminado",
      description: "Asignación removida",
    });
  };

  // Navigation
  const navigateMonth = (direction: number) => {
    const newDate = new Date(anoActual, mesActual + direction, 1);
    setMesActual(newDate.getMonth());
    setAnoActual(newDate.getFullYear());
  };

  // Check if date is in the past
  const isPastDate = (fecha: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(fecha);
    return checkDate < today;
  };

  // Clear week
  const limpiarSemana = (weekDays: any[]) => {
    const weekDates = weekDays.map(d => d.fecha);
    setAsignaciones(prev => prev.filter(a => !weekDates.includes(a.fecha)));
    toast({
      title: "🗑️ Semana Limpiada",
      description: "Todas las asignaciones de la semana han sido eliminadas",
    });
  };

  // Reset all assignments
  const resetAllAssignments = () => {
    setAsignaciones([]);
    toast({
      title: "🔄 Reset Completo",
      description: "Todas las asignaciones han sido eliminadas",
    });
  };

  // Edit employee
  const saveEmployeeChanges = (updatedEmployee: Empleado) => {
    setEquipoConHoras(prev => prev.map(emp => 
      emp.id === updatedEmployee.id ? updatedEmployee : emp
    ));
    setEditingEmployee(null);
    toast({
      title: "✅ Empleado Actualizado",
      description: `Información de ${updatedEmployee.nombre} guardada`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">📅 Calendario de Turnos 24/7</h1>
          <Badge className="text-lg px-4 py-2">
            {MESES[mesActual]} {anoActual}
          </Badge>
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={() => navigateMonth(-1)} variant="outline" size="sm">
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>
          <Button onClick={() => navigateMonth(1)} variant="outline" size="sm">
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Vista Mensual Completa (Semanas Completas)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getCalendarWithCompleteWeeks().map((semana, weekIndex) => {
                const weekCoverage = Math.round(
                  (semana.reduce((total, day) => {
                    return total + asignaciones.filter(a => a.fecha === day.fecha).length;
                  }, 0) / (semana.length * 4)) * 100
                );

                const mondayDay = semana.find(d => d.dayName === 'Lun');
                const sundayDay = semana.find(d => d.dayName === 'Dom');
                const weekType = mondayDay?.weekType || 'valle';

                return (
                  <div key={weekIndex} className="mb-8 border rounded-lg overflow-hidden">
                    {/* Week header */}
                    <div className="bg-gray-50 p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="font-semibold">
                            Semana {weekIndex + 1}: {mondayDay?.date} - {sundayDay?.date}
                          </span>
                          <Badge className={`${
                            weekType === 'alta' ? 'bg-red-100 text-red-800' :
                            weekType === 'media' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {weekType.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {weekCoverage}% cubierto
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => autoAsignarSemana(semana)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={semana.some(dia => isPastDate(dia.fecha))}
                          >
                            🎯 Auto-Asignar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => limpiarSemana(semana)}
                            className="hover:bg-red-50 hover:text-red-700"
                          >
                            🗑️ Limpiar
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Week days header */}
                    <div className="grid grid-cols-7 border-b bg-gray-25">
                      {DIAS_SEMANA.map((dia) => (
                        <div key={dia} className="p-3 text-center font-medium text-gray-700 border-r last:border-r-0">
                          {dia}
                        </div>
                      ))}
                    </div>
                    
                    {/* Week grid */}
                    <div className="grid grid-cols-7">
                      {semana.map((dia, diaIndex) => {
                        const pastDate = isPastDate(dia.fecha);
                        
                        return (
                          <div key={diaIndex} className="border-r last:border-r-0">
                            <div className={`p-2 text-center text-sm font-medium border-b ${
                              !dia.isCurrentMonth ? 'bg-gray-100 text-gray-400' :
                              pastDate ? 'bg-gray-100 text-gray-500' :
                              dia.weekType === 'alta' ? 'bg-red-100 text-red-800' :
                              dia.weekType === 'media' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {dia.date}
                            </div>
                            
                            {Object.entries(TURNOS).map(([turno, info]) => {
                              const asignacionesTurno = asignaciones.filter(a => 
                                a.fecha === dia.fecha && a.turno === turno
                              );
                              
                              return (
                                <div
                                  key={turno}
                                  className={`min-h-[80px] p-2 border-b last:border-b-0 transition-colors ${
                                    pastDate ? 'bg-gray-50 opacity-60 pointer-events-none' : 'hover:bg-gray-50'
                                  }`}
                                  onDragOver={!pastDate ? onDragOver : undefined}
                                  onDragLeave={!pastDate ? onDragLeave : undefined}
                                  onDrop={!pastDate ? (e) => onDrop(e, dia.fecha, turno as TurnoType) : undefined}
                                >
                                  <div className="text-xs font-medium text-gray-600 mb-2">
                                    {turno.substring(0, 3).toUpperCase()}
                                  </div>
                                  <div className="space-y-1">
                                    {asignacionesTurno.map((asignacion) => {
                                      const empleado = equipoConHoras.find(e => e.id === asignacion.empleadoId);
                                      if (!empleado) return null;
                                      
                                      const flagEmoji = empleado.pais === 'Colombia' ? '🇨🇴' : 
                                                      empleado.pais === 'Venezuela' ? '🇻🇪' : 
                                                      empleado.pais === 'México' ? '🇲🇽' : 
                                                      empleado.pais === 'Europa' ? '🇪🇺' : '🇮🇹';
                                      
                                      return (
                                        <div
                                          key={asignacion.id}
                                          className={`text-xs px-2 py-1 rounded cursor-pointer hover:opacity-80 ${
                                            empleado.departamento === 'ATC' ? 'bg-blue-100 text-blue-800' : 
                                            'bg-purple-100 text-purple-800'
                                          }`}
                                          onClick={!pastDate ? () => eliminarAsignacion(asignacion.id) : undefined}
                                          title={`${empleado.nombre} - ${info.nombre} (${TURNOS[turno as TurnoType].horas}h)${!pastDate ? ' - Click para eliminar' : ''}`}
                                        >
                                          {empleado.nombre.split(' ')[0]} {flagEmoji}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Staff panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Personal Disponible
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {equipoConHoras.map((empleado) => {
                  const horasSemanales = staffHours[empleado.id] || 0;
                  const maxHoras = empleado.pais === 'Colombia' ? 44 : 45;
                  const porcentajeHoras = (horasSemanales / maxHoras) * 100;
                  
                  return (
                    <div
                      key={empleado.id}
                      className="p-3 bg-white rounded-lg border cursor-move hover:shadow-md transition-all duration-200"
                      draggable
                      onDragStart={(e) => onDragStart(e, empleado.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate flex items-center gap-2">
                            {empleado.nombre}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setEditingEmployee(empleado)}>
                                  <Edit className="w-3 h-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Editar Empleado</DialogTitle>
                                </DialogHeader>
                                {editingEmployee && (
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-medium">Nombre</label>
                                      <Input 
                                        value={editingEmployee.nombre}
                                        onChange={(e) => setEditingEmployee({...editingEmployee, nombre: e.target.value})}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">País</label>
                                      <Select value={editingEmployee.pais} onValueChange={(value) => setEditingEmployee({...editingEmployee, pais: value})}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Colombia">Colombia</SelectItem>
                                          <SelectItem value="Venezuela">Venezuela</SelectItem>
                                          <SelectItem value="México">México</SelectItem>
                                          <SelectItem value="Europa">Europa</SelectItem>
                                          <SelectItem value="Italia">Italia</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Departamento</label>
                                      <Select value={editingEmployee.departamento} onValueChange={(value) => setEditingEmployee({...editingEmployee, departamento: value})}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="ATC">ATC</SelectItem>
                                          <SelectItem value="Onboarding">Onboarding</SelectItem>
                                          <SelectItem value="Híbrido">Híbrido</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Nivel</label>
                                      <Select value={editingEmployee.nivel} onValueChange={(value) => setEditingEmployee({...editingEmployee, nivel: value as any})}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Junior">Junior</SelectItem>
                                          <SelectItem value="Semi-Senior">Semi-Senior</SelectItem>
                                          <SelectItem value="Senior">Senior</SelectItem>
                                          <SelectItem value="Lead">Lead</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button onClick={() => saveEmployeeChanges(editingEmployee)} className="flex-1">
                                        Guardar
                                      </Button>
                                      <Button variant="outline" onClick={() => setEditingEmployee(null)} className="flex-1">
                                        Cancelar
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                            <span className={`px-1.5 py-0.5 rounded text-xs ${
                              empleado.pais === 'Colombia' ? 'bg-yellow-100 text-yellow-800' :
                              empleado.pais === 'Venezuela' ? 'bg-blue-100 text-blue-800' :
                              empleado.pais === 'México' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {empleado.pais}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-xs ${
                              empleado.departamento === 'ATC' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {empleado.departamento}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-bold ${
                            porcentajeHoras > 100 ? 'text-red-600' :
                            porcentajeHoras > 90 ? 'text-amber-600' :
                            porcentajeHoras > 0 ? 'text-green-600' :
                            'text-gray-500'
                          }`}>
                            {horasSemanales}h / {maxHoras}h
                          </div>
                          <div className="text-xs text-gray-500">
                            {Math.round(porcentajeHoras)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            porcentajeHoras > 100 ? 'bg-red-500' :
                            porcentajeHoras > 90 ? 'bg-amber-500' :
                            porcentajeHoras > 0 ? 'bg-green-500' :
                            'bg-gray-300'
                          }`}
                          style={{ width: `${Math.min(porcentajeHoras, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Actions panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Acciones Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  onClick={resetAllAssignments}
                  variant="outline"
                  className="w-full text-red-600 hover:bg-red-50"
                >
                  🔄 Reset Total
                </Button>
                
                <div className="pt-2 border-t">
                  <div className="text-xs text-gray-600 text-center">
                    Total asignaciones: {asignaciones.length}
                  </div>
                  <div className="text-xs text-center mt-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 mr-2">
                      ATC: {equipoConHoras.filter(e => e.departamento === 'ATC').length}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                      ONB: {equipoConHoras.filter(e => e.departamento === 'Onboarding').length}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}