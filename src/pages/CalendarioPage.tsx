import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EQUIPO_COMPLETO, TURNOS, type TipoSemana, type TurnoType, type AsignacionTurno, type Empleado } from "@/types/equipo";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, ChevronLeft, ChevronRight, BarChart3, TrendingUp, Calendar, Users, ChevronDown, ChevronUp } from "lucide-react";
import HorasExtrasForm from "@/components/ui/HorasExtrasForm";

// ================ CORRECCIONES CRÍTICAS Y MEJORAS UX - SISTEMA DE TURNOS 24/7 ================
// Problemas identificados: Domingos vacíos, calendario estático, UX sobrecargado, nombres pegados

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

// ================ CORRECCIÓN 1: COBERTURA DOMINGOS 24/7 ================
class DomingosCoverageManager {
  
  assignDomingosCoverage(asignaciones: AsignacionTurno[], equipoConHoras: Empleado[], month: number, year: number): AsignacionTurno[] {
    console.log('📅 Asignando cobertura domingos (24/7)...');
    
    // PRIORIDAD: Venezuela, México, Italia (pueden trabajar domingos)
    const availableForSundays = equipoConHoras.filter(emp => 
      ['Venezuela', 'México', 'Italia'].includes(emp.pais)
    );
    
    // CONFIGURACIÓN DOMINGO MÍNIMA
    const sundayConfig = {
      'madrugada': { total: 1, priority: ['Sugli'] },
      'manana': { total: 3, priority: ['Helen', 'Mayra', 'Carmen'] }, 
      'tarde': { total: 2, priority: ['José Manuel', 'Nerean'] },
      'senior_nocturno': { total: 1, priority: ['Helen', 'Mayra', 'José Manuel'] }
    };
    
    const newAssignments: AsignacionTurno[] = [];
    
    // ASIGNAR FORZADAMENTE DOMINGOS
    Object.entries(sundayConfig).forEach(([shift, config]) => {
      const needed = config.total;
      const available = availableForSundays.filter(staff => 
        config.priority.some(name => staff.nombre.includes(name)) &&
        this.canWorkSunday(staff, asignaciones)
      );
      
      available.slice(0, needed).forEach(staff => {
        // Buscar todos los domingos del mes
        this.getSundaysInMonth(month, year).forEach(sundayDate => {
          const assignment: AsignacionTurno = {
            id: `${staff.id}-${sundayDate}-${shift}-domingo`,
            empleadoId: staff.id,
            fecha: sundayDate,
            turno: shift as TurnoType,
            horas: TURNOS[shift as TurnoType].horas
          };
          newAssignments.push(assignment);
          console.log(`✅ DOMINGO: ${staff.nombre} → ${shift} (${sundayDate})`);
        });
      });
    });
    
    return newAssignments;
  }

  canWorkSunday(staff: Empleado, asignaciones: AsignacionTurno[]): boolean {
    // Solo venezolanos, mexicanos e italianos pueden trabajar domingos
    if (!['Venezuela', 'México', 'Italia'].includes(staff.pais)) return false;
    
    // Verificar límite de horas semanal
    const weeklyHours = this.calculateWeeklyHours(staff.id, asignaciones);
    const maxHoras = staff.pais === 'Colombia' ? 44 : 45;
    
    return weeklyHours + 8 <= maxHoras; // Asumiendo 8h por turno promedio
  }

  getSundaysInMonth(month: number, year: number): string[] {
    const sundays: string[] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      if (date.getDay() === 0) { // Domingo
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        sundays.push(dateStr);
      }
    }
    
    return sundays;
  }

  calculateWeeklyHours(staffId: string, asignaciones: AsignacionTurno[]): number {
    return asignaciones
      .filter(a => a.empleadoId === staffId)
      .reduce((total, a) => total + a.horas, 0);
  }
}

// ================ CORRECCIÓN 2: CALENDARIO DINÁMICO REAL ================
class RealCalendarManager {
  private currentDate: Date = new Date();
  
  updateCalendarWithRealDates(): void {
    console.log('📅 Actualizando calendario con fechas reales...');
    this.validateRealDates();
  }

  validateRealDates(): void {
    // Verificar que las fechas correspondan a los días correctos
    const testDate1 = new Date(2025, 6, 29); // 29 julio 2025
    const testDate2 = new Date(2025, 6, 31); // 31 julio 2025
    
    console.log(`📅 Validación: 29 julio 2025 = ${DIAS_SEMANA[testDate1.getDay()]}`);
    console.log(`📅 Validación: 31 julio 2025 = ${DIAS_SEMANA[testDate2.getDay()]}`);
  }

  generateRealCalendar(year: number, month: number): any[] {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendarDays = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay(); // 0=domingo, 1=lunes, ..., 6=sábado
      const realDayName = DIAS_SEMANA[dayOfWeek];
      
      const weekType = this.getWeekType(day);
      
      calendarDays.push({
        dia: day,
        realDayName,
        weekType,
        fullDate: date,
        esMesAnterior: false,
        fecha: date
      });
    }
    
    console.log(`✅ Calendario actualizado: ${year}-${month + 1} con ${daysInMonth} días`);
    return calendarDays;
  }

  getWeekType(dayOfMonth: number): TipoSemana {
    if (REAL_DEMAND_ANALYSIS.monthlyPattern.alta.days.includes(dayOfMonth)) return 'alta';
    if (REAL_DEMAND_ANALYSIS.monthlyPattern.media.days.includes(dayOfMonth)) return 'media';
    return 'valle';
  }

  // NAVEGACIÓN MENSUAL FUNCIONAL
  navigateMonth(direction: number, currentMonth: number, currentYear: number): {month: number, year: number} {
    const newDate = new Date(currentYear, currentMonth + direction, 1);
    return {
      month: newDate.getMonth(),
      year: newDate.getFullYear()
    };
  }
}

// ================ MEJORA 3: UX MINIMALISTA Y LIMPIO ================
interface CollapsibleWeek {
  startDay: number;
  endDay: number;
  type: TipoSemana;
  days: any[];
  isCollapsed: boolean;
}

class MinimalistUIManager {
  private collapsedWeeks: Set<number> = new Set();
  
  generateCollapsibleWeeks(month: number, year: number): CollapsibleWeek[] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const weeks: CollapsibleWeek[] = [];
    
    let currentWeekStart = 1;
    
    // Generar semanas del mes
    while (currentWeekStart <= lastDay.getDate()) {
      const weekEndDay = Math.min(currentWeekStart + 6, lastDay.getDate());
      const weekType = this.getWeekType(currentWeekStart);
      
      const weekDays = [];
      for (let day = currentWeekStart; day <= weekEndDay; day++) {
        const date = new Date(year, month, day);
        weekDays.push({
          date: day,
          dayName: DIAS_SEMANA[date.getDay()],
          weekType,
          fullDate: date
        });
      }
      
      weeks.push({
        startDay: currentWeekStart,
        endDay: weekEndDay,
        type: weekType,
        days: weekDays,
        isCollapsed: this.collapsedWeeks.has(weeks.length)
      });
      
      currentWeekStart = weekEndDay + 1;
    }
    
    return weeks;
  }

  getWeekType(dayOfMonth: number): TipoSemana {
    if (REAL_DEMAND_ANALYSIS.monthlyPattern.alta.days.includes(dayOfMonth)) return 'alta';
    if (REAL_DEMAND_ANALYSIS.monthlyPattern.media.days.includes(dayOfMonth)) return 'media';
    return 'valle';
  }

  toggleWeek(weekIndex: number): void {
    if (this.collapsedWeeks.has(weekIndex)) {
      this.collapsedWeeks.delete(weekIndex);
    } else {
      this.collapsedWeeks.add(weekIndex);
    }
  }

  getWeekCoverage(week: CollapsibleWeek, asignaciones: AsignacionTurno[]): number {
    // Calcular porcentaje de cobertura de la semana
    const totalSlotsNeeded = week.days.length * Object.keys(TURNOS).length;
    const assignedSlots = week.days.reduce((count, day) => {
      const dayStr = `${day.fullDate.getFullYear()}-${String(day.fullDate.getMonth() + 1).padStart(2, '0')}-${String(day.date).padStart(2, '0')}`;
      return count + asignaciones.filter(a => a.fecha === dayStr).length;
    }, 0);
    
    return Math.round((assignedSlots / totalSlotsNeeded) * 100);
  }
}

// ================ CORRECCIÓN DE HORAS EN TIEMPO REAL ================
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

// ================ ALGORITMO INTELIGENTE COMPLETO ================
class IntelligentStaffingAlgorithm {
  private domingoManager = new DomingosCoverageManager();
  
  getWeekType(dayOfMonth: number): 'ALTA' | 'MEDIA' | 'VALLE' {
    if (REAL_DEMAND_ANALYSIS.monthlyPattern.alta.days.includes(dayOfMonth)) return 'ALTA';
    if (REAL_DEMAND_ANALYSIS.monthlyPattern.media.days.includes(dayOfMonth)) return 'MEDIA';
    return 'VALLE';
  }

  autoAssignCompleteMonth(mes: number, ano: number, equipoConHoras: Empleado[]): AsignacionTurno[] {
    console.log('🧠 Ejecutando asignación inteligente mensual...');
    
    const primerDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const todasAsignaciones: AsignacionTurno[] = [];
    
    // FASE 1: Asignar cobertura domingos 24/7 PRIMERO
    const asignacionesDomingos = this.domingoManager.assignDomingosCoverage([], equipoConHoras, mes, ano);
    todasAsignaciones.push(...asignacionesDomingos);
    
    // FASE 2: Procesar semana por semana (Lun-Sáb)
    for (let dia = 1; dia <= ultimoDia.getDate(); dia += 7) {
      const fechaSemana = new Date(ano, mes, dia);
      const lunes = this.getWeekStart(fechaSemana);
      
      const asignacionesSemana = this.autoAssignWeekIntelligent(lunes, equipoConHoras, mes, ano, todasAsignaciones);
      todasAsignaciones.push(...asignacionesSemana);
    }
    
    console.log('✅ Auto-asignación inteligente mensual completada:', todasAsignaciones.length, 'asignaciones');
    return todasAsignaciones;
  }

  autoAssignWeekIntelligent(
    weekStartDate: Date, 
    equipoConHoras: Empleado[], 
    mesActual: number, 
    anoActual: number,
    existingAssignments: AsignacionTurno[] = []
  ): AsignacionTurno[] {
    console.log('🚀 Iniciando auto-asignación INTELIGENTE...');
    
    const weekType = this.getWeekType(weekStartDate.getDate());
    const staffingPlan = CORRECTED_STAFFING_PLANS[weekType];
    const nuevasAsignaciones: AsignacionTurno[] = [];
    
    console.log(`📊 Plan inteligente para semana ${weekType}:`, staffingPlan);
    
    // ASIGNAR 6 DÍAS DE TRABAJO (Lun-Sáb) - Los domingos ya están cubiertos
    for (let dayOffset = 0; dayOffset < 6; dayOffset++) {
      const targetDate = new Date(weekStartDate);
      targetDate.setDate(weekStartDate.getDate() + dayOffset);
      
      const fecha = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
      const diaSemana = targetDate.getDay();

      // 1. ASIGNACIONES FIJAS OBLIGATORIAS
      this.assignFixedStaff(nuevasAsignaciones, equipoConHoras, fecha, diaSemana);
      
      // 2. ROTACIÓN DE SENIORS INTELIGENTE
      this.assignSeniorRotationIntelligent(nuevasAsignaciones, equipoConHoras, fecha, dayOffset);
      
      // 3. COMPLETAR CADA TURNO SEGÚN PLAN OPTIMIZADO
      this.fillShiftIntelligently(nuevasAsignaciones, equipoConHoras, fecha, 'manana', staffingPlan.AM, existingAssignments);
      this.fillShiftIntelligently(nuevasAsignaciones, equipoConHoras, fecha, 'tarde', staffingPlan.PM, existingAssignments);
      this.fillShiftIntelligently(nuevasAsignaciones, equipoConHoras, fecha, 'madrugada', staffingPlan.M, existingAssignments);
      this.fillShiftIntelligently(nuevasAsignaciones, equipoConHoras, fecha, 'senior_nocturno', { total: 1, atcCount: 1, onbCount: 0 }, existingAssignments);
    }
    
    console.log('✅ Auto-asignación inteligente completada:', nuevasAsignaciones.length, 'asignaciones');
    return nuevasAsignaciones;
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
          id: `${ashley.id}-${fecha}-manana-onb-fixed`,
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
          id: `${fernando.id}-${fecha}-tarde-onb-fixed`,
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
          id: `${sugli.id}-${fecha}-madrugada-fixed`,
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

  assignSeniorRotationIntelligent(asignaciones: AsignacionTurno[], equipoConHoras: Empleado[], fecha: string, dayOffset: number): void {
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
          id: `${senior.id}-${fecha}-senior_nocturno-rotation`,
          empleadoId: senior.id,
          fecha,
          turno: 'senior_nocturno',
          horas: TURNOS.senior_nocturno.horas
        });
      }
    });
  }

  fillShiftIntelligently(
    asignaciones: AsignacionTurno[], 
    equipoConHoras: Empleado[], 
    fecha: string, 
    turno: string,
    config: {total: number, atcCount: number, onbCount: number},
    existingAssignments: AsignacionTurno[]
  ): void {
    const allAssignments = [...asignaciones, ...existingAssignments];
    const currentAssigned = allAssignments.filter(a => a.fecha === fecha && a.turno === turno);
    const needed = config.total - currentAssigned.length;
    
    if (needed <= 0) return;
    
    const fechaObj = new Date(fecha);
    const diaSemana = fechaObj.getDay();
    
    // Obtener staff disponible con validaciones inteligentes
    let availableStaff = equipoConHoras.filter(emp => {
      const yaAsignado = allAssignments.some(a => a.empleadoId === emp.id && a.fecha === fecha);
      const esColombianoEnDomingo = emp.pais === 'Colombia' && diaSemana === 0;
      const horasSemanales = this.calculateWeeklyHours(emp.id, allAssignments, fecha);
      const maxHoras = emp.pais === 'Colombia' ? 44 : 45;
      const excederiaLimite = horasSemanales + TURNOS[turno as TurnoType].horas > maxHoras;
      
      return !yaAsignado && !esColombianoEnDomingo && !excederiaLimite;
    });

    // Separar por tipo y priorizar inteligentemente
    const availableATC = availableStaff
      .filter(s => s.departamento === 'Atención al Cliente' || s.departamento === 'Híbrido')
      .sort((a, b) => a.horasAsignadas - b.horasAsignadas);
    
    const availableONB = availableStaff
      .filter(s => s.departamento === 'Onboarding' || s.departamento === 'Híbrido')
      .sort((a, b) => a.horasAsignadas - b.horasAsignadas);
    
    // ASIGNAR SEGÚN NECESIDADES INTELIGENTES
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
        id: `${staff.id}-${fecha}-${turno}-intelligent-${index}`,
        empleadoId: staff.id,
        fecha,
        turno: turnoKey,
        horas: TURNOS[turnoKey].horas
      });
      console.log(`✅ INTELIGENTE: ${staff.nombre} → ${fecha} ${turno}`);
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

// ================ ACTUALIZACIÓN DE HORAS EN TIEMPO REAL ================
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

// ================ ESTILOS MINIMALISTAS MEJORADOS ================
const MINIMAL_STYLES = `
  .staff-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    margin: 3px;
    background: hsl(var(--secondary));
    border: 1px solid hsl(var(--border));
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    cursor: grab;
    transition: all 0.2s ease;
    min-width: 70px;
    justify-content: center;
    white-space: nowrap;
  }
  
  .staff-chip:hover {
    background: hsl(var(--secondary) / 0.8);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px hsl(var(--foreground) / 0.1);
  }
  
  .staff-chip.dragging {
    opacity: 0.7;
    transform: rotate(2deg);
  }
  
  .staff-name-short {
    color: hsl(var(--foreground));
    font-weight: 600;
  }
  
  .country-flag {
    font-size: 10px;
    opacity: 0.8;
  }
  
  .staff-slots {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    min-height: 35px;
    padding: 6px;
    align-items: flex-start;
    align-content: flex-start;
  }
  
  .shift-minimal {
    background: hsl(var(--card));
    border: 2px dashed hsl(var(--border));
    border-radius: 8px;
    padding: 8px;
    min-height: 80px;
    transition: all 0.2s ease;
  }
  
  .shift-minimal.drag-over {
    background: hsl(var(--primary) / 0.1);
    border-color: hsl(var(--primary));
    border-style: solid;
  }
  
  .week-section {
    border-bottom: 1px solid hsl(var(--border));
    margin-bottom: 8px;
  }
  
  .week-header {
    display: flex;
    align-items: center;
    justify-content: between;
    padding: 12px 16px;
    background: hsl(var(--muted) / 0.5);
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 8px 8px 0 0;
  }
  
  .week-header:hover {
    background: hsl(var(--muted));
  }
  
  .week-content.collapsed {
    display: none;
  }
  
  .week-content {
    padding: 16px;
    background: hsl(var(--card));
    border-radius: 0 0 8px 8px;
    border: 1px solid hsl(var(--border));
    border-top: none;
  }
`;

export default function CalendarioPage() {
  const [mesActual, setMesActual] = useState(new Date().getMonth());
  const [anoActual, setAnoActual] = useState(new Date().getFullYear());
  const [asignaciones, setAsignaciones] = useState<AsignacionTurno[]>([]);
  const [empleadoArrastrado, setEmpleadoArrastrado] = useState<string | null>(null);
  const [equipoConHoras, setEquipoConHoras] = useState<Empleado[]>([...EQUIPO_COMPLETO]);
  const [solicitudesHorasExtras, setSolicitudesHorasExtras] = useState<any[]>([]);
  const [mostrarFormularioHorasExtras, setMostrarFormularioHorasExtras] = useState(false);
  const [vistaActual, setVistaActual] = useState<'month' | 'week' | 'collapsible'>('collapsible');
  const [semanaSeleccionada, setSemanaSeleccionada] = useState<Date>(new Date());
  const [semanasColapsadas, setSemanasColapsadas] = useState<Set<number>>(new Set());

  // Instancias de clases
  const hoursManager = new WeeklyHoursManager();
  const intelligentAlgorithm = new IntelligentStaffingAlgorithm();
  const hoursCalculator = new StaffHoursCalculator();
  const domingoManager = new DomingosCoverageManager();
  const calendarManager = new RealCalendarManager();
  const uiManager = new MinimalistUIManager();

  // Inyectar estilos al cargar
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = MINIMAL_STYLES;
    document.head.appendChild(style);
    
    calendarManager.updateCalendarWithRealDates();
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Auto-asignación mensual COMPLETA e INTELIGENTE
  const autoAsignarMesCompleto = () => {
    if (confirm('¿Ejecutar AUTO-ASIGNACIÓN MENSUAL COMPLETA con cobertura 24/7? Esto incluye domingos y optimización inteligente.')) {
      console.log('🚀 Ejecutando auto-asignación mensual COMPLETA...');
      
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
        
        // EJECUTAR AUTO-ASIGNACIÓN INTELIGENTE MENSUAL
        const nuevasAsignaciones = intelligentAlgorithm.autoAssignCompleteMonth(mesActual, anoActual, equipoConHoras);
        
        // AGREGAR NUEVAS ASIGNACIONES
        setAsignaciones(prev => [...prev, ...nuevasAsignaciones]);
        
        // FORZAR ACTUALIZACIÓN DE HORAS
        setTimeout(() => {
          hoursCalculator.updateAllStaffHours(nuevasAsignaciones, EQUIPO_COMPLETO, setEquipoConHoras);
        }, 200);
        
        toast({
          title: "✅ Auto-asignación mensual COMPLETA",
          description: `${MESES[mesActual]} con ${nuevasAsignaciones.length} asignaciones optimizadas (incluye domingos 24/7)`,
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
    return calendarManager.generateRealCalendar(anoActual, mesActual);
  };

  const getWeekType = (dia: number): TipoSemana => {
    return calendarManager.getWeekType(dia);
  };

  const getWeekStart = (dia: number): Date => {
    const targetDate = new Date(anoActual, mesActual, dia);
    const dayOfWeek = targetDate.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const weekStart = new Date(targetDate);
    weekStart.setDate(targetDate.getDate() + mondayOffset);
    
    return weekStart;
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

  const switchToWeekView = (weekStart: Date) => {
    setVistaActual('week');
    setSemanaSeleccionada(weekStart);
  };

  const switchToMonthView = () => {
    setVistaActual('month');
  };

  const switchToCollapsibleView = () => {
    setVistaActual('collapsible');
  };

  const autoAsignarSemana = () => {
    console.log('🎯 Ejecutando auto-asignación semanal INTELIGENTE...');
    
    const weekStart = vistaActual === 'week' ? semanaSeleccionada : getWeekStart(new Date().getDate());
    
    try {
      // LIMPIAR ASIGNACIONES DE LA SEMANA PRIMERO (excepto domingos)
      setAsignaciones(prev => {
        const fechaInicio = new Date(weekStart);
        const fechaFin = new Date(weekStart);
        fechaFin.setDate(weekStart.getDate() + 6);
        
        return prev.filter(a => {
          const fechaAsignacion = new Date(a.fecha);
          const esDomingo = fechaAsignacion.getDay() === 0;
          // Mantener domingos, limpiar resto
          return (fechaAsignacion < fechaInicio || fechaAsignacion > fechaFin) || esDomingo;
        });
      });
      
      // EJECUTAR AUTO-ASIGNACIÓN INTELIGENTE
      const nuevasAsignaciones = intelligentAlgorithm.autoAssignWeekIntelligent(
        weekStart, 
        equipoConHoras, 
        mesActual, 
        anoActual,
        asignaciones
      );
      
      // AGREGAR NUEVAS ASIGNACIONES
      setAsignaciones(prev => [...prev, ...nuevasAsignaciones]);
      
      // FORZAR ACTUALIZACIÓN DE HORAS INMEDIATAMENTE
      setTimeout(() => {
        hoursCalculator.updateAllStaffHours(nuevasAsignaciones, EQUIPO_COMPLETO, setEquipoConHoras);
      }, 100);
      
      toast({
        title: "✅ Auto-asignación semanal INTELIGENTE",
        description: `Semana ${intelligentAlgorithm.getWeekType(weekStart.getDate())} con ${nuevasAsignaciones.length} asignaciones optimizadas`,
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

    // 2. Verificar duplicado en la misma fecha - CORRECCIÓN CRÍTICA
    const yaAsignadoMismaFecha = asignaciones.some(a => 
      a.empleadoId === empleado.id && 
      a.fecha === fecha
    );

    if (yaAsignadoMismaFecha) {
      toast({
        title: "❌ Conflicto de Asignación",
        description: `${empleado.nombre} ya tiene un turno asignado el ${new Date(fecha).toLocaleDateString()}`,
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
        title: "⚠️ Límite de Horas Excedido",
        description: `${empleado.nombre} excedería su límite semanal (${horasSemanalesActuales + horasNuevoTurno}h/${maxHoras}h)`,
        variant: "destructive"
      });
      setEmpleadoArrastrado(null);
      return;
    }

    // 4. Verificar restricciones específicas de empleados
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

  // ================ VISTA COLAPSABLE MINIMALISTA ================
  const renderVistaColapsable = () => {
    const weeks = uiManager.generateCollapsibleWeeks(mesActual, anoActual);
    
    return (
      <div className="space-y-4">
        {/* Header principal */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">🗓️ Calendario Inteligente 24/7</h1>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {MESES[mesActual]} {anoActual}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Navegación mensual */}
            <Button 
              onClick={() => {
                const {month, year} = calendarManager.navigateMonth(-1, mesActual, anoActual);
                setMesActual(month);
                setAnoActual(year);
              }}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Mes Anterior
            </Button>
            
            <Button 
              onClick={() => {
                const {month, year} = calendarManager.navigateMonth(1, mesActual, anoActual);
                setMesActual(month);
                setAnoActual(year);
              }}
              variant="outline"
              size="sm"
            >
              Mes Siguiente
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            {/* Acciones principales */}
            <Button onClick={autoAsignarMesCompleto} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
              🚀 Auto-Asignar Mes COMPLETO
            </Button>
            
            <Button onClick={autoAsignarSemana} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              🎯 Auto-Asignar Semana
            </Button>
            
            <Button onClick={limpiarMes} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
              🗑️ Limpiar Mes
            </Button>
          </div>
        </div>

        {/* Vista por semanas colapsables */}
        <div className="space-y-3">
          {weeks.map((week, weekIndex) => {
            const isCollapsed = semanasColapsadas.has(weekIndex);
            const coverage = uiManager.getWeekCoverage(week, asignaciones);
            
            return (
              <div key={weekIndex} className="week-section">
                {/* Header de semana */}
                <div 
                  className="week-header"
                  onClick={() => toggleWeek(weekIndex)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      {isCollapsed ? 
                        <ChevronRight className="w-5 h-5" /> : 
                        <ChevronDown className="w-5 h-5" />
                      }
                      <span className="font-semibold text-lg">
                        Semana {week.startDay}-{week.endDay}
                      </span>
                    </div>
                    
                    <Badge variant={
                      week.type === 'alta' ? 'destructive' :
                      week.type === 'media' ? 'default' : 'secondary'
                    } className="text-sm px-3 py-1">
                      {week.type.toUpperCase()}
                    </Badge>
                    
                    <div className="flex items-center gap-2">
                      <div className={`text-sm font-medium ${
                        coverage >= 80 ? 'text-green-600' : 
                        coverage >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {coverage}% cubierto
                      </div>
                      
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            coverage >= 80 ? 'bg-green-500' :
                            coverage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${coverage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        const weekStart = getWeekStart(week.startDay);
                        setSemanaSeleccionada(weekStart);
                        autoAsignarSemana();
                      }}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      🎯 Auto-Asignar
                    </Button>
                    
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setVistaActual('week');
                        setSemanaSeleccionada(getWeekStart(week.startDay));
                      }}
                      size="sm"
                      variant="outline"
                    >
                      👁️ Ver Detalle
                    </Button>
                  </div>
                </div>

                {/* Contenido de semana */}
                {!isCollapsed && (
                  <div className="week-content">
                    <div className="grid grid-cols-7 gap-3">
                      {week.days.map((day, dayIndex) => {
                        const fechaStr = `${day.fullDate.getFullYear()}-${String(day.fullDate.getMonth() + 1).padStart(2, '0')}-${String(day.date).padStart(2, '0')}`;
                        const asignacionesDia = asignaciones.filter(a => a.fecha === fechaStr);
                        
                        return (
                          <Card 
                            key={dayIndex} 
                            className={`min-h-[100px] cursor-pointer transition-all hover:shadow-md ${
                              day.weekType === 'alta' ? 'border-red-200 bg-red-50' :
                              day.weekType === 'media' ? 'border-yellow-200 bg-yellow-50' :
                              'border-green-200 bg-green-50'
                            }`}
                            onDragOver={onDragOver}
                            onDrop={(e) => {
                              e.preventDefault();
                              if (empleadoArrastrado) {
                                const turnos: TurnoType[] = ['manana', 'tarde', 'madrugada', 'senior_nocturno'];
                                for (const turno of turnos) {
                                  const asignacionesEnTurno = asignaciones.filter(a => a.fecha === fechaStr && a.turno === turno);
                                  if (asignacionesEnTurno.length === 0) {
                                    onDrop(e, fechaStr, turno);
                                    break;
                                  }
                                }
                              }
                            }}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-lg">{day.date}</span>
                                  <span className="text-sm text-muted-foreground">{day.dayName}</span>
                                </div>
                                <div className="text-xs">
                                  {asignacionesDia.length > 0 && (
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      {asignacionesDia.length}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="space-y-1 text-xs">
                                {Object.entries(TURNOS).map(([turno, config]) => {
                                  const asignacionesTurno = asignacionesDia.filter(a => a.turno === turno);
                                  const staffNeeded = day.weekType === 'alta' ? 
                                    (turno === 'manana' ? 7 : turno === 'tarde' ? 5 : turno === 'madrugada' ? 2 : 1) :
                                    day.weekType === 'media' ?
                                    (turno === 'manana' ? 6 : turno === 'tarde' ? 4 : turno === 'madrugada' ? 2 : 1) :
                                    (turno === 'manana' ? 5 : turno === 'tarde' ? 3 : turno === 'madrugada' ? 1 : 1);
                                  
                                  return (
                                    <div key={turno} className="flex justify-between items-center">
                                      <span className="truncate">{config.nombre.substring(0, 3)}:</span>
                                      <span className={`font-medium ${
                                        asignacionesTurno.length >= staffNeeded ? 'text-green-600' : 'text-red-600'
                                      }`}>
                                        {asignacionesTurno.length}/{staffNeeded}
                                      </span>
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
                )}
              </div>
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
    
    const weekType = intelligentAlgorithm.getWeekType(semanaSeleccionada.getDate());
    
    return (
      <div className="space-y-6">
        {/* Header semanal mejorado */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={switchToCollapsibleView} variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Volver a Vista Colapsable
            </Button>
            <h2 className="text-2xl font-bold">
              📅 Semana {weekType.toUpperCase()} - {semanaSeleccionada.toLocaleDateString()}
            </h2>
            <Badge variant={
              weekType === 'ALTA' ? 'destructive' :
              weekType === 'MEDIA' ? 'default' : 'secondary'
            } className="text-lg px-4 py-2">
              {weekType}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
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
            
            <Button onClick={autoAsignarSemana} className="bg-green-600 hover:bg-green-700">
              🎯 Auto-Asignar Semana Inteligente
            </Button>
            <Button onClick={limpiarSemana} variant="outline">
              🗑️ Limpiar Semana
            </Button>
          </div>
        </div>

        {/* Grid semanal mejorado */}
        <div className="grid grid-cols-8 gap-4">
          {/* Columna de turnos */}
          <div className="space-y-2">
            <div className="h-16 flex items-center font-bold text-lg bg-muted rounded-lg px-4">
              Turnos
            </div>
            {Object.entries(TURNOS).map(([turno, config]) => (
              <div key={turno} className="h-28 p-3 rounded-lg border bg-card shadow-sm">
                <div className="font-semibold text-sm mb-1">{config.nombre}</div>
                <div className="text-xs text-muted-foreground mb-1">{config.horario}</div>
                <div className="text-xs font-medium">{config.horas}h</div>
              </div>
            ))}
          </div>

          {/* Columnas de días mejoradas */}
          {weekDays.map((fecha, dayIndex) => {
            const fechaStr = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
            const esDomingo = fecha.getDay() === 0;
            
            return (
              <div key={dayIndex} className="space-y-2">
                <div className={`h-16 flex flex-col items-center justify-center font-semibold rounded-lg ${
                  esDomingo ? 'bg-red-100 text-red-800' : 'bg-muted'
                }`}>
                  <div className="text-sm">{DIAS_SEMANA[fecha.getDay()]}</div>
                  <div className="text-lg">{fecha.getDate()}</div>
                </div>
                
                {Object.entries(TURNOS).map(([turno, config]) => {
                  const asignacionesTurno = asignaciones.filter(a => 
                    a.fecha === fechaStr && a.turno === turno
                  );
                  
                  return (
                    <div
                      key={turno}
                      className="shift-minimal"
                      onDragOver={onDragOver}
                      onDrop={(e) => onDrop(e, fechaStr, turno as TurnoType)}
                    >
                      <div className="staff-slots">
                        {asignacionesTurno.map(asignacion => {
                          const empleado = equipoConHoras.find(e => e.id === asignacion.empleadoId);
                          const flagEmoji = empleado?.pais === 'Colombia' ? '🇨🇴' : 
                                          empleado?.pais === 'Venezuela' ? '🇻🇪' : 
                                          empleado?.pais === 'México' ? '🇲🇽' : '🇮🇹';
                          
                          return (
                            <div
                              key={asignacion.id}
                              className="staff-chip"
                              onClick={() => eliminarAsignacion(asignacion.id)}
                              title={`${empleado?.nombre} - Click para eliminar`}
                            >
                              <span className="staff-name-short">
                                {empleado?.nombre.split(' ')[0]}
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
            const flagEmoji = empleado.pais === 'Colombia' ? '🇨🇴' : 
                            empleado.pais === 'Venezuela' ? '🇻🇪' : 
                            empleado.pais === 'México' ? '🇲🇽' : '🇮🇹';
            
            return (
              <div
                key={empleado.id}
                className="p-3 border rounded-lg cursor-grab hover:shadow-sm transition-all hover:border-primary/50"
                draggable
                onDragStart={(e) => onDragStart(e, empleado.id)}
                data-staff-id={empleado.id}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{empleado.nombre}</span>
                    <span className="text-lg">{flagEmoji}</span>
                  </div>
                  <Badge variant={empleado.pais === 'Colombia' ? 'secondary' : 'default'}>
                    {empleado.pais}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-muted-foreground">{empleado.departamento}</span>
                  <span className={`font-bold hours-display ${
                    empleado.horasAsignadas > maxHoras ? 'text-red-600' : 
                    empleado.horasAsignadas > maxHoras * 0.8 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {empleado.horasAsignadas}h / {maxHoras}h
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
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
                    <span className="text-xs text-red-600 font-medium">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar con personal disponible */}
          <div className="lg:col-span-1">
            {renderPersonalDisponible()}
          </div>
          
          {/* Área principal del calendario */}
          <div className="lg:col-span-3">
            {vistaActual === 'collapsible' ? renderVistaColapsable() : 
             vistaActual === 'week' ? renderVistaSemanal() : 
             renderVistaColapsable() // Default fallback
            }
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