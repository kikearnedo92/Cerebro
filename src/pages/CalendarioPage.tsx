import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EQUIPO_COMPLETO, TURNOS, type TipoSemana, type TurnoType, type AsignacionTurno, type Empleado } from "@/types/equipo";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, ChevronLeft, ChevronRight, BarChart3, TrendingUp, Calendar, Users } from "lucide-react";
import HorasExtrasForm from "@/components/ui/HorasExtrasForm";

// ================ SISTEMA DE OPTIMIZACIÓN DE TURNOS 24/7 - CORRECCIONES CRÍTICAS ================

interface DemandAnalysis {
  monthlyPattern: {
    alta: { days: number[]; volumeIncrease: number; description: string };
    media: { days: number[]; volumeIncrease: number; description: string };
    valle: { days: number[]; volumeIncrease: number; description: string };
  };
  hourlyDistribution: {
    AM: number;
    PM: number;
    M: number;
  };
  capacityGap: number;
}

const REAL_DEMAND_ANALYSIS: DemandAnalysis = {
  monthlyPattern: {
    alta: { 
      days: [1,2,3,4,5,28,29,30,31], 
      volumeIncrease: 125,
      description: "Fin/Inicio mes - Pagos quincenales, preparación" 
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
  },
  hourlyDistribution: { AM: 55, PM: 30, M: 15 },
  capacityGap: 67
};

// ================ PLAN DE STAFFING CORREGIDO ================
const CORRECTED_STAFFING_PLANS = {
  ALTA: {
    AM: { total: 7, atcCount: 6, onbCount: 1 },
    PM: { total: 5, atcCount: 4, onbCount: 1 },
    M: { total: 2, atcCount: 2, onbCount: 0 }
  },
  MEDIA: {
    AM: { total: 6, atcCount: 5, onbCount: 1 },
    PM: { total: 4, atcCount: 3, onbCount: 1 },
    M: { total: 2, atcCount: 2, onbCount: 0 }
  },
  VALLE: {
    AM: { total: 5, atcCount: 4, onbCount: 1 },
    PM: { total: 3, atcCount: 2, onbCount: 1 },
    M: { total: 1, atcCount: 1, onbCount: 0 }
  }
};

// ================ CORRECCIÓN 1: AUTO-ASIGNACIÓN COMPLETA ================
class ShiftAutoAssigner {
  
  getWeekType(dayOfMonth: number): 'ALTA' | 'MEDIA' | 'VALLE' {
    if (REAL_DEMAND_ANALYSIS.monthlyPattern.alta.days.includes(dayOfMonth)) return 'ALTA';
    if (REAL_DEMAND_ANALYSIS.monthlyPattern.media.days.includes(dayOfMonth)) return 'MEDIA';
    return 'VALLE';
  }

  autoAssignWeek(
    weekStartDate: Date, 
    setAsignaciones: Function, 
    equipoConHoras: Empleado[], 
    mesActual: number, 
    anoActual: number
  ): AsignacionTurno[] {
    console.log('🚀 Iniciando auto-asignación completa...');
    
    const weekType = this.getWeekType(weekStartDate.getDate());
    const staffingPlan = CORRECTED_STAFFING_PLANS[weekType];
    
    const nuevasAsignaciones: AsignacionTurno[] = [];
    
    // Asignar toda una semana (7 días)
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const dia = weekStartDate.getDate() + dayOffset;
      const fecha = `${anoActual}-${String(mesActual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      const fechaObj = new Date(anoActual, mesActual, dia);
      const diaSemana = fechaObj.getDay();

      // 1. ASIGNACIONES FIJAS OBLIGATORIAS
      this.assignFixedStaff(nuevasAsignaciones, equipoConHoras, fecha, diaSemana);
      
      // 2. COMPLETAR SEGÚN PLAN OPTIMIZADO
      this.forceCompleteStaffing(nuevasAsignaciones, equipoConHoras, fecha, diaSemana, staffingPlan);
    }
    
    console.log('✅ Auto-asignación completada');
    return nuevasAsignaciones;
  }

  assignFixedStaff(asignaciones: AsignacionTurno[], equipoConHoras: Empleado[], fecha: string, diaSemana: number): void {
    // Ashley: AM fijo (ONB)
    const ashley = equipoConHoras.find(e => e.nombre === 'Ashley Jiménez');
    if (ashley) {
      asignaciones.push({
        id: `${ashley.id}-${fecha}-manana-onb`,
        empleadoId: ashley.id,
        fecha,
        turno: 'manana',
        horas: TURNOS.manana.horas
      });
    }

    // Fernando: PM fijo (ONB)
    const fernando = equipoConHoras.find(e => e.nombre === 'Fernando Pérez');
    if (fernando) {
      asignaciones.push({
        id: `${fernando.id}-${fecha}-tarde-onb`,
        empleadoId: fernando.id,
        fecha,
        turno: 'tarde',
        horas: TURNOS.tarde.horas
      });
    }

    // Sugli: M fijo (excepto viernes-sábado cuando Diana reemplaza)
    if (diaSemana === 5) { // Viernes
      const diana = equipoConHoras.find(e => e.nombre === 'Diana Castillo');
      if (diana) {
        asignaciones.push({
          id: `${diana.id}-${fecha}-madrugada-backup`,
          empleadoId: diana.id,
          fecha,
          turno: 'madrugada',
          horas: TURNOS.madrugada.horas
        });
      }
    } else {
      const sugli = equipoConHoras.find(e => e.nombre === 'Sugli Martinez');
      if (sugli) {
        asignaciones.push({
          id: `${sugli.id}-${fecha}-madrugada`,
          empleadoId: sugli.id,
          fecha,
          turno: 'madrugada',
          horas: TURNOS.madrugada.horas
        });
      }
    }
  }

  forceCompleteStaffing(
    asignaciones: AsignacionTurno[], 
    equipoConHoras: Empleado[], 
    fecha: string, 
    diaSemana: number, 
    plan: any
  ): void {
    // AM: FORZAR plan.AM.total personas
    this.fillShiftToExactTarget('manana', plan.AM.total, asignaciones, equipoConHoras, fecha, diaSemana);
    
    // PM: FORZAR plan.PM.total personas  
    this.fillShiftToExactTarget('tarde', plan.PM.total, asignaciones, equipoConHoras, fecha, diaSemana);
    
    // M: FORZAR plan.M.total personas
    this.fillShiftToExactTarget('madrugada', plan.M.total, asignaciones, equipoConHoras, fecha, diaSemana);
  }

  fillShiftToExactTarget(
    turno: string, 
    targetTotal: number, 
    asignaciones: AsignacionTurno[], 
    equipoConHoras: Empleado[], 
    fecha: string, 
    diaSemana: number
  ): void {
    const currentAssigned = asignaciones.filter(a => a.fecha === fecha && a.turno === turno);
    const needed = targetTotal - currentAssigned.length;
    
    if (needed <= 0) return;
    
    // Obtener staff disponible
    let availableStaff = equipoConHoras.filter(emp => {
      const yaAsignado = asignaciones.some(a => a.empleadoId === emp.id && a.fecha === fecha);
      const esColombianoEnDomingo = emp.pais === 'Colombia' && diaSemana === 0;
      
      return !yaAsignado && !esColombianoEnDomingo;
    });

    // Priorizar por área y rol
    const seniors = availableStaff.filter(s => s.nivel === 'Senior' && s.departamento === 'Atención al Cliente');
    const atcStaff = availableStaff.filter(s => s.departamento === 'Atención al Cliente' && s.nivel !== 'Senior');
    const hybridStaff = availableStaff.filter(s => s.departamento === 'Híbrido');
    
    const staffToAssign = [...seniors, ...atcStaff, ...hybridStaff].slice(0, needed);
    
    // ASIGNAR FORZOSAMENTE
    staffToAssign.forEach((staff, index) => {
      const turnoKey = turno as TurnoType;
      asignaciones.push({
        id: `${staff.id}-${fecha}-${turno}-auto-${index}`,
        empleadoId: staff.id,
        fecha,
        turno: turnoKey,
        horas: TURNOS[turnoKey].horas
      });
      console.log(`✅ Asignado: ${staff.nombre} → ${fecha} ${turno}`);
    });
  }
}

// ================ CORRECCIÓN 2: ACTUALIZACIÓN DE HORAS EN TIEMPO REAL ================
class StaffHoursCalculator {
  
  updateAllStaffHours(asignaciones: AsignacionTurno[], equipoConHoras: Empleado[], setEquipoConHoras: Function): void {
    console.log('🔄 Actualizando contador de horas...');
    
    const nuevoEquipo = equipoConHoras.map(empleado => {
      const weeklyHours = this.calculateWeeklyHours(empleado.id, asignaciones);
      
      console.log(`📊 ${empleado.nombre}: ${weeklyHours}h/${empleado.pais === 'Colombia' ? 44 : 45}h`);
      
      return {
        ...empleado,
        horasAsignadas: weeklyHours,
        horasDisponibles: Math.max(0, (empleado.pais === 'Colombia' ? 44 : 45) - weeklyHours)
      };
    });
    
    setEquipoConHoras(nuevoEquipo);
  }

  calculateWeeklyHours(staffId: string, asignaciones: AsignacionTurno[]): number {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
    
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    
    return asignaciones
      .filter(a => {
        if (a.empleadoId !== staffId) return false;
        const fechaAsignacion = new Date(a.fecha);
        return fechaAsignacion >= lunes && fechaAsignacion <= domingo;
      })
      .reduce((total, a) => total + a.horas, 0);
  }
}

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
  const [equipoConHoras, setEquipoConHoras] = useState<Empleado[]>([...EQUIPO_COMPLETO]);
  const [solicitudesHorasExtras, setSolicitudesHorasExtras] = useState<any[]>([]);
  const [mostrarFormularioHorasExtras, setMostrarFormularioHorasExtras] = useState(false);
  const [vistaActual, setVistaActual] = useState<'month' | 'week'>('month');
  const [semanaSeleccionada, setSemanaSeleccionada] = useState<Date>(new Date());

  // Instancias de clases
  const shiftAssigner = new ShiftAutoAssigner();
  const hoursCalculator = new StaffHoursCalculator();

  // Calcular horas semanales - semana va de lunes a domingo
  useEffect(() => {
    hoursCalculator.updateAllStaffHours(asignaciones, EQUIPO_COMPLETO, setEquipoConHoras);
  }, [asignaciones]);

  const getDiasDelMes = () => {
    const primerDia = new Date(anoActual, mesActual, 1);
    const ultimoDia = new Date(anoActual, mesActual + 1, 0);
    const diasEnMes = ultimoDia.getDate();

    const dias = [];
    
    // SOLO DÍAS DEL MES ACTUAL - CORRECCIÓN 4
    for (let dia = 1; dia <= diasEnMes; dia++) {
      dias.push({
        dia,
        esMesAnterior: false,
        fecha: new Date(anoActual, mesActual, dia)
      });
    }
    
    return dias;
  };

  const getWeekType = (dia: number): TipoSemana => {
    if (REAL_DEMAND_ANALYSIS.monthlyPattern.alta.days.includes(dia)) return 'alta';
    if (REAL_DEMAND_ANALYSIS.monthlyPattern.media.days.includes(dia)) return 'media';
    return 'valle';
  };

  const getWeekStart = (dia: number): Date => {
    const targetDate = new Date(anoActual, mesActual, dia);
    const dayOfWeek = targetDate.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const weekStart = new Date(targetDate);
    weekStart.setDate(targetDate.getDate() + mondayOffset);
    
    return weekStart;
  };

  const switchToWeekView = (weekStart: Date) => {
    setVistaActual('week');
    setSemanaSeleccionada(weekStart);
  };

  const switchToMonthView = () => {
    setVistaActual('month');
  };

  const autoAsignarSemana = () => {
    const weekStart = vistaActual === 'week' ? semanaSeleccionada : getWeekStart(new Date().getDate());
    
    try {
      const nuevasAsignaciones = shiftAssigner.autoAssignWeek(
        weekStart, 
        setAsignaciones, 
        equipoConHoras, 
        mesActual, 
        anoActual
      );
      
      setAsignaciones(prev => [
        ...prev.filter(a => {
          const fechaAsignacion = new Date(a.fecha);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          return fechaAsignacion < weekStart || fechaAsignacion > weekEnd;
        }),
        ...nuevasAsignaciones
      ]);
      
      // FORZAR ACTUALIZACIÓN DE HORAS
      setTimeout(() => {
        hoursCalculator.updateAllStaffHours(asignaciones.concat(nuevasAsignaciones), EQUIPO_COMPLETO, setEquipoConHoras);
      }, 100);
      
      toast({
        title: "Auto-asignación completada",
        description: `Semana ${shiftAssigner.getWeekType(weekStart.getDate())} asignada correctamente`,
      });
      
    } catch (error) {
      console.error('Error en auto-asignación:', error);
      toast({
        title: "Error",
        description: "Error al auto-asignar la semana",
        variant: "destructive"
      });
    }
  };

  const onDragStart = (e: React.DragEvent, empleadoId: string) => {
    setEmpleadoArrastrado(empleadoId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e: React.DragEvent, fecha: string, turno: TurnoType) => {
    e.preventDefault();
    
    if (!empleadoArrastrado) return;

    const empleado = equipoConHoras.find(emp => emp.id === empleadoArrastrado);
    if (!empleado) return;

    // Validar restricciones
    const fechaObj = new Date(fecha);
    const esDomingo = fechaObj.getDay() === 0;
    
    if (empleado.pais === 'Colombia' && esDomingo) {
      toast({
        title: "Restricción",
        description: "Los empleados de Colombia no pueden trabajar domingos",
        variant: "destructive"
      });
      setEmpleadoArrastrado(null);
      return;
    }

    // Verificar si ya está asignado en esa fecha
    const yaAsignado = asignaciones.some(a => 
      a.empleadoId === empleado.id && 
      a.fecha === fecha
    );

    if (yaAsignado) {
      toast({
        title: "Conflicto",
        description: "El empleado ya tiene asignación en esta fecha",
        variant: "destructive"
      });
      setEmpleadoArrastrado(null);
      return;
    }

    // Crear nueva asignación
    const nuevaAsignacion: AsignacionTurno = {
      id: `${empleado.id}-${fecha}-${turno}`,
      empleadoId: empleado.id,
      fecha,
      turno,
      horas: TURNOS[turno].horas
    };

    setAsignaciones(prev => [...prev, nuevaAsignacion]);
    setEmpleadoArrastrado(null);
    
    toast({
      title: "Asignación exitosa",
      description: `${empleado.nombre} asignado a ${turno} el ${fecha}`,
    });
  };

  const eliminarAsignacion = (asignacionId: string) => {
    setAsignaciones(prev => prev.filter(a => a.id !== asignacionId));
  };

  const renderVistasMensual = () => {
    const dias = getDiasDelMes();
    
    return (
      <div className="space-y-6">
        {/* Header con controles de vista */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Calendario de Turnos 24/7</h1>
            <div className="flex gap-2">
              <Button 
                variant={vistaActual === 'month' ? 'default' : 'outline'}
                onClick={switchToMonthView}
                size="sm"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Vista Mensual
              </Button>
              <Button 
                variant={vistaActual === 'week' ? 'default' : 'outline'}
                onClick={() => switchToWeekView(getWeekStart(new Date().getDate()))}
                size="sm"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Vista Semanal
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button onClick={() => setMesActual(prev => prev === 0 ? 11 : prev - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-lg font-medium min-w-[200px] text-center">
              {MESES[mesActual]} {anoActual}
            </span>
            <Button onClick={() => setMesActual(prev => prev === 11 ? 0 : prev + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Grid del calendario mensual */}
        <div className="grid grid-cols-7 gap-2">
          {DIAS_SEMANA.map(dia => (
            <div key={dia} className="p-3 text-center font-medium bg-muted">
              {dia}
            </div>
          ))}
          
          {dias.map(({ dia, fecha }) => {
            const fechaStr = `${anoActual}-${String(mesActual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            const weekType = getWeekType(dia);
            const asignacionesDia = asignaciones.filter(a => a.fecha === fechaStr);
            
            return (
              <Card 
                key={dia} 
                className={`min-h-[120px] cursor-pointer transition-all hover:shadow-md ${
                  weekType === 'alta' ? 'border-red-200 bg-red-50' :
                  weekType === 'media' ? 'border-yellow-200 bg-yellow-50' :
                  'border-green-200 bg-green-50'
                }`}
                onClick={() => switchToWeekView(getWeekStart(dia))}
              >
                <CardContent className="p-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{dia}</span>
                    <Badge variant={
                      weekType === 'alta' ? 'destructive' :
                      weekType === 'media' ? 'default' : 'secondary'
                    }>
                      {weekType.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs">
                    {Object.entries(TURNOS).map(([turno, config]) => {
                      const count = asignacionesDia.filter(a => a.turno === turno).length;
                      return (
                        <div key={turno} className="flex justify-between">
                          <span>{config.nombre}:</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderVistaSemanal = () => {
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(semanaSeleccionada);
      fecha.setDate(semanaSeleccionada.getDate() + i);
      weekDays.push(fecha);
    }
    
    const weekType = shiftAssigner.getWeekType(semanaSeleccionada.getDate());
    
    return (
      <div className="space-y-6">
        {/* Header semanal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={switchToMonthView} variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Volver al Mes
            </Button>
            <h2 className="text-xl font-bold">
              Semana {weekType.toUpperCase()} - {semanaSeleccionada.toLocaleDateString()}
            </h2>
            <Button onClick={autoAsignarSemana} className="bg-green-600 hover:bg-green-700">
              🎯 Auto-Asignar Semana Óptima
            </Button>
          </div>
        </div>

        {/* Grid semanal */}
        <div className="grid grid-cols-8 gap-4">
          {/* Columna de turnos */}
          <div className="space-y-2">
            <div className="h-12 flex items-center font-medium">Turnos</div>
            {Object.entries(TURNOS).map(([turno, config]) => (
              <div key={turno} className={`h-24 p-2 rounded border bg-slate-100`}>
                <div className="font-medium text-sm">{config.nombre}</div>
                <div className="text-xs opacity-75">{config.horario}</div>
              </div>
            ))}
          </div>

          {/* Columnas de días */}
          {weekDays.map((fecha, dayIndex) => {
            const fechaStr = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
            
            return (
              <div key={dayIndex} className="space-y-2">
                <div className="h-12 flex items-center justify-center font-medium bg-muted rounded">
                  {DIAS_SEMANA[fecha.getDay()]} {fecha.getDate()}
                </div>
                
                {Object.entries(TURNOS).map(([turno, config]) => {
                  const asignacionesTurno = asignaciones.filter(a => 
                    a.fecha === fechaStr && a.turno === turno
                  );
                  
                  return (
                    <div
                      key={turno}
                      className="h-24 p-2 border-2 border-dashed border-gray-300 rounded hover:border-gray-400 transition-colors"
                      onDragOver={onDragOver}
                      onDrop={(e) => onDrop(e, fechaStr, turno as TurnoType)}
                    >
                      <div className="space-y-1">
                        {asignacionesTurno.map(asignacion => {
                          const empleado = equipoConHoras.find(e => e.id === asignacion.empleadoId);
                          return (
                            <div
                              key={asignacion.id}
                              className="text-xs p-1 bg-blue-100 rounded cursor-pointer hover:bg-blue-200"
                              onClick={() => eliminarAsignacion(asignacion.id)}
                            >
                              {empleado?.nombre.split(' ')[0]}
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
  };

  const renderPersonalDisponible = () => {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Personal Disponible (Semana Actual)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {equipoConHoras.map(empleado => {
            const maxHoras = empleado.pais === 'Colombia' ? 44 : 45;
            const porcentajeUsado = (empleado.horasAsignadas / maxHoras) * 100;
            
            return (
              <div
                key={empleado.id}
                className="p-3 border rounded cursor-grab hover:shadow-sm transition-shadow"
                draggable
                onDragStart={(e) => onDragStart(e, empleado.id)}
                data-staff-id={empleado.id}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{empleado.nombre}</span>
                  <Badge variant={empleado.pais === 'Colombia' ? 'secondary' : 'default'}>
                    {empleado.pais}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>{empleado.departamento}</span>
                  <span className={`font-medium hours-display ${
                    empleado.horasAsignadas > maxHoras ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {empleado.horasAsignadas}h / {maxHoras}h
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      porcentajeUsado > 100 ? 'bg-red-500' :
                      porcentajeUsado > 80 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(porcentajeUsado, 100)}%` }}
                  />
                </div>
                
                {empleado.horasAsignadas > maxHoras && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-red-600">
                      Excede {empleado.horasAsignadas - maxHoras}h
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar con personal disponible */}
          <div className="lg:col-span-1">
            {renderPersonalDisponible()}
          </div>
          
          {/* Área principal del calendario */}
          <div className="lg:col-span-3">
            {vistaActual === 'month' ? renderVistasMensual() : renderVistaSemanal()}
          </div>
        </div>
      </div>

      {/* Modal de horas extras */}
      {mostrarFormularioHorasExtras && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <HorasExtrasForm 
              empleados={equipoConHoras} 
              onSolicitudCreada={(solicitud) => {
                setSolicitudesHorasExtras(prev => [...prev, solicitud]);
                toast({
                  title: "Solicitud creada",
                  description: "Horas extras registradas correctamente"
                });
              }}
            />
            <Button 
              onClick={() => setMostrarFormularioHorasExtras(false)}
              className="mt-4 w-full"
              variant="outline"
            >
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}