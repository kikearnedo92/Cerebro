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

// ================ CORRECCIÓN 1: SISTEMA DE HORAS EN TIEMPO REAL ================
class WeeklyHoursManager {
  updateStaffHours(staffId: string, asignaciones: AsignacionTurno[]): number {
    const totalHours = this.calculateWeeklyHoursForStaff(staffId, asignaciones);
    console.log(`🔄 Horas calculadas para ${staffId}: ${totalHours}h`);
    return totalHours;
  }

  calculateWeeklyHoursForStaff(staffId: string, asignaciones: AsignacionTurno[]): number {
    const hoy = new Date();
    const lunes = this.getWeekStart(hoy);
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

  getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lunes como primer día
    return new Date(d.setDate(diff));
  }

  onStaffMoved(staffId: string, asignaciones: AsignacionTurno[]): number {
    return this.updateStaffHours(staffId, asignaciones);
  }
}

class CompleteAutoAssigner {
  
  getWeekType(dayOfMonth: number): 'ALTA' | 'MEDIA' | 'VALLE' {
    if (REAL_DEMAND_ANALYSIS.monthlyPattern.alta.days.includes(dayOfMonth)) return 'ALTA';
    if (REAL_DEMAND_ANALYSIS.monthlyPattern.media.days.includes(dayOfMonth)) return 'MEDIA';
    return 'VALLE';
  }

  autoAssignWeek(
    weekStartDate: Date, 
    equipoConHoras: Empleado[], 
    mesActual: number, 
    anoActual: number
  ): AsignacionTurno[] {
    console.log('🚀 Iniciando auto-asignación COMPLETA...');
    
    const weekType = this.getWeekType(weekStartDate.getDate());
    const staffingPlan = CORRECTED_STAFFING_PLANS[weekType];
    const nuevasAsignaciones: AsignacionTurno[] = [];
    
    console.log(`📊 Plan para semana ${weekType}:`, staffingPlan);
    
    // ASIGNAR 6 DÍAS DE TRABAJO (Lun-Sáb)
    for (let dayOffset = 0; dayOffset < 6; dayOffset++) {
      const targetDate = new Date(weekStartDate);
      targetDate.setDate(weekStartDate.getDate() + dayOffset);
      
      const fecha = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
      const diaSemana = targetDate.getDay();

      // 1. ASIGNACIONES FIJAS OBLIGATORIAS
      this.assignFixedStaff(nuevasAsignaciones, equipoConHoras, fecha, diaSemana);
      
      // 2. ROTACIÓN DE SENIORS
      this.assignSeniorRotation(nuevasAsignaciones, equipoConHoras, fecha, dayOffset);
      
      // 3. COMPLETAR CADA TURNO SEGÚN PLAN
      this.fillShiftCompletely(nuevasAsignaciones, equipoConHoras, fecha, 'manana', staffingPlan.AM);
      this.fillShiftCompletely(nuevasAsignaciones, equipoConHoras, fecha, 'tarde', staffingPlan.PM);
      this.fillShiftCompletely(nuevasAsignaciones, equipoConHoras, fecha, 'madrugada', staffingPlan.M);
      this.fillShiftCompletely(nuevasAsignaciones, equipoConHoras, fecha, 'senior_nocturno', { total: 1, atcCount: 1, onbCount: 0 });
    }
    
    console.log('✅ Auto-asignación completada:', nuevasAsignaciones.length, 'asignaciones');
    return nuevasAsignaciones;
  }

  autoAssignMonth(
    mes: number,
    ano: number,
    equipoConHoras: Empleado[]
  ): AsignacionTurno[] {
    console.log('🗓️ Iniciando auto-asignación MENSUAL...');
    
    const primerDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const todasAsignaciones: AsignacionTurno[] = [];
    
    // Procesar semana por semana
    for (let dia = 1; dia <= ultimoDia.getDate(); dia += 7) {
      const fechaSemana = new Date(ano, mes, dia);
      const lunes = this.getWeekStart(fechaSemana);
      
      const asignacionesSemana = this.autoAssignWeek(lunes, equipoConHoras, mes, ano);
      todasAsignaciones.push(...asignacionesSemana);
    }
    
    console.log('✅ Auto-asignación mensual completada:', todasAsignaciones.length, 'asignaciones');
    return todasAsignaciones;
  }

  getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  assignFixedStaff(asignaciones: AsignacionTurno[], equipoConHoras: Empleado[], fecha: string, diaSemana: number): void {
    // Ashley: Mañana ONB (fijo) - solo días laborales
    if (diaSemana >= 1 && diaSemana <= 6) {
      const ashley = equipoConHoras.find(e => e.nombre.includes('Ashley'));
      if (ashley) {
        asignaciones.push({
          id: `${ashley.id}-${fecha}-manana-onb`,
          empleadoId: ashley.id,
          fecha,
          turno: 'manana',
          horas: TURNOS.manana.horas
        });
      }
    }

    // Fernando: Tarde ONB (fijo) - solo días laborales
    if (diaSemana >= 1 && diaSemana <= 6) {
      const fernando = equipoConHoras.find(e => e.nombre.includes('Fernando'));
      if (fernando) {
        asignaciones.push({
          id: `${fernando.id}-${fecha}-tarde-onb`,
          empleadoId: fernando.id,
          fecha,
          turno: 'tarde',
          horas: TURNOS.tarde.horas
        });
      }
    }

    // Sugli: Madrugada ATC (excepto viernes-sábado)
    if (diaSemana >= 1 && diaSemana <= 4) {
      const sugli = equipoConHoras.find(e => e.nombre.includes('Sugli'));
      if (sugli) {
        asignaciones.push({
          id: `${sugli.id}-${fecha}-madrugada`,
          empleadoId: sugli.id,
          fecha,
          turno: 'madrugada',
          horas: TURNOS.madrugada.horas
        });
      }
    } else if (diaSemana === 5 || diaSemana === 6) {
      // Diana reemplaza a Sugli viernes-sábado
      const diana = equipoConHoras.find(e => e.nombre.includes('Diana'));
      if (diana) {
        asignaciones.push({
          id: `${diana.id}-${fecha}-madrugada-backup`,
          empleadoId: diana.id,
          fecha,
          turno: 'madrugada',
          horas: TURNOS.madrugada.horas
        });
      }
    }
  }

  assignSeniorRotation(asignaciones: AsignacionTurno[], equipoConHoras: Empleado[], fecha: string, dayOffset: number): void {
    const seniors = ['Helen', 'Mayra', 'José'];
    const rotationPattern = [
      [0, 2], // Lunes: Helen, José
      [1], // Martes: Mayra
      [0, 1], // Miércoles: Helen, Mayra
      [2], // Jueves: José
      [1, 2], // Viernes: Mayra, José
      [0] // Sábado: Helen
    ];
    
    const activeSeniors = rotationPattern[dayOffset % 6] || [];
    
    activeSeniors.forEach(seniorIndex => {
      const seniorName = seniors[seniorIndex];
      const senior = equipoConHoras.find(e => e.nombre.includes(seniorName));
      
      if (senior) {
        asignaciones.push({
          id: `${senior.id}-${fecha}-senior_nocturno`,
          empleadoId: senior.id,
          fecha,
          turno: 'senior_nocturno',
          horas: TURNOS.senior_nocturno.horas
        });
      }
    });
  }

  fillShiftCompletely(
    asignaciones: AsignacionTurno[], 
    equipoConHoras: Empleado[], 
    fecha: string, 
    turno: string,
    config: {total: number, atcCount: number, onbCount: number}
  ): void {
    const currentAssigned = asignaciones.filter(a => a.fecha === fecha && a.turno === turno);
    const needed = config.total - currentAssigned.length;
    
    if (needed <= 0) return;
    
    const fechaObj = new Date(fecha);
    const diaSemana = fechaObj.getDay();
    
    // Obtener staff disponible
    let availableStaff = equipoConHoras.filter(emp => {
      const yaAsignado = asignaciones.some(a => a.empleadoId === emp.id && a.fecha === fecha);
      const esColombianoEnDomingo = emp.pais === 'Colombia' && diaSemana === 0;
      const horasSemanales = this.calculateWeeklyHours(emp.id, asignaciones, fecha);
      const maxHoras = emp.pais === 'Colombia' ? 44 : 45;
      const excederiaLimite = horasSemanales + TURNOS[turno as TurnoType].horas > maxHoras;
      
      return !yaAsignado && !esColombianoEnDomingo && !excederiaLimite;
    });

    // Separar por tipo y priorizar por disponibilidad
    const availableATC = availableStaff
      .filter(s => s.departamento === 'Atención al Cliente' || s.departamento === 'Híbrido')
      .sort((a, b) => a.horasAsignadas - b.horasAsignadas);
    
    const availableONB = availableStaff
      .filter(s => s.departamento === 'Onboarding' || s.departamento === 'Híbrido')
      .sort((a, b) => a.horasAsignadas - b.horasAsignadas);
    
    // ASIGNAR SEGÚN NECESIDADES Y DISPONIBILIDAD
    const neededATC = Math.min(config.atcCount - currentAssigned.filter(a => 
      equipoConHoras.find(e => e.id === a.empleadoId)?.departamento?.includes('Atención')
    ).length, availableATC.length);
    
    const neededONB = Math.min(config.onbCount - currentAssigned.filter(a => 
      equipoConHoras.find(e => e.id === a.empleadoId)?.departamento?.includes('Onboarding')
    ).length, availableONB.length);
    
    const staffToAssign = [
      ...availableATC.slice(0, neededATC),
      ...availableONB.slice(0, neededONB),
      ...availableStaff.slice(0, Math.max(0, needed - neededATC - neededONB))
    ].slice(0, needed);
    
    staffToAssign.forEach((staff, index) => {
      const turnoKey = turno as TurnoType;
      asignaciones.push({
        id: `${staff.id}-${fecha}-${turno}-auto-${index}`,
        empleadoId: staff.id,
        fecha,
        turno: turnoKey,
        horas: TURNOS[turnoKey].horas
      });
      console.log(`✅ AUTO: ${staff.nombre} → ${fecha} ${turno}`);
    });
  }

  calculateWeeklyHours(staffId: string, asignaciones: AsignacionTurno[], currentDate: string): number {
    const weekStart = this.getWeekStart(new Date(currentDate));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return asignaciones
      .filter(a => {
        if (a.empleadoId !== staffId) return false;
        const fechaAsignacion = new Date(a.fecha);
        return fechaAsignacion >= weekStart && fechaAsignacion <= weekEnd;
      })
      .reduce((total, a) => total + a.horas, 0);
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
  const hoursManager = new WeeklyHoursManager();
  const autoAssigner = new CompleteAutoAssigner();
  const hoursCalculator = new StaffHoursCalculator();

  // Nuevas funciones de auto-asignación y limpieza
  const autoAsignarMes = () => {
    if (confirm('¿Estás seguro de auto-asignar TODO el mes? Esto sobrescribirá asignaciones existentes.')) {
      console.log('📅 Ejecutando auto-asignación mensual...');
      
      try {
        // LIMPIAR MES COMPLETO PRIMERO
        setAsignaciones(prev => {
          const primerDia = new Date(anoActual, mesActual, 1);
          const ultimoDia = new Date(anoActual, mesActual + 1, 0);
          
          return prev.filter(a => {
            const fechaAsignacion = new Date(a.fecha);
            return fechaAsignacion < primerDia || fechaAsignacion > ultimoDia;
          });
        });
        
        // EJECUTAR AUTO-ASIGNACIÓN MENSUAL
        const nuevasAsignaciones = autoAssigner.autoAssignMonth(mesActual, anoActual, equipoConHoras);
        
        // AGREGAR NUEVAS ASIGNACIONES
        setAsignaciones(prev => [...prev, ...nuevasAsignaciones]);
        
        // FORZAR ACTUALIZACIÓN DE HORAS
        setTimeout(() => {
          hoursCalculator.updateAllStaffHours(nuevasAsignaciones, EQUIPO_COMPLETO, setEquipoConHoras);
        }, 200);
        
        toast({
          title: "✅ Auto-asignación mensual completada",
          description: `${MESES[mesActual]} con ${nuevasAsignaciones.length} asignaciones optimizadas`,
        });
        
      } catch (error) {
        console.error('❌ Error en auto-asignación mensual:', error);
        toast({
          title: "Error",
          description: "Error al auto-asignar el mes completo",
          variant: "destructive"
        });
      }
    }
  };

  const limpiarMes = () => {
    if (confirm('¿Estás seguro de limpiar TODAS las asignaciones del mes?')) {
      setAsignaciones(prev => {
        const primerDia = new Date(anoActual, mesActual, 1);
        const ultimoDia = new Date(anoActual, mesActual + 1, 0);
        
        return prev.filter(a => {
          const fechaAsignacion = new Date(a.fecha);
          return fechaAsignacion < primerDia || fechaAsignacion > ultimoDia;
        });
      });
      
      // Actualizar horas
      hoursCalculator.updateAllStaffHours([], EQUIPO_COMPLETO, setEquipoConHoras);
      
      toast({
        title: "🗑️ Mes limpiado",
        description: `Todas las asignaciones de ${MESES[mesActual]} han sido eliminadas`,
      });
    }
  };

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
    console.log('🎯 Ejecutando auto-asignación corregida...');
    
    const weekStart = vistaActual === 'week' ? semanaSeleccionada : getWeekStart(new Date().getDate());
    
    try {
      // LIMPIAR ASIGNACIONES DE LA SEMANA PRIMERO
      setAsignaciones(prev => {
        const fechaInicio = new Date(weekStart);
        const fechaFin = new Date(weekStart);
        fechaFin.setDate(weekStart.getDate() + 6);
        
        return prev.filter(a => {
          const fechaAsignacion = new Date(a.fecha);
          return fechaAsignacion < fechaInicio || fechaAsignacion > fechaFin;
        });
      });
      
      // EJECUTAR AUTO-ASIGNACIÓN COMPLETA
      const nuevasAsignaciones = autoAssigner.autoAssignWeek(
        weekStart, 
        equipoConHoras, 
        mesActual, 
        anoActual
      );
      
      // AGREGAR NUEVAS ASIGNACIONES
      setAsignaciones(prev => [...prev, ...nuevasAsignaciones]);
      
      // FORZAR ACTUALIZACIÓN DE HORAS INMEDIATAMENTE
      setTimeout(() => {
        hoursCalculator.updateAllStaffHours(nuevasAsignaciones, EQUIPO_COMPLETO, setEquipoConHoras);
      }, 100);
      
      toast({
        title: "✅ Auto-asignación completada",
        description: `Semana ${autoAssigner.getWeekType(weekStart.getDate())} con ${nuevasAsignaciones.length} asignaciones`,
      });
      
    } catch (error) {
      console.error('❌ Error en auto-asignación:', error);
      toast({
        title: "Error",
        description: "Error al auto-asignar la semana",
        variant: "destructive"
      });
    }
  };

  const limpiarSemana = () => {
    if (confirm('¿Estás seguro de limpiar todas las asignaciones de esta semana?')) {
      const weekStart = vistaActual === 'week' ? semanaSeleccionada : getWeekStart(new Date().getDate());
      
      setAsignaciones(prev => {
        const fechaInicio = new Date(weekStart);
        const fechaFin = new Date(weekStart);
        fechaFin.setDate(weekStart.getDate() + 6);
        
        return prev.filter(a => {
          const fechaAsignacion = new Date(a.fecha);
          return fechaAsignacion < fechaInicio || fechaAsignacion > fechaFin;
        });
      });
      
      // Actualizar horas
      hoursCalculator.updateAllStaffHours([], EQUIPO_COMPLETO, setEquipoConHoras);
      
      toast({
        title: "🗑️ Semana limpiada",
        description: "Todas las asignaciones han sido eliminadas",
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

    // Validaciones completas
    const fechaObj = new Date(fecha);
    const esDomingo = fechaObj.getDay() === 0;
    
    // 1. Restricción de domingos para colombianos
    if (empleado.pais === 'Colombia' && esDomingo) {
      toast({
        title: "Restricción de País",
        description: "Los empleados de Colombia no pueden trabajar domingos",
        variant: "destructive"
      });
      setEmpleadoArrastrado(null);
      return;
    }

    // 2. Verificar duplicado en la misma fecha
    const yaAsignadoMismaFecha = asignaciones.some(a => 
      a.empleadoId === empleado.id && 
      a.fecha === fecha
    );

    if (yaAsignadoMismaFecha) {
      toast({
        title: "Conflicto de Asignación",
        description: "El empleado ya tiene un turno asignado en esta fecha",
        variant: "destructive"
      });
      setEmpleadoArrastrado(null);
      return;
    }

    // 3. Verificar límite de horas semanales
    const horasSemanalesActuales = hoursManager.calculateWeeklyHoursForStaff(empleado.id, asignaciones);
    const horasNuevoTurno = TURNOS[turno].horas;
    const maxHoras = empleado.pais === 'Colombia' ? 44 : 45;

    if (horasSemanalesActuales + horasNuevoTurno > maxHoras) {
      toast({
        title: "Límite de Horas Excedido",
        description: `${empleado.nombre} excedería su límite semanal (${horasSemanalesActuales + horasNuevoTurno}h/${maxHoras}h)`,
        variant: "destructive"
      });
      setEmpleadoArrastrado(null);
      return;
    }

    // 4. Verificar restricciones específicas
    if (empleado.nombre.includes('Sugli') && turno !== 'madrugada') {
      toast({
        title: "Restricción de Empleado",
        description: "Sugli solo puede trabajar en turno de madrugada",
        variant: "destructive"
      });
      setEmpleadoArrastrado(null);
      return;
    }

    // Crear nueva asignación
    const nuevaAsignacion: AsignacionTurno = {
      id: `${empleado.id}-${fecha}-${turno}-${Date.now()}`,
      empleadoId: empleado.id,
      fecha,
      turno,
      horas: TURNOS[turno].horas
    };

    setAsignaciones(prev => {
      const updated = [...prev, nuevaAsignacion];
      // ACTUALIZAR HORAS INMEDIATAMENTE
      setTimeout(() => {
        hoursCalculator.updateAllStaffHours(updated, EQUIPO_COMPLETO, setEquipoConHoras);
      }, 10);
      return updated;
    });
    
    setEmpleadoArrastrado(null);
    
    toast({
      title: "✅ Asignación Exitosa",
      description: `${empleado.nombre} asignado a ${TURNOS[turno].nombre} el ${new Date(fecha).toLocaleDateString()}`,
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
            <Button onClick={() => {
              const newMonth = mesActual === 0 ? 11 : mesActual - 1;
              const newYear = mesActual === 0 ? anoActual - 1 : anoActual;
              setMesActual(newMonth);
              setAnoActual(newYear);
            }}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-lg font-medium min-w-[200px] text-center">
              {MESES[mesActual]} {anoActual}
            </span>
            <Button onClick={() => {
              const newMonth = mesActual === 11 ? 0 : mesActual + 1;
              const newYear = mesActual === 11 ? anoActual + 1 : anoActual;
              setMesActual(newMonth);
              setAnoActual(newYear);
            }}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            {vistaActual === 'month' && (
              <Button onClick={autoAsignarMes} className="bg-green-600 hover:bg-green-700">
                📅 Auto-Asignar Mes Completo
              </Button>
            )}
            
            <Button onClick={autoAsignarSemana} className="bg-primary text-primary-foreground hover:bg-primary/90">
              🎯 Auto-Asignar Semana
            </Button>
            
            <Button onClick={limpiarSemana} variant="outline">
              🗑️ Limpiar Semana
            </Button>
            
            {vistaActual === 'month' && (
              <Button onClick={limpiarMes} variant="outline" className="text-red-600 border-red-300">
                🗑️ Limpiar Mes
              </Button>
            )}
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
                className={`min-h-[140px] cursor-pointer transition-all hover:shadow-md ${
                  weekType === 'alta' ? 'border-red-200 bg-red-50' :
                  weekType === 'media' ? 'border-yellow-200 bg-yellow-50' :
                  'border-green-200 bg-green-50'
                }`}
                onClick={() => switchToWeekView(getWeekStart(dia))}
                onDragOver={onDragOver}
                onDrop={(e) => {
                  // Para vista mensual, simplificar drop a primer turno disponible
                  e.preventDefault();
                  if (empleadoArrastrado) {
                    const turnos: TurnoType[] = ['manana', 'tarde', 'madrugada', 'senior_nocturno'];
                    for (const turno of turnos) {
                      const fechaStr = `${anoActual}-${String(mesActual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
                      const asignacionesEnTurno = asignaciones.filter(a => a.fecha === fechaStr && a.turno === turno);
                      if (asignacionesEnTurno.length === 0) {
                        onDrop(e, fechaStr, turno);
                        break;
                      }
                    }
                  }
                }}
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
                      const asignacionesTurno = asignacionesDia.filter(a => a.turno === turno);
                      const staffPlan = weekType === 'alta' ? 
                        (turno === 'manana' ? 7 : turno === 'tarde' ? 5 : turno === 'madrugada' ? 2 : 1) :
                        weekType === 'media' ?
                        (turno === 'manana' ? 6 : turno === 'tarde' ? 4 : turno === 'madrugada' ? 2 : 1) :
                        (turno === 'manana' ? 5 : turno === 'tarde' ? 3 : turno === 'madrugada' ? 1 : 1);
                      
                      return (
                        <div key={turno} className="flex justify-between items-center">
                          <span className="truncate">{config.nombre}:</span>
                          <div className="flex gap-1 items-center">
                            <span className={`font-medium ${
                              asignacionesTurno.length >= staffPlan ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {asignacionesTurno.length}/{staffPlan}
                            </span>
                            {asignacionesTurno.slice(0, 2).map(a => {
                              const emp = equipoConHoras.find(e => e.id === a.empleadoId);
                              return (
                                <div key={a.id} className="w-1 h-1 bg-blue-500 rounded-full" 
                                     title={emp?.nombre}></div>
                              );
                            })}
                          </div>
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
    
    const weekType = autoAssigner.getWeekType(semanaSeleccionada.getDate());
    
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
            <Button onClick={limpiarSemana} variant="outline">
              🗑️ Limpiar Semana
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => {
                const nuevaSemana = new Date(semanaSeleccionada);
                nuevaSemana.setDate(nuevaSemana.getDate() - 7);
                setSemanaSeleccionada(nuevaSemana);
              }}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Semana Anterior
            </Button>
            
            <Button 
              onClick={() => {
                const nuevaSemana = new Date(semanaSeleccionada);
                nuevaSemana.setDate(nuevaSemana.getDate() + 7);
                setSemanaSeleccionada(nuevaSemana);
              }}
              variant="outline"
              size="sm"
            >
              Semana Siguiente
              <ChevronRight className="w-4 h-4" />
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