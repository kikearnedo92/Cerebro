import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EQUIPO_COMPLETO, TURNOS, type TipoSemana, type TurnoType, type AsignacionTurno, type Empleado } from "@/types/equipo";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, ChevronLeft, ChevronRight, BarChart3, TrendingUp } from "lucide-react";
import HorasExtrasForm from "@/components/ui/HorasExtrasForm";

// ================ SISTEMA DE OPTIMIZACIÓN DE TURNOS 24/7 ================

interface DemandAnalysis {
  monthlyPattern: {
    alta: { days: number[]; volumeIncrease: number; description: string };
    media: { days: number[]; volumeIncrease: number; description: string };
    valle: { days: number[]; volumeIncrease: number; description: string };
  };
  hourlyDistribution: {
    AM: number; // 55% del volumen total
    PM: number; // 30% del volumen total
    M: number;  // 15% del volumen total
  };
  capacityGap: number; // +67% sobrecarga actual
}

const REAL_DEMAND_ANALYSIS: DemandAnalysis = {
  monthlyPattern: {
    alta: { 
      days: [1,2,3,4,5,28,29,30,31], 
      volumeIncrease: 125, // +25% sobre promedio
      description: "Fin/Inicio mes - Pagos quincenales, preparación" 
    },
    media: { 
      days: [13,14,15,16,17], 
      volumeIncrease: 110, // +10% sobre promedio
      description: "Quincenas - Pagos quincenales" 
    },
    valle: { 
      days: [6,7,8,9,10,11,12,18,19,20,21,22,23,24,25,26,27], 
      volumeIncrease: 85, // -15% bajo promedio
      description: "Post-pico, estabilización" 
    }
  },
  hourlyDistribution: { AM: 55, PM: 30, M: 15 },
  capacityGap: 67 // Necesitamos 67% más capacidad
};

interface StaffMember {
  id: string;
  name: string;
  country: 'CO' | 'VE' | 'MX' | 'IT';
  area: 'ATC' | 'ONB' | 'HYBRID';
  role: 'SENIOR' | 'REGULAR' | 'SPECIALIZED';
  maxWeeklyHours: 44 | 45 | 46;
  workDaysPerWeek: 6;
  restDaysPerWeek: 1;
  restrictions: string[];
  fixedShifts?: string[];
}

const TEAM_ROSTER: StaffMember[] = [
  // SENIORS - Venezuela (45h/semana)
  { id: 'helen', name: 'Helen', country: 'VE', area: 'ATC', role: 'SENIOR', maxWeeklyHours: 45, workDaysPerWeek: 6, restDaysPerWeek: 1, restrictions: [] },
  { id: 'mayra', name: 'Mayra', country: 'VE', area: 'ATC', role: 'SENIOR', maxWeeklyHours: 45, workDaysPerWeek: 6, restDaysPerWeek: 1, restrictions: [] },
  { id: 'jose', name: 'José Manuel', country: 'VE', area: 'ATC', role: 'SENIOR', maxWeeklyHours: 45, workDaysPerWeek: 6, restDaysPerWeek: 1, restrictions: [] },
  
  // ATC REGULAR - Venezuela (45h/semana)
  { id: 'nerean', name: 'Nerean', country: 'VE', area: 'ATC', role: 'REGULAR', maxWeeklyHours: 45, workDaysPerWeek: 6, restDaysPerWeek: 1, restrictions: [] },
  { id: 'belkis', name: 'Belkis', country: 'VE', area: 'ATC', role: 'REGULAR', maxWeeklyHours: 45, workDaysPerWeek: 6, restDaysPerWeek: 1, restrictions: [] },
  
  // ATC - Colombia (44h/semana)
  { id: 'stella', name: 'Stella', country: 'CO', area: 'ATC', role: 'REGULAR', maxWeeklyHours: 44, workDaysPerWeek: 6, restDaysPerWeek: 1, restrictions: ['avoidSunday'] },
  { id: 'diana', name: 'Diana', country: 'CO', area: 'ATC', role: 'REGULAR', maxWeeklyHours: 44, workDaysPerWeek: 6, restDaysPerWeek: 1, restrictions: ['avoidSunday', 'replacesSugli'] },
  { id: 'juan', name: 'Juan', country: 'CO', area: 'HYBRID', role: 'REGULAR', maxWeeklyHours: 44, workDaysPerWeek: 6, restDaysPerWeek: 1, restrictions: ['avoidSunday'] },
  { id: 'thalia', name: 'Thalia', country: 'CO', area: 'ATC', role: 'REGULAR', maxWeeklyHours: 44, workDaysPerWeek: 6, restDaysPerWeek: 1, restrictions: ['avoidSunday'] },
  { id: 'alejandra', name: 'Alejandra', country: 'CO', area: 'HYBRID', role: 'REGULAR', maxWeeklyHours: 44, workDaysPerWeek: 6, restDaysPerWeek: 1, restrictions: ['avoidSunday'] },
  { id: 'cristian', name: 'Cristian', country: 'CO', area: 'ATC', role: 'REGULAR', maxWeeklyHours: 44, workDaysPerWeek: 6, restDaysPerWeek: 1, restrictions: ['avoidSunday'] },
  
  // ONBOARDING FIJOS - Colombia (44h/semana)
  { id: 'ashley', name: 'Ashley', country: 'CO', area: 'ONB', role: 'SPECIALIZED', maxWeeklyHours: 44, workDaysPerWeek: 6, restDaysPerWeek: 1, restrictions: ['avoidSunday'], fixedShifts: ['AM'] },
  { id: 'fernando', name: 'Fernando', country: 'CO', area: 'ONB', role: 'SPECIALIZED', maxWeeklyHours: 44, workDaysPerWeek: 6, restDaysPerWeek: 1, restrictions: ['avoidSunday'], fixedShifts: ['PM'] },
  
  // OTROS PAÍSES
  { id: 'carmen', name: 'Carmen', country: 'MX', area: 'ATC', role: 'REGULAR', maxWeeklyHours: 44, workDaysPerWeek: 6, restDaysPerWeek: 1, restrictions: ['avoidSunday'] },
  { id: 'sugli', name: 'Sugli', country: 'IT', area: 'ATC', role: 'SPECIALIZED', maxWeeklyHours: 45, workDaysPerWeek: 6, restDaysPerWeek: 1, restrictions: ['onlyMadrugada'], fixedShifts: ['M'] }
];

interface OptimizedStaffing {
  weekType: 'ALTA' | 'MEDIA' | 'VALLE';
  rationale: string;
  shifts: {
    AM: { total: number; atc: number; onb: number; rationale: string };
    PM: { total: number; atc: number; onb: number; rationale: string };
    M: { total: number; atc: number; onb: number; rationale: string };
    SENIOR_NIGHT: { total: number; rotation: number; rationale: string };
  };
  expectedCapacity: number;
  slaTarget: string;
}

const OPTIMIZED_STAFFING: OptimizedStaffing[] = [
  {
    weekType: 'ALTA',
    rationale: 'Fin/inicio mes - Incremento +25% volumen, 55% concentrado en AM',
    shifts: {
      AM: { total: 7, atc: 6, onb: 1, rationale: 'Máxima cobertura para 55% del volumen pico' },
      PM: { total: 5, atc: 4, onb: 1, rationale: 'Cobertura robusta para 30% del volumen' },
      M: { total: 2, atc: 2, onb: 0, rationale: 'Cobertura nocturna para 15% del volumen' },
      SENIOR_NIGHT: { total: 1, rotation: 2, rationale: 'Seniors rotan 2x/semana en 17:00-01:00' }
    },
    expectedCapacity: 800,
    slaTarget: '<8 minutos'
  },
  {
    weekType: 'MEDIA',
    rationale: 'Quincenas - Incremento +10% volumen moderado',
    shifts: {
      AM: { total: 6, atc: 5, onb: 1, rationale: 'Cobertura sólida manteniendo eficiencia' },
      PM: { total: 4, atc: 3, onb: 1, rationale: 'Staffing ajustado a demanda media' },
      M: { total: 2, atc: 2, onb: 0, rationale: 'Backup + cobertura base nocturna' },
      SENIOR_NIGHT: { total: 1, rotation: 2, rationale: 'Rotación normal seniors' }
    },
    expectedCapacity: 650,
    slaTarget: '<12 minutos'
  },
  {
    weekType: 'VALLE',
    rationale: 'Post-pico - Volumen -15% bajo promedio, oportunidad optimización',
    shifts: {
      AM: { total: 5, atc: 4, onb: 1, rationale: 'Staffing mínimo eficiente, resto a proyectos' },
      PM: { total: 3, atc: 2, onb: 1, rationale: 'Mínimo operacional, resto capacitación' },
      M: { total: 1, atc: 1, onb: 0, rationale: 'Cobertura básica nocturna' },
      SENIOR_NIGHT: { total: 1, rotation: 2, rationale: 'Seniors también en proyectos/training' }
    },
    expectedCapacity: 450,
    slaTarget: '<15 minutos'
  }
];

class IntelligentShiftOptimizer {
  getWeekType(dayOfMonth: number): 'ALTA' | 'MEDIA' | 'VALLE' {
    if (REAL_DEMAND_ANALYSIS.monthlyPattern.alta.days.includes(dayOfMonth)) return 'ALTA';
    if (REAL_DEMAND_ANALYSIS.monthlyPattern.media.days.includes(dayOfMonth)) return 'MEDIA';
    return 'VALLE';
  }

  calculateOptimalStaffing(weekType: 'ALTA' | 'MEDIA' | 'VALLE') {
    return OPTIMIZED_STAFFING.find(config => config.weekType === weekType);
  }

  autoAssignWeek(weekStartDay: number, setAsignaciones: Function, equipoConHoras: Empleado[], anoActual: number, mesActual: number): AsignacionTurno[] {
    const weekType = this.getWeekType(weekStartDay);
    const staffingPlan = this.calculateOptimalStaffing(weekType);
    
    console.log(`🎯 Auto-asignando semana ${weekType}:`, staffingPlan?.rationale);
    
    const nuevasAsignaciones: AsignacionTurno[] = [];
    
    // Mapear nombres de equipo completo a IDs del roster
    const findStaffByName = (name: string): StaffMember | undefined => {
      const nameMap: { [key: string]: string } = {
        'Helen Rodríguez': 'helen',
        'Mayra González': 'mayra',
        'José Manuel Torres': 'jose',
        'Nerean Medina': 'nerean',
        'Belkis Ramírez': 'belkis',
        'Stella Morales': 'stella',
        'Diana Castillo': 'diana',
        'Juan Carlos López': 'juan',
        'Thalia Vargas': 'thalia',
        'Alejandra Ruiz': 'alejandra',
        'Cristian Herrera': 'cristian',
        'Ashley Jiménez': 'ashley',
        'Fernando Pérez': 'fernando',
        'Carmen Silva': 'carmen',
        'Sugli Martinez': 'sugli'
      };
      
      const staffId = nameMap[name];
      return TEAM_ROSTER.find(s => s.id === staffId);
    };

    // Asignar toda una semana (lunes a domingo)
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const dia = weekStartDay + dayOffset;
      const fecha = `${anoActual}-${String(mesActual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      const fechaObj = new Date(anoActual, mesActual, dia);
      const diaSemana = fechaObj.getDay(); // 0 = domingo, 1 = lunes, etc.

      // 1. ASIGNACIONES FIJAS
      // Sugli: Madrugada (excepto viernes-sábado cuando Diana reemplaza)
      if (diaSemana === 5) { // Viernes - Diana reemplaza
        const diana = equipoConHoras.find(e => e.nombre === 'Diana Castillo');
        if (diana) {
          nuevasAsignaciones.push({
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
          nuevasAsignaciones.push({
            id: `${sugli.id}-${fecha}-madrugada`,
            empleadoId: sugli.id,
            fecha,
            turno: 'madrugada',
            horas: TURNOS.madrugada.horas
          });
        }
      }

      // Ashley: AM fijo (ONB)
      const ashley = equipoConHoras.find(e => e.nombre === 'Ashley Jiménez');
      if (ashley) {
        nuevasAsignaciones.push({
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
        nuevasAsignaciones.push({
          id: `${fernando.id}-${fecha}-tarde-onb`,
          empleadoId: fernando.id,
          fecha,
          turno: 'tarde',
          horas: TURNOS.tarde.horas
        });
      }

      // 2. SENIORS ROTATION
      const seniors = [
        equipoConHoras.find(e => e.nombre === 'Helen Rodríguez'),
        equipoConHoras.find(e => e.nombre === 'José Manuel Torres'),
        equipoConHoras.find(e => e.nombre === 'Mayra González')
      ].filter(Boolean);

      // Senior nocturno (rotar entre seniors)
      const seniorParaNocturno = seniors[dayOffset % seniors.length];
      if (seniorParaNocturno) {
        nuevasAsignaciones.push({
          id: `${seniorParaNocturno.id}-${fecha}-senior_nocturno`,
          empleadoId: seniorParaNocturno.id,
          fecha,
          turno: 'senior_nocturno',
          horas: TURNOS.senior_nocturno.horas
        });
      }

      // 3. COMPLETAR SEGÚN STAFFING OPTIMIZADO
      if (staffingPlan) {
        // AM: completar hasta el target
        const targetAM = staffingPlan.shifts.AM.total - 1; // -1 por Ashley ya asignada
        const empleadosAM = [
          equipoConHoras.find(e => e.nombre === 'Helen Rodríguez'),
          equipoConHoras.find(e => e.nombre === 'José Manuel Torres'),
          equipoConHoras.find(e => e.nombre === 'Mayra González'),
          equipoConHoras.find(e => e.nombre === 'Stella Morales'),
          equipoConHoras.find(e => e.nombre === 'Juan Carlos López'),
          equipoConHoras.find(e => e.nombre === 'Thalia Vargas'),
          equipoConHoras.find(e => e.nombre === 'Alejandra Ruiz'),
          equipoConHoras.find(e => e.nombre === 'Cristian Herrera'),
          equipoConHoras.find(e => e.nombre === 'Carmen Silva'),
          equipoConHoras.find(e => e.nombre === 'Nerean Medina'),
          equipoConHoras.find(e => e.nombre === 'Belkis Ramírez')
        ].filter(Boolean);

        // Filtrar colombianos en domingo
        const disponiblesAM = diaSemana === 0 ? 
          empleadosAM.filter(emp => emp && emp.pais !== 'Colombia') : 
          empleadosAM;

        for (let i = 0; i < Math.min(targetAM, disponiblesAM.length); i++) {
          const emp = disponiblesAM[i];
          if (emp && !nuevasAsignaciones.some(a => a.empleadoId === emp.id && a.fecha === fecha && a.turno === 'manana')) {
            nuevasAsignaciones.push({
              id: `${emp.id}-${fecha}-manana-atc-${i}`,
              empleadoId: emp.id,
              fecha,
              turno: 'manana',
              horas: TURNOS.manana.horas
            });
          }
        }

        // PM: completar hasta el target  
        const targetPM = staffingPlan.shifts.PM.total - 1; // -1 por Fernando ya asignado
        const empleadosPM = [
          equipoConHoras.find(e => e.nombre === 'Mayra González'),
          equipoConHoras.find(e => e.nombre === 'Stella Morales'),
          equipoConHoras.find(e => e.nombre === 'Juan Carlos López'),
          equipoConHoras.find(e => e.nombre === 'Alejandra Ruiz'),
          equipoConHoras.find(e => e.nombre === 'Carmen Silva'),
          equipoConHoras.find(e => e.nombre === 'Nerean Medina'),
          equipoConHoras.find(e => e.nombre === 'Belkis Ramírez')
        ].filter(Boolean);

        const disponiblesPM = diaSemana === 0 ? 
          empleadosPM.filter(emp => emp && emp.pais !== 'Colombia') : 
          empleadosPM;

        for (let i = 0; i < Math.min(targetPM, disponiblesPM.length); i++) {
          const emp = disponiblesPM[i];
          if (emp && !nuevasAsignaciones.some(a => a.empleadoId === emp.id && a.fecha === fecha)) {
            nuevasAsignaciones.push({
              id: `${emp.id}-${fecha}-tarde-atc-${i}`,
              empleadoId: emp.id,
              fecha,
              turno: 'tarde',
              horas: TURNOS.tarde.horas
            });
          }
        }
      }
    }

    return nuevasAsignaciones;
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

  // Calcular horas semanales - semana va de lunes a domingo
  useEffect(() => {
    const nuevoEquipo = EQUIPO_COMPLETO.map(empleado => {
      // Obtener semana actual (lunes a domingo)
      const hoy = new Date();
      const diaSemana = hoy.getDay();
      const lunes = new Date(hoy);
      lunes.setDate(hoy.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1)); // Si es domingo (0), restar 6 días
      
      const domingo = new Date(lunes);
      domingo.setDate(lunes.getDate() + 6);
      
      const horasSemanales = asignaciones
        .filter(a => {
          if (a.empleadoId !== empleado.id) return false;
          const fechaAsignacion = new Date(a.fecha);
          return fechaAsignacion >= lunes && fechaAsignacion <= domingo;
        })
        .reduce((total, a) => total + a.horas, 0);
      
      return {
        ...empleado,
        horasAsignadas: horasSemanales,
        horasDisponibles: Math.max(0, (empleado.pais === 'Colombia' ? 44 : 45) - horasSemanales)
      };
    });
    setEquipoConHoras(nuevoEquipo);
  }, [asignaciones]);

  const getDiasDelMes = () => {
    const primerDia = new Date(anoActual, mesActual, 1);
    const ultimoDia = new Date(anoActual, mesActual + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const primerDiaSemana = primerDia.getDay();

    const dias = [];
    
    // Agregar días del mes anterior si es necesario para completar la semana
    const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;
    const anoAnterior = mesActual === 0 ? anoActual - 1 : anoActual;
    const ultimoDiaMesAnterior = new Date(anoAnterior, mesAnterior + 1, 0).getDate();
    
    for (let i = primerDiaSemana - 1; i >= 0; i--) {
      dias.push({
        dia: ultimoDiaMesAnterior - i,
        esMesAnterior: true,
        fecha: new Date(anoAnterior, mesAnterior, ultimoDiaMesAnterior - i)
      });
    }
    
    for (let dia = 1; dia <= diasEnMes; dia++) {
      dias.push({
        dia,
        esMesAnterior: false,
        fecha: new Date(anoActual, mesActual, dia)
      });
    }
    
    // Agregar días del mes siguiente para completar la última semana
    const diasRestantes = 42 - dias.length; // 6 semanas * 7 días
    const mesSiguiente = mesActual === 11 ? 0 : mesActual + 1;
    const anoSiguiente = mesActual === 11 ? anoActual + 1 : anoActual;
    
    for (let dia = 1; dia <= diasRestantes; dia++) {
      dias.push({
        dia,
        esMesSiguiente: true,
        fecha: new Date(anoSiguiente, mesSiguiente, dia)
      });
    }
    
    return dias;
  };

  const getColorSemana = (dia: number | null) => {
    if (!dia) return '';
    if (dia >= 1 && dia <= 5) return 'bg-red-50 border-red-200';
    if (dia >= 6 && dia <= 12) return 'bg-yellow-50 border-yellow-200';
    if (dia >= 13 && dia <= 17) return 'bg-green-50 border-green-200';
    if (dia >= 18 && dia <= 27) return 'bg-yellow-50 border-yellow-200';
    if (dia >= 28 && dia <= 31) return 'bg-red-50 border-red-200';
    return 'bg-gray-50 border-gray-200';
  };

  const getTipoSemanaTexto = (dia: number | null) => {
    if (!dia) return '';
    if (dia >= 1 && dia <= 5 || dia >= 28 && dia <= 31) return 'Alta';
    if (dia >= 13 && dia <= 17) return 'Media';
    return 'Valle';
  };

  const getTipoSemanaColor = (dia: number | null) => {
    if (!dia) return '';
    if (dia >= 1 && dia <= 5 || dia >= 28 && dia <= 31) return 'bg-red-100 text-red-800';
    if (dia >= 13 && dia <= 17) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
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
    const empleado = equipoConHoras.find(e => e.id === empleadoId);
    return empleado ? empleado.nombre : 'Desconocido';
  };

  const getCountryFlag = (pais: string) => {
    const flags: { [key: string]: string } = {
      'Colombia': '🇨🇴',
      'Venezuela': '🇻🇪',
      'México': '🇲🇽',
      'Italia': '🇮🇹'
    };
    return flags[pais] || '🌍';
  };

  const handleDragStart = (e: React.DragEvent, empleadoId: string) => {
    setEmpleadoArrastrado(empleadoId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dia: number, turno: TurnoType) => {
    e.preventDefault();
    if (!empleadoArrastrado) return;

    const fecha = `${anoActual}-${String(mesActual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    
    // Verificar si ya existe una asignación para este empleado en esta fecha y turno
    const existeAsignacion = asignaciones.some(a => 
      a.empleadoId === empleadoArrastrado && a.fecha === fecha && a.turno === turno
    );
    
    if (existeAsignacion) {
      toast({
        title: "Asignación duplicada",
        description: "Este empleado ya está asignado a este turno en esta fecha",
        variant: "destructive"
      });
      setEmpleadoArrastrado(null);
      return;
    }

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

  // Instancia del optimizador
  const optimizer = new IntelligentShiftOptimizer();

  const autoAsignar = () => {
    // Obtener el primer día del mes para determinar el tipo de semana
    const primerDia = 1;
    const weekType = optimizer.getWeekType(primerDia);
    const staffingPlan = optimizer.calculateOptimalStaffing(weekType);
    
    console.log(`🎯 Auto-asignando mes ${MESES[mesActual]} como semana ${weekType}`);
    console.log(`📊 Plan de staffing:`, staffingPlan);

    const nuevasAsignaciones = optimizer.autoAssignWeek(
      primerDia, 
      setAsignaciones, 
      equipoConHoras, 
      anoActual, 
      mesActual
    );

    // Filtrar duplicados
    const asignacionesFiltradas = nuevasAsignaciones.filter(nueva => {
      const existe = asignaciones.some(existente => 
        existente.empleadoId === nueva.empleadoId && 
        existente.fecha === nueva.fecha && 
        existente.turno === nueva.turno
      );
      return !existe;
    });

    setAsignaciones(prev => [...prev, ...asignacionesFiltradas]);

    toast({
      title: `Auto-asignación Semana ${weekType}`,
      description: `${asignacionesFiltradas.length} turnos optimizados. Target: ${staffingPlan?.expectedCapacity} casos/día`,
    });
  };

  const limpiarCalendario = () => {
    setAsignaciones([]);
    // Resetear horas del equipo
    setEquipoConHoras([...EQUIPO_COMPLETO]);
    toast({
      title: "Calendario limpiado",
      description: "Todas las asignaciones han sido eliminadas",
    });
  };

  const dias = getDiasDelMes();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header con controles */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">🎯 Optimización de Turnos 24/7</h1>
        <div className="flex gap-2 items-center">
          <Button 
            onClick={autoAsignar}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Auto-Asignar Semana Óptima
          </Button>
          <Button variant="outline" onClick={() => setMostrarFormularioHorasExtras(true)}>
            Horas Extras
          </Button>
          <Button variant="outline" onClick={limpiarCalendario}>
            Limpiar
          </Button>
        </div>
      </div>

      {/* Métricas en tiempo real */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-600">
                {equipoConHoras.reduce((total, emp) => total + (emp.horasAsignadas || 0), 0)}h
              </div>
              <div className="text-xs text-gray-600">Horas Asignadas</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">
                {equipoConHoras.filter(emp => (emp.horasAsignadas || 0) <= (emp.pais === 'Colombia' ? 44 : 45)).length}
              </div>
              <div className="text-xs text-gray-600">Dentro del Límite</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-600">
                {optimizer.getWeekType(1)}
              </div>
              <div className="text-xs text-gray-600">Tipo de Semana</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-orange-600">
                {optimizer.calculateOptimalStaffing(optimizer.getWeekType(1))?.expectedCapacity || 0}
              </div>
              <div className="text-xs text-gray-600">Capacidad Target</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selector de fecha */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (mesActual === 0) {
                    setMesActual(11);
                    setAnoActual(prev => prev - 1);
                  } else {
                    setMesActual(prev => prev - 1);
                  }
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold min-w-[200px] text-center">
                {MESES[mesActual]} {anoActual}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (mesActual === 11) {
                    setMesActual(0);
                    setAnoActual(prev => prev + 1);
                  } else {
                    setMesActual(prev => prev + 1);
                  }
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Select value={anoActual.toString()} onValueChange={(value) => setAnoActual(parseInt(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leyenda de horarios */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 justify-center">
            {Object.entries(TURNOS).map(([key, turno]) => (
              <div key={key} className={`px-3 py-1 rounded-md text-sm ${turno.color}`}>
                <span className="font-medium">{turno.nombre}</span>
                <span className="ml-2 opacity-80">{turno.horario}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-12 gap-6">
        {/* Panel izquierdo - Personal disponible con métricas */}
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Personal Disponible
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Control semanal de horas y capacidad 24/7
              </p>
            </CardHeader>
            <CardContent className="p-0">
              {/* Resumen de staffing por área */}
              <div className="p-4 bg-gray-50 border-b">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-blue-600">
                      {equipoConHoras.filter(e => e.departamento === 'ATC').length}
                    </div>
                    <div className="text-xs text-gray-600">ATC Disponibles</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-green-600">
                      {equipoConHoras.filter(e => e.departamento === 'Onboarding').length}
                    </div>
                    <div className="text-xs text-gray-600">ONB Disponibles</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 max-h-[600px] overflow-y-auto p-4">
                {equipoConHoras
                  .sort((a, b) => {
                    // Ordenar por: Seniors primero, luego por horas disponibles
                    if (a.especialidad === 'Senior' && b.especialidad !== 'Senior') return -1;
                    if (b.especialidad === 'Senior' && a.especialidad !== 'Senior') return 1;
                    const horasA = a.horasAsignadas || 0;
                    const horasB = b.horasAsignadas || 0;
                    return horasA - horasB;
                  })
                  .map((empleado) => {
                    const horasSemanalesUsadas = empleado.horasAsignadas || 0;
                    const limiteHoras = empleado.pais === 'Colombia' ? 44 : 45;
                    const horasDisponibles = Math.max(0, limiteHoras - horasSemanalesUsadas);
                    const utilizacion = (horasSemanalesUsadas / limiteHoras) * 100;
                    
                    // Encontrar perfil en TEAM_ROSTER para mostrar restricciones
                    const staffProfile = TEAM_ROSTER.find(s => 
                      s.name === empleado.nombre.split(' ')[0] ||
                      empleado.nombre.includes(s.name)
                    );
                    
                    return (
                      <div
                        key={empleado.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, empleado.id)}
                        className={`p-3 rounded-lg border cursor-grab hover:shadow-md transition-all ${
                          empleado.especialidad === 'Senior' 
                            ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200' 
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm flex items-center gap-1">
                              {empleado.nombre}
                              {empleado.especialidad === 'Senior' && <span className="text-xs">👑</span>}
                            </h4>
                            <div className="text-xs text-gray-600 space-y-1">
                              <div className="flex items-center gap-1">
                                {getCountryFlag(empleado.pais)} {empleado.pais}
                                <Badge variant="outline" className="text-xs ml-1">
                                  {empleado.departamento}
                                </Badge>
                              </div>
                              <div>⭐ {empleado.especialidad}</div>
                              
                              {/* Mostrar restricciones especiales */}
                              {staffProfile?.fixedShifts && (
                                <div className="text-xs text-blue-600">
                                  🔒 Fijo: {staffProfile.fixedShifts.join(', ')}
                                </div>
                              )}
                              
                              {staffProfile?.restrictions.includes('onlyMadrugada') && (
                                <div className="text-xs text-purple-600">🌙 Solo Madrugada</div>
                              )}
                              
                              {staffProfile?.restrictions.includes('replacesSugli') && (
                                <div className="text-xs text-orange-600">🔄 Backup Sugli</div>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-xs">
                            <div className={`font-semibold ${
                              horasDisponibles > 30 ? 'text-green-600' :
                              horasDisponibles > 15 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {horasDisponibles}h disponibles
                            </div>
                            <div className="text-gray-500">
                              {horasSemanalesUsadas}h / {limiteHoras}h
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className={`h-2 rounded-full transition-all ${
                                  utilizacion > 100 ? 'bg-red-500' : 
                                  utilizacion > 90 ? 'bg-yellow-500' : 
                                  utilizacion > 70 ? 'bg-blue-500' : 'bg-green-500'
                                }`}
                                style={{ 
                                  width: `${Math.min(100, utilizacion)}%` 
                                }}
                              ></div>
                            </div>
                            
                            {/* Indicador de eficiencia */}
                            <div className="mt-1">
                              {utilizacion >= 80 && utilizacion <= 100 && (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                  🎯 Óptimo
                                </Badge>
                              )}
                              {utilizacion > 100 && (
                                <Badge variant="destructive" className="text-xs">
                                  ⚠️ Exceso
                                </Badge>
                              )}
                              {utilizacion < 50 && (
                                <Badge variant="outline" className="text-xs text-orange-600">
                                  💡 Subutilizado
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel principal - Calendario */}
        <div className="col-span-9">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                📅 {MESES[mesActual]} {anoActual}
                <div className="ml-auto flex gap-2 text-sm">
                  <Badge variant="destructive">🔴 Alta (1-5, 28-31)</Badge>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">🟡 Media (13-17)</Badge>
                  <Badge variant="default" className="bg-green-100 text-green-800">🟢 Valle (resto)</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {DIAS_SEMANA.map(dia => (
                  <div key={dia} className="p-3 text-center font-semibold text-sm bg-gray-100 rounded border">
                    {dia}
                  </div>
                ))}

                {dias.map((diaObj, index) => {
                  const weekType = optimizer.getWeekType(diaObj.dia);
                  const staffingPlan = optimizer.calculateOptimalStaffing(weekType);
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-[180px] p-2 border-2 rounded transition-all hover:shadow-lg ${
                        diaObj.esMesAnterior || diaObj.esMesSiguiente ? 
                        'bg-gray-50 border-gray-200 opacity-75' : 
                        getColorSemana(diaObj.dia)
                      }`}
                    >
                      {diaObj && (
                        <>
                          <div className="flex justify-between items-center mb-2">
                            <span className={`font-bold text-lg ${
                              diaObj.esMesAnterior || diaObj.esMesSiguiente ? 'text-gray-400' : ''
                            }`}>
                              {diaObj.dia}
                            </span>
                            <div className="flex flex-col gap-1">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getTipoSemanaColor(diaObj.dia)}`}
                              >
                                {getTipoSemanaTexto(diaObj.dia)}
                              </Badge>
                              {staffingPlan && (
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs bg-blue-100 text-blue-800"
                                  title={staffingPlan.rationale}
                                >
                                  {staffingPlan.expectedCapacity} casos
                                </Badge>
                              )}
                            </div>
                          </div>

                          {Object.entries(TURNOS).map(([turnoKey, turnoInfo]) => {
                            const empleadosTurno = getEmpleadosPorTurno(diaObj.dia, turnoKey as TurnoType);
                            const sinCobertura = empleadosTurno.length === 0;
                            const atcCount = empleadosTurno.filter(a => {
                              const emp = equipoConHoras.find(e => e.id === a.empleadoId);
                              return emp?.departamento === 'ATC';
                            }).length;
                            const onbCount = empleadosTurno.filter(a => {
                              const emp = equipoConHoras.find(e => e.id === a.empleadoId);
                              return emp?.departamento === 'Onboarding';
                            }).length;

                            return (
                              <div
                                key={turnoKey}
                                className={`mb-1 p-1 border rounded min-h-[35px] ${
                                  sinCobertura ? 'bg-red-100 border-red-300' : 'bg-white/70'
                                }`}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, diaObj.dia, turnoKey as TurnoType)}
                              >
                                <div className={`text-xs font-medium mb-1 px-1 py-0.5 rounded flex justify-between items-center ${turnoInfo.color}`}>
                                  <span>{turnoInfo.nombre}</span>
                                  <div className="flex gap-1">
                                    {atcCount > 0 && <Badge variant="secondary" className="text-xs px-1">ATC: {atcCount}</Badge>}
                                    {onbCount > 0 && <Badge variant="outline" className="text-xs px-1">ONB: {onbCount}</Badge>}
                                  </div>
                                </div>
                                {sinCobertura && (
                                  <div className="text-xs text-red-600 font-medium px-1">Sin cobertura</div>
                                )}
                                <div className="flex flex-wrap gap-1">
                                  {empleadosTurno.map(asignacion => {
                                    const empleado = equipoConHoras.find(e => e.id === asignacion.empleadoId);
                                    return (
                                      <Badge
                                        key={asignacion.id}
                                        variant={empleado?.departamento === 'ATC' ? 'secondary' : 'outline'}
                                        className="text-xs cursor-pointer hover:bg-red-100"
                                        onClick={() => removerAsignacion(asignacion.id)}
                                        title={`${empleado?.departamento} - Click para remover`}
                                      >
                                        {getEmpleadoNombre(asignacion.empleadoId)}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </>
                      )}
                     </div>
                   );
                 })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de horas extras */}
      {mostrarFormularioHorasExtras && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Solicitud de Horas Extras</h2>
              <Button variant="outline" onClick={() => setMostrarFormularioHorasExtras(false)}>
                ✕
              </Button>
            </div>
            <HorasExtrasForm 
              empleados={equipoConHoras.map(e => ({
                id: e.id,
                nombre: e.nombre,
                pais: e.pais,
                departamento: e.departamento
              }))}
              onSolicitudCreada={(solicitud) => {
                setSolicitudesHorasExtras(prev => [...prev, solicitud]);
                setMostrarFormularioHorasExtras(false);
                toast({
                  title: "Solicitud creada",
                  description: "La solicitud de horas extras ha sido enviada",
                });
              }}
            />
          </div>
        </div>
      )}

      {/* Lista de solicitudes pendientes */}
      {solicitudesHorasExtras.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📋 Solicitudes de Horas Extras Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {solicitudesHorasExtras.map((solicitud, index) => (
                <div key={index} className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium">{solicitud.empleadoNombre}</span>
                      <Badge className="ml-2" variant="outline">{solicitud.estado}</Badge>
                    </div>
                    <span className="text-sm text-gray-500">{solicitud.fecha}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>Horario:</strong> {solicitud.horasInicio} - {solicitud.horasFin}</p>
                    <p><strong>Tipo:</strong> {solicitud.tipoHoraExtra}</p>
                    {solicitud.recargo && <p><strong>Recargo:</strong> {solicitud.recargo}</p>}
                    <p><strong>Justificación:</strong> {solicitud.justificacion}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}