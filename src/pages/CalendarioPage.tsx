import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EQUIPO_COMPLETO, TURNOS, type TipoSemana, type TurnoType, type AsignacionTurno, type Empleado } from "@/types/equipo";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, ChevronLeft, ChevronRight, BarChart3, TrendingUp, Calendar, Users, ChevronDown, ChevronUp } from "lucide-react";
import HorasExtrasForm from "@/components/ui/HorasExtrasForm";

// ================ CRITICAL FIXES IMPLEMENTATION ================

interface DemandAnalysis {
  monthlyPattern: {
    alta: { days: number[]; volumeIncrease: number; description: string };
    media: { days: number[]; volumeIncrease: number; description: string };
    valle: { days: number[]; volumeIncrease: number; description: string };
  };
  hourlyDistribution: { AM: number; PM: number; M: number };
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

// CORRECTED STAFFING PLANS
const CORRECTED_STAFFING_PLANS = {
  ALTA: {
    AM: { total: 7, atcCount: 6, onbCount: 1 },
    PM: { total: 5, atcCount: 4, onbCount: 1 },
    M: { total: 1, atcCount: 1, onbCount: 0 },
    SN: { total: 1, atcCount: 1, onbCount: 0 }
  },
  MEDIA: {
    AM: { total: 6, atcCount: 5, onbCount: 1 },
    PM: { total: 4, atcCount: 3, onbCount: 1 },
    M: { total: 1, atcCount: 1, onbCount: 0 },
    SN: { total: 1, atcCount: 1, onbCount: 0 }
  },
  VALLE: {
    AM: { total: 5, atcCount: 4, onbCount: 1 },
    PM: { total: 3, atcCount: 2, onbCount: 1 },
    M: { total: 1, atcCount: 1, onbCount: 0 },
    SN: { total: 1, atcCount: 1, onbCount: 0 }
  }
};

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// ENHANCED STYLES WITH FIXES
const ENHANCED_STYLES = `
  .staff-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    margin: 3px;
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 500;
    cursor: grab;
    transition: all 0.2s ease;
    min-width: 70px;
    justify-content: center;
    box-sizing: border-box;
    position: relative;
  }
  
  .staff-chip:hover {
    background: #e5e7eb;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .staff-chip.dragging {
    opacity: 0.7;
    transform: rotate(5deg);
  }
  
  .staff-name-short {
    color: #374151;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 50px;
  }
  
  .country-flag {
    font-size: 10px;
    flex-shrink: 0;
  }
  
  .staff-slots {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    min-height: 40px;
    padding: 4px;
    align-items: flex-start;
    align-content: flex-start;
  }
  
  .shift-cell {
    min-height: 80px;
    padding: 8px;
    border: 2px dashed #e2e8f0;
    border-radius: 8px;
    transition: all 0.2s ease;
    background: #fafafa;
  }
  
  .shift-cell.drag-over {
    background: #dbeafe;
    border-color: #3b82f6;
    border-style: solid;
    transform: scale(1.02);
  }
  
  .past-date {
    background-color: #f5f5f5 !important;
    opacity: 0.6;
    pointer-events: none;
  }
  
  .week-section {
    border: 1px solid hsl(var(--border));
    border-radius: 12px;
    margin-bottom: 16px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  
  .week-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: hsl(var(--muted)/0.5);
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 12px 12px 0 0;
  }
  
  .week-header:hover {
    background: hsl(var(--muted));
  }
  
  .week-content.collapsed {
    display: none;
  }
  
  .week-content {
    padding: 20px;
    background: hsl(var(--card));
    border-radius: 0 0 12px 12px;
  }
`;

export default function CalendarioPage() {
  const [mesActual, setMesActual] = useState(new Date().getMonth());
  const [anoActual, setAnoActual] = useState(new Date().getFullYear());
  const [asignaciones, setAsignaciones] = useState<AsignacionTurno[]>([]);
  const [empleadoArrastrado, setEmpleadoArrastrado] = useState<string | null>(null);
  const [equipoConHoras, setEquipoConHoras] = useState<Empleado[]>([
    ...EQUIPO_COMPLETO,
    // NEW NIGHT STAFF
    {
      id: 'nocturno-atc',
      nombre: 'Nocturno ATC',
      pais: 'Colombia',
      departamento: 'ATC',
      tipo: 'ATC',
      horasMax: 44,
      lider: 'N/A',
      especialidad: 'Senior',
      horasAsignadas: 0,
      activo: true,
      fechaIngreso: '2024-01-01',
      nivel: 'Senior'
    } as Empleado
  ]);
  const [solicitudesHorasExtras, setSolicitudesHorasExtras] = useState<any[]>([]);
  const [mostrarFormularioHorasExtras, setMostrarFormularioHorasExtras] = useState(false);
  const [vistaActual, setVistaActual] = useState<'month' | 'week' | 'collapsible'>('collapsible');
  const [semanaSeleccionada, setSemanaSeleccionada] = useState<Date>(new Date());
  const [semanasColapsadas, setSemanasColapsadas] = useState<Set<number>>(new Set());
  const [staffHours, setStaffHours] = useState<Record<string, number>>({});

  // Apply enhanced styles on mount
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = ENHANCED_STYLES;
    document.head.appendChild(style);
    
    // Initialize staff hours
    const initialHours: Record<string, number> = {};
    equipoConHoras.forEach(emp => {
      initialHours[emp.id] = 0;
    });
    setStaffHours(initialHours);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // ================ CRITICAL FIX 1: GHOST HOURS RESET ================
  const resetGhostHours = () => {
    console.log('🔄 RESET: Eliminando horas fantasma...');
    
    // Complete state reset
    setAsignaciones([]);
    const resetHours: Record<string, number> = {};
    equipoConHoras.forEach(emp => {
      resetHours[emp.id] = 0;
    });
    setStaffHours(resetHours);
    
    toast({
      title: "✅ Reset Completo",
      description: "Horas fantasma eliminadas, sistema reiniciado",
    });
  };

  // ================ CRITICAL FIX 2: REAL-TIME HOUR CALCULATION ================
  const recalculateAllHours = (assignments: AsignacionTurno[]) => {
    const newStaffHours: Record<string, number> = {};
    
    equipoConHoras.forEach(emp => {
      const totalHours = assignments
        .filter(a => a.empleadoId === emp.id)
        .reduce((sum, a) => sum + a.horas, 0);
      newStaffHours[emp.id] = totalHours;
    });
    
    setStaffHours(newStaffHours);
    console.log('🔄 Hours recalculated:', newStaffHours);
  };

  // Update hours whenever assignments change
  useEffect(() => {
    recalculateAllHours(asignaciones);
  }, [asignaciones, equipoConHoras]);

  // ================ CRITICAL FIX 3: FUNCTIONAL AUTO-ASSIGN ================
  const autoAsignarSemanaFuncional = (weekStartDate: string) => {
    console.log(`🎯 AUTO-ASIGNAR FUNCIONAL: Semana ${weekStartDate}`);
    
    const weekStart = new Date(weekStartDate);
    const weekType = getWeekTypeFromDate(weekStart.getDate()) as 'ALTA' | 'MEDIA' | 'VALLE';
    
    // Clear this specific week first
    limpiarSemanaEspecifica(weekStartDate);
    
    // Get correct configuration
    const config = CORRECTED_STAFFING_PLANS[weekType];
    const nuevasAsignaciones: AsignacionTurno[] = [];
    
    // Assign 6 working days (Mon-Sat)
    for (let dayOffset = 0; dayOffset < 6; dayOffset++) {
      const targetDate = new Date(weekStart);
      targetDate.setDate(weekStart.getDate() + dayOffset);
      
      const fecha = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
      const diaSemana = targetDate.getDay();
      
      // Fixed assignments
      assignFixedStaffToDay(nuevasAsignaciones, fecha, diaSemana);
      
      // Complete shifts according to plan
      fillShiftCompletely(nuevasAsignaciones, fecha, 'manana', config.AM);
      fillShiftCompletely(nuevasAsignaciones, fecha, 'tarde', config.PM);
      fillShiftCompletely(nuevasAsignaciones, fecha, 'madrugada', config.M);
      fillShiftCompletely(nuevasAsignaciones, fecha, 'senior_nocturno', config.SN);
    }
    
    setAsignaciones(prev => [...prev, ...nuevasAsignaciones]);
    
    toast({
      title: "🎯 Auto-asignación Completada",
      description: `Semana ${weekType} asignada correctamente con ${nuevasAsignaciones.length} turnos`,
    });
  };

  const assignFixedStaffToDay = (assignments: AsignacionTurno[], fecha: string, diaSemana: number) => {
    // Ashley: Mañana ONB (fixed)
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

    // Fernando: Tarde ONB (fixed)
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

  const fillShiftCompletely = (assignments: AsignacionTurno[], fecha: string, shift: TurnoType, config: {total: number, atcCount: number, onbCount: number}) => {
    const currentAssignments = assignments.filter(a => a.fecha === fecha && a.turno === shift);
    const needed = config.total - currentAssignments.length;
    
    if (needed <= 0) return;
    
    // Get available staff (not assigned on this day)
    const availableStaff = equipoConHoras.filter(emp => 
      !hasStaffAssignment(assignments, emp.id, fecha) &&
      canWorkOnDate(emp, fecha) &&
      !isOverHourLimit(emp.id, assignments)
    );
    
    // Fill ATC positions first
    const atcStaff = availableStaff.filter(emp => emp.tipo === 'ATC').slice(0, Math.min(needed, config.atcCount));
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
      const onbStaff = availableStaff.filter(emp => emp.tipo === 'ONB').slice(0, Math.min(onbNeeded, config.onbCount));
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
    
    return currentHours + 8 > maxHours; // Assuming 8h per shift
  };

  const getWeekTypeFromDate = (dayOfMonth: number): TipoSemana => {
    if (REAL_DEMAND_ANALYSIS.monthlyPattern.alta.days.includes(dayOfMonth)) return 'alta';
    if (REAL_DEMAND_ANALYSIS.monthlyPattern.media.days.includes(dayOfMonth)) return 'media';
    return 'valle';
  };

  // ================ CRITICAL FIX 4: SPECIFIC WEEK CLEANER ================
  const limpiarSemanaEspecifica = (weekStartDate: string) => {
    console.log(`🗑️ Limpiando SOLO semana: ${weekStartDate}`);
    
    // Remove only assignments from this specific week
    const weekStart = new Date(weekStartDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const remainingAssignments = asignaciones.filter(a => {
      const assignmentDate = new Date(a.fecha);
      return assignmentDate < weekStart || assignmentDate > weekEnd;
    });
    
    setAsignaciones(remainingAssignments);
    
    toast({
      title: "🗑️ Semana Limpiada",
      description: `Semana específica eliminada`,
    });
  };

  // ================ CRITICAL FIX 5: ENHANCED DRAG & DROP ================
  const onDragStart = (e: React.DragEvent, empleadoId: string) => {
    setEmpleadoArrastrado(empleadoId);
    e.dataTransfer.effectAllowed = 'move';
    console.log(`🎯 Drag started: ${empleadoId}`);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const element = e.currentTarget as HTMLElement;
    element.classList.add('drag-over');
  };

  const onDragLeave = (e: React.DragEvent) => {
    const element = e.currentTarget as HTMLElement;
    element.classList.remove('drag-over');
  };

  const onDrop = (e: React.DragEvent, fecha: string, turno: TurnoType) => {
    e.preventDefault();
    const element = e.currentTarget as HTMLElement;
    element.classList.remove('drag-over');
    
    if (!empleadoArrastrado) {
      console.log('❌ No staff being dragged');
      return;
    }

    const empleado = equipoConHoras.find(emp => emp.id === empleadoArrastrado);
    if (!empleado) {
      console.log('❌ Employee not found');
      return;
    }

    console.log(`📍 Drop attempt: ${empleado.nombre} → ${fecha} ${turno}`);

    // ROBUST VALIDATIONS
    
    // 1. Check if already assigned on this day
    const yaAsignado = asignaciones.some(a => a.empleadoId === empleado.id && a.fecha === fecha);
    if (yaAsignado) {
      toast({
        title: "❌ Duplicado",
        description: `${empleado.nombre} ya asignado este día`,
        variant: "destructive"
      });
      setEmpleadoArrastrado(null);
      return;
    }

    // 2. Sunday restriction for Colombians
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

    // 3. Hour limits validation
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

    // CREATE ASSIGNMENT
    const nuevaAsignacion: AsignacionTurno = {
      id: `${empleado.id}-${fecha}-${turno}-${Date.now()}`,
      empleadoId: empleado.id,
      fecha,
      turno,
      horas: TURNOS[turno].horas
    };

    console.log(`✅ Creating assignment:`, nuevaAsignacion);

    // UPDATE STATE IMMEDIATELY
    setAsignaciones(prev => [...prev, nuevaAsignacion]);

    setEmpleadoArrastrado(null);
    
    toast({
      title: "✅ Asignado",
      description: `${empleado.nombre} → ${TURNOS[turno].nombre} (${nuevasHoras}h total)`,
    });
  };

  // ================ REMOVE ASSIGNMENT FUNCTION ================
  const eliminarAsignacion = (assignmentId: string) => {
    const assignment = asignaciones.find(a => a.id === assignmentId);
    if (!assignment) return;

    setAsignaciones(prev => prev.filter(a => a.id !== assignmentId));

    toast({
      title: "🗑️ Asignación Eliminada",
      description: `Turno removido`,
    });
  };

  // ================ NAVIGATION FUNCTIONS ================
  const navigateMonth = (direction: number) => {
    const newDate = new Date(anoActual, mesActual + direction, 1);
    setMesActual(newDate.getMonth());
    setAnoActual(newDate.getFullYear());
  };

  const getDiasDelMes = () => {
    const daysInMonth = new Date(anoActual, mesActual + 1, 0).getDate();
    const calendarDays = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(anoActual, mesActual, day);
      const dayOfWeek = date.getDay();
      const realDayName = DIAS_SEMANA[dayOfWeek];
      
      const weekType = getWeekTypeFromDate(day);
      
      calendarDays.push({
        dia: day,
        date: day,
        dayName: realDayName,
        weekType,
        fullDate: date,
        esMesAnterior: false,
        fecha: date
      });
    }
    
    return calendarDays;
  };

  const getCollapsibleWeeks = () => {
    const days = getDiasDelMes();
    const weeks = [];
    
    for (let i = 0; i < days.length; i += 7) {
      const weekDays = days.slice(i, i + 7);
      if (weekDays.length > 0) {
        const startDay = weekDays[0].date;
        const endDay = weekDays[weekDays.length - 1].date;
        const weekType = getWeekTypeFromDate(startDay);
        
        weeks.push({
          startDay,
          endDay,
          type: weekType,
          days: weekDays,
          isCollapsed: semanasColapsadas.has(weeks.length)
        });
      }
    }
    
    return weeks;
  };

  const toggleWeek = (weekIndex: number) => {
    setSemanasColapsadas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(weekIndex)) {
        newSet.delete(weekIndex);
      } else {
        newSet.add(weekIndex);
      }
      return newSet;
    });
  };

  // Check if date is in the past
  const isPastDate = (fecha: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(fecha);
    return checkDate < today;
  };

  return (
    <div className="space-y-6">
      {/* Header with navigation */}
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
            Mes Anterior
          </Button>
          <Button onClick={() => navigateMonth(1)} variant="outline" size="sm">
            Mes Siguiente
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main calendar view */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Vista Colapsable por Semanas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getCollapsibleWeeks().map((semana, weekIndex) => {
                const weekCoverage = Math.round(
                  (semana.days.reduce((total, day) => {
                    const fecha = `${anoActual}-${String(mesActual + 1).padStart(2, '0')}-${String(day.date).padStart(2, '0')}`;
                    return total + asignaciones.filter(a => a.fecha === fecha).length;
                  }, 0) / (semana.days.length * 4)) * 100
                );

                return (
                  <div key={weekIndex} className="week-section">
                    <div 
                      className="week-header"
                      onClick={() => toggleWeek(weekIndex)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            Semana {weekIndex + 1}: {semana.startDay} - {semana.endDay}
                          </span>
                          <Badge className={`${
                            semana.type === 'alta' ? 'bg-red-100 text-red-800' :
                            semana.type === 'media' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {semana.type.toUpperCase()}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {weekCoverage}% cubierto
                        </span>
                      </div>
                      
                      <Button variant="ghost" size="sm">
                        {semanasColapsadas.has(weekIndex) ? 
                          <ChevronDown className="w-4 h-4" /> : 
                          <ChevronUp className="w-4 h-4" />
                        }
                      </Button>
                    </div>

                    {!semanasColapsadas.has(weekIndex) && (
                      <div className="week-content">
                        <div className="grid grid-cols-7 gap-2 text-xs mb-4">
                          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dia) => (
                            <div key={dia} className="text-center font-medium text-muted-foreground p-2">
                              {dia}
                            </div>
                          ))}
                        </div>
                        
                        <div className="grid grid-cols-7 gap-2">
                          {semana.days.map((dia, diaIndex) => {
                            const fecha = `${anoActual}-${String(mesActual + 1).padStart(2, '0')}-${String(dia.date).padStart(2, '0')}`;
                            const pastDate = isPastDate(fecha);
                            
                            return (
                              <div key={diaIndex} className="space-y-2">
                                <div className={`text-center p-2 rounded text-sm font-medium ${
                                  pastDate ? 'bg-gray-100 text-gray-500 opacity-60' :
                                  dia.weekType === 'alta' ? 'bg-red-100 text-red-800' :
                                  dia.weekType === 'media' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {dia.date}
                                </div>
                                
                                {Object.entries(TURNOS).map(([turno, info]) => {
                                  const asignacionesTurno = asignaciones.filter(a => 
                                    a.fecha === fecha && a.turno === turno
                                  );
                                  
                                  return (
                                    <div
                                      key={turno}
                                      className={`shift-cell ${pastDate ? 'past-date' : ''}`}
                                      onDragOver={!pastDate ? onDragOver : undefined}
                                      onDragLeave={!pastDate ? onDragLeave : undefined}
                                      onDrop={!pastDate ? (e) => onDrop(e, fecha, turno as TurnoType) : undefined}
                                    >
                                      <div className="text-xs font-medium mb-2 text-center">
                                        {turno.substring(0, 3).toUpperCase()}
                                      </div>
                                      <div className="staff-slots">
                                        {asignacionesTurno.map((asignacion) => {
                                          const empleado = equipoConHoras.find(e => e.id === asignacion.empleadoId);
                                          if (!empleado) return null;
                                          
                                          const flagEmoji = empleado.pais === 'Colombia' ? '🇨🇴' : 
                                                          empleado.pais === 'Venezuela' ? '🇻🇪' : 
                                                          empleado.pais === 'México' ? '🇲🇽' : '🇮🇹';
                                          
                                          return (
                                            <div
                                              key={asignacion.id}
                                              className={`staff-chip ${empleado.tipo === 'ATC' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}
                                              onClick={!pastDate ? () => eliminarAsignacion(asignacion.id) : undefined}
                                              title={`${empleado.nombre} - ${info.nombre} (${TURNOS[turno as TurnoType].horas}h)${!pastDate ? ' - Click para eliminar' : ''}`}
                                            >
                                              <span className="staff-name-short">
                                                {empleado.nombre.split(' ')[0]}
                                              </span>
                                              <span className="country-flag">{flagEmoji}</span>
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
                        
                        <div className="flex gap-2 pt-4 border-t mt-4">
                          <Button 
                            size="sm" 
                            onClick={() => {
                              const weekStart = `${anoActual}-${String(mesActual + 1).padStart(2, '0')}-${String(semana.startDay).padStart(2, '0')}`;
                              autoAsignarSemanaFuncional(weekStart);
                            }}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            disabled={semana.days.some(dia => {
                              const fecha = `${anoActual}-${String(mesActual + 1).padStart(2, '0')}-${String(dia.date).padStart(2, '0')}`;
                              return isPastDate(fecha);
                            })}
                          >
                            🎯 Auto-Asignar Inteligente
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              const weekStart = `${anoActual}-${String(mesActual + 1).padStart(2, '0')}-${String(semana.startDay).padStart(2, '0')}`;
                              limpiarSemanaEspecifica(weekStart);
                            }}
                            className="flex-1 hover:bg-red-50 hover:text-red-700"
                          >
                            🗑️ Limpiar Semana
                          </Button>
                        </div>
                      </div>
                    )}
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
                      className="group p-3 bg-card rounded-lg border cursor-move hover:shadow-lg hover:border-primary/20 transition-all duration-200 hover:scale-[1.02]"
                      draggable
                      onDragStart={(e) => onDragStart(e, empleado.id)}
                      title={`Arrastra para asignar • Max: ${maxHoras}h semanales`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">
                            {empleado.nombre}
                            {empleado.id === 'nocturno-atc' && (
                              <Badge className="ml-2 text-xs bg-green-100 text-green-800">Nuevo</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                              empleado.pais === 'Colombia' ? 'bg-yellow-100 text-yellow-800' :
                              empleado.pais === 'Venezuela' ? 'bg-blue-100 text-blue-800' :
                              empleado.pais === 'México' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {empleado.pais}
                            </span>
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                              empleado.tipo === 'ATC' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {empleado.tipo}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-3">
                          <div className={`text-sm font-bold ${
                            porcentajeHoras > 100 ? 'text-red-600' :
                            porcentajeHoras > 90 ? 'text-amber-600' :
                            porcentajeHoras > 0 ? 'text-green-600' :
                            'text-gray-500'
                          }`}>
                            {horasSemanales}h / {maxHoras}h
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {Math.round(porcentajeHoras)}% usado
                            {porcentajeHoras > 100 && ' ⚠️'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ease-out ${
                            porcentajeHoras > 100 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                            porcentajeHoras > 90 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                            porcentajeHoras > 0 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                            'bg-gray-300'
                          }`}
                          style={{ width: `${Math.min(porcentajeHoras, 100)}%` }}
                        />
                        {porcentajeHoras > 100 && (
                          <div className="absolute inset-0 bg-red-500 opacity-20 animate-pulse" />
                        )}
                      </div>
                      
                      {porcentajeHoras > 90 && (
                        <div className="mt-2 text-xs text-center text-amber-700 font-medium">
                          {porcentajeHoras > 100 ? '⚠️ Límite excedido' : '⚠️ Cerca del límite'}
                        </div>
                      )}
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
                  onClick={resetGhostHours}
                  variant="outline"
                  className="w-full hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                >
                  🔄 Reset Total (Eliminar Horas Fantasma)
                </Button>
                
                <Button 
                  onClick={() => setMostrarFormularioHorasExtras(true)}
                  variant="outline"
                  className="w-full hover:bg-amber-50 hover:text-amber-700"
                >
                  ⏰ Gestionar Horas Extras
                </Button>
                
                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground text-center">
                    Total asignaciones: {asignaciones.length}
                  </div>
                  <div className="text-xs text-center mt-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 mr-2">
                      ATC: {equipoConHoras.filter(e => e.tipo === 'ATC').length}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                      ONB: {equipoConHoras.filter(e => e.tipo === 'ONB').length}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Horas Extras Form Modal */}
      {mostrarFormularioHorasExtras && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Gestionar Horas Extras</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Funcionalidad en desarrollo
            </p>
            <Button onClick={() => setMostrarFormularioHorasExtras(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}