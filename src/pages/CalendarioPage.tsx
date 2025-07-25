import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EQUIPO_COMPLETO, TURNOS, type TipoSemana, type TurnoType, type AsignacionTurno, type Empleado } from "@/types/equipo";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, Clock, Calendar, Users, Settings } from "lucide-react";
import HorasExtrasForm from "@/components/ui/HorasExtrasForm";

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
  const [editandoEmpleado, setEditandoEmpleado] = useState<string | null>(null);

  // Actualizar horas asignadas cuando cambien las asignaciones - SEMANAL
  useEffect(() => {
    const nuevoEquipo = EQUIPO_COMPLETO.map(empleado => {
      // Calcular horas semanales del empleado
      const fechaActual = new Date();
      const inicioSemana = new Date(fechaActual);
      inicioSemana.setDate(fechaActual.getDate() - fechaActual.getDay());
      
      const horasSemanales = asignaciones
        .filter(a => {
          if (a.empleadoId !== empleado.id) return false;
          const fechaAsignacion = new Date(a.fecha);
          const inicioSemanaAsignacion = new Date(fechaAsignacion);
          inicioSemanaAsignacion.setDate(fechaAsignacion.getDate() - fechaAsignacion.getDay());
          return inicioSemanaAsignacion.getTime() === inicioSemana.getTime();
        })
        .reduce((total, a) => total + a.horas, 0);
      
      return {
        ...empleado,
        horasAsignadas: horasSemanales
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
        esMesAnterior: false,
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

  const handleAutoAsignar = () => {
    const nuevasAsignaciones: AsignacionTurno[] = [];
    const diasMes = getDiasDelMes().filter(dia => dia !== null) as number[];
    
    // Crear contadores de horas mensuales por empleado
    const horasMensualesPorEmpleado: { [key: string]: number } = {};
    equipoConHoras.forEach(emp => {
      horasMensualesPorEmpleado[emp.id] = emp.horasAsignadas || 0;
    });

    // Contadores semanales para seniors (máximo 2 turnos nocturnos por semana)
    let contadorSeniorsSemanales: { [key: string]: { [semana: number]: number } } = {};
    
    diasMes.forEach(dia => {
      const fecha = `${anoActual}-${String(mesActual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      const fechaObj = new Date(anoActual, mesActual, dia);
      const esDomingo = fechaObj.getDay() === 0;
      const esSabado = fechaObj.getDay() === 6;
      const esViernes = fechaObj.getDay() === 5;
      const semanaDelMes = Math.ceil(dia / 7);
      const tipoSemana = getTipoSemanaTexto(dia);

      // Función helper para verificar límites de horas
      const puedeAsignarHoras = (empleadoId: string, horas: number) => {
        const empleado = equipoConHoras.find(e => e.id === empleadoId);
        if (!empleado) return false;
        
        let limiteHoras = 45; // default para Venezuela
        if (empleado.pais === 'Colombia') limiteHoras = 44;
        if (empleado.pais === 'México') limiteHoras = 44;
        
        // Calcular horas semanales actuales para este empleado
        const fechaActual = new Date(anoActual, mesActual, dia);
        const inicioSemana = new Date(fechaActual);
        inicioSemana.setDate(fechaActual.getDate() - fechaActual.getDay());
        const finSemana = new Date(inicioSemana);
        finSemana.setDate(inicioSemana.getDate() + 6);
        
        const horasSemanalesActuales = nuevasAsignaciones
          .filter(a => {
            if (a.empleadoId !== empleadoId) return false;
            const fechaAsignacion = new Date(a.fecha);
            return fechaAsignacion >= inicioSemana && fechaAsignacion <= finSemana;
          })
          .reduce((sum, a) => sum + a.horas, 0);
        
        return (horasSemanalesActuales + horas) <= limiteHoras;
      };

      // Función helper para asignar y actualizar contador
      const asignarTurno = (empleadoId: string, turno: TurnoType, suffix = '') => {
        if (puedeAsignarHoras(empleadoId, TURNOS[turno].horas)) {
          const empleado = equipoConHoras.find(e => e.id === empleadoId);
          
          // Verificar restricción de domingos para colombianos
          if (esDomingo && empleado?.pais === 'Colombia') {
            return false;
          }

          nuevasAsignaciones.push({
            id: `${empleadoId}-${fecha}-${turno}${suffix}`,
            empleadoId,
            fecha,
            turno,
            horas: TURNOS[turno].horas
          });
          
          horasMensualesPorEmpleado[empleadoId] = (horasMensualesPorEmpleado[empleadoId] || 0) + TURNOS[turno].horas;
          return true;
        }
        return false;
      };

      // 1. MADRUGADAS (01:00-07:00): Sugli principal, Diana backup vie-sáb
      const sugli = equipoConHoras.find(e => e.nombre === 'Sugli Martinez');
      const diana = equipoConHoras.find(e => e.nombre === 'Diana Castillo');
      
      if (esViernes || esSabado) {
        // Diana reemplaza a Sugli viernes-sábado (descanso de Sugli)
        if (diana) asignarTurno(diana.id, 'madrugada', '-backup');
      } else {
        // Sugli trabaja resto de días
        if (sugli) asignarTurno(sugli.id, 'madrugada');
      }

      // 2. SENIORS NOCTURNOS (18:00-01:00): Helen, José Manuel, Mayra - 2 días/semana cada uno
      const seniors = [
        equipoConHoras.find(e => e.nombre === 'Helen Rodríguez'),
        equipoConHoras.find(e => e.nombre === 'José Manuel Torres'),
        equipoConHoras.find(e => e.nombre === 'Mayra González')
      ].filter(Boolean);
      
      // Rotar seniors para turnos nocturnos (máximo 2 por semana)
      const seniorDisponible = seniors.find(senior => {
        if (!senior) return false;
        const contadorSemanal = contadorSeniorsSemanales[senior.id]?.[semanaDelMes] || 0;
        return contadorSemanal < 2 && puedeAsignarHoras(senior.id, TURNOS.senior_nocturno.horas);
      });
      
      if (seniorDisponible) {
        if (!contadorSeniorsSemanales[seniorDisponible.id]) {
          contadorSeniorsSemanales[seniorDisponible.id] = {};
        }
        if (asignarTurno(seniorDisponible.id, 'senior_nocturno')) {
          contadorSeniorsSemanales[seniorDisponible.id][semanaDelMes] = 
            (contadorSeniorsSemanales[seniorDisponible.id][semanaDelMes] || 0) + 1;
        }
      }

      // 3. MAÑANAS (07:00-15:00): Máxima cobertura ATC + ONB
      const ashley = equipoConHoras.find(e => e.nombre === 'Ashley Jiménez');
      let asignadosAM = 0;

      // Ashley fijo AM (Onboarding)
      if (ashley && asignarTurno(ashley.id, 'manana', '-onb-fijo')) {
        asignadosAM++;
      }

      // Estrategia de cobertura según demanda y día
      let targetAM = 1; // Mínimo base
      if (tipoSemana === 'Alta') targetAM = 4; // Demanda alta
      else if (tipoSemana === 'Media') targetAM = 3; // Demanda media
      else targetAM = 2; // Valle

      if (esDomingo) {
        // Domingos: Solo venezolanos/mexicanos
        const noColombianosAM = [
          equipoConHoras.find(e => e.nombre === 'Helen Rodríguez'),
          equipoConHoras.find(e => e.nombre === 'José Manuel Torres'),
          equipoConHoras.find(e => e.nombre === 'Carmen Silva'),
          equipoConHoras.find(e => e.nombre === 'Nerean Medina'),
          equipoConHoras.find(e => e.nombre === 'Belkis Ramírez')
        ].filter(Boolean).filter(e => e && puedeAsignarHoras(e.id, TURNOS.manana.horas));

        noColombianosAM.slice(0, Math.min(targetAM - asignadosAM, noColombianosAM.length)).forEach((emp, idx) => {
          if (emp && asignarTurno(emp.id, 'manana', `-domingo-${idx}`)) {
            asignadosAM++;
          }
        });
      } else {
        // Días normales: Usar todos los disponibles
        const disponiblesAM = [
          equipoConHoras.find(e => e.nombre === 'Helen Rodríguez'),
          equipoConHoras.find(e => e.nombre === 'José Manuel Torres'),
          equipoConHoras.find(e => e.nombre === 'Stella Morales'),
          equipoConHoras.find(e => e.nombre === 'Juan Carlos López'),
          equipoConHoras.find(e => e.nombre === 'Thalia Vargas'),
          equipoConHoras.find(e => e.nombre === 'Alejandra Ruiz'),
          equipoConHoras.find(e => e.nombre === 'Cristian Herrera'),
          equipoConHoras.find(e => e.nombre === 'Carmen Silva'),
          equipoConHoras.find(e => e.nombre === 'Nerean Medina'),
          equipoConHoras.find(e => e.nombre === 'Belkis Ramírez')
        ].filter(Boolean).filter(e => e && puedeAsignarHoras(e.id, TURNOS.manana.horas));

        // Priorizar según utilización para equilibrar horas
        disponiblesAM.sort((a, b) => {
          const utilizacionA = (horasMensualesPorEmpleado[a!.id] || 0) / a!.horasMax;
          const utilizacionB = (horasMensualesPorEmpleado[b!.id] || 0) / b!.horasMax;
          return utilizacionA - utilizacionB; // Menor utilización primero
        });

        disponiblesAM.slice(0, Math.min(targetAM - asignadosAM, disponiblesAM.length)).forEach((emp, idx) => {
          if (emp && asignarTurno(emp.id, 'manana', `-atc-${idx}`)) {
            asignadosAM++;
          }
        });
      }

      // 4. TARDES (15:00-23:00): Máxima cobertura
      const fernando = equipoConHoras.find(e => e.nombre === 'Fernando Pérez');
      let asignadosPM = 0;

      // Fernando fijo PM (Onboarding)
      if (fernando && asignarTurno(fernando.id, 'tarde', '-onb-fijo')) {
        asignadosPM++;
      }

      let targetPM = 1; // Mínimo base
      if (tipoSemana === 'Alta') targetPM = 3;
      else if (tipoSemana === 'Media') targetPM = 2;
      else targetPM = 2;

      if (esDomingo) {
        // Domingos: Solo venezolanos/mexicanos
        const noColombianoPM = [
          equipoConHoras.find(e => e.nombre === 'Mayra González'),
          equipoConHoras.find(e => e.nombre === 'Nerean Medina'),
          equipoConHoras.find(e => e.nombre === 'Belkis Ramírez')
        ].filter(Boolean).filter(e => e && puedeAsignarHoras(e.id, TURNOS.tarde.horas));

        noColombianoPM.slice(0, Math.min(targetPM - asignadosPM, noColombianoPM.length)).forEach((emp, idx) => {
          if (emp && asignarTurno(emp.id, 'tarde', `-domingo-${idx}`)) {
            asignadosPM++;
          }
        });
      } else {
        // Días normales + fines de semana híbridos
        const disponiblesPM = [
          equipoConHoras.find(e => e.nombre === 'Mayra González'),
          ...(esSabado ? [
            equipoConHoras.find(e => e.nombre === 'Juan Carlos López'),
            equipoConHoras.find(e => e.nombre === 'Alejandra Ruiz'),
            equipoConHoras.find(e => e.nombre === 'Carmen Silva')
          ] : []),
          equipoConHoras.find(e => e.nombre === 'Stella Morales'),
          equipoConHoras.find(e => e.nombre === 'Nerean Medina')
        ].filter(Boolean).filter(e => e && puedeAsignarHoras(e.id, TURNOS.tarde.horas));

        // Priorizar según utilización
        disponiblesPM.sort((a, b) => {
          const utilizacionA = (horasMensualesPorEmpleado[a!.id] || 0) / a!.horasMax;
          const utilizacionB = (horasMensualesPorEmpleado[b!.id] || 0) / b!.horasMax;
          return utilizacionA - utilizacionB;
        });

        disponiblesPM.slice(0, Math.min(targetPM - asignadosPM, disponiblesPM.length)).forEach((emp, idx) => {
          if (emp && asignarTurno(emp.id, 'tarde', `-${esSabado ? 'hibrido' : 'atc'}-${idx}`)) {
            asignadosPM++;
          }
        });
      }

      // 5. Rotación adicional para seniors en AM/PM (deben pasar por todos los turnos)
      if (dia % 4 === 0) { // Cada 4 días
        const seniorRotacion = seniors.find(senior => 
          senior && puedeAsignarHoras(senior.id, TURNOS.manana.horas)
        );
        if (seniorRotacion) {
          asignarTurno(seniorRotacion.id, 'manana', '-senior-rotacion');
        }
      }

      if (dia % 5 === 0) { // Cada 5 días
        const seniorRotacion = seniors.find(senior => 
          senior && puedeAsignarHoras(senior.id, TURNOS.tarde.horas)
        );
        if (seniorRotacion) {
          asignarTurno(seniorRotacion.id, 'tarde', '-senior-rotacion');
        }
      }
    });

    // Eliminar duplicados y conflictos existentes
    const asignacionesFiltradas = nuevasAsignaciones.filter(nueva => {
      const existe = asignaciones.some(existente => 
        existente.empleadoId === nueva.empleadoId && 
        existente.fecha === nueva.fecha && 
        existente.turno === nueva.turno
      );
      return !existe;
    });

    setAsignaciones(prev => [...prev, ...asignacionesFiltradas]);

    // Calcular estadísticas
    const totalAsignadas = asignacionesFiltradas.length;
    const horasTotales = asignacionesFiltradas.reduce((sum, a) => sum + a.horas, 0);
    const empleadosBeneficiados = new Set(asignacionesFiltradas.map(a => a.empleadoId)).size;

    toast({
      title: "Auto-asignación inteligente completada",
      description: `✅ ${totalAsignadas} turnos asignados (${horasTotales}h) a ${empleadosBeneficiados} empleados. Cobertura 24/7 optimizada con límites respetados.`,
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
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <Card className="shadow-sm">
        <CardHeader className="text-center bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-3">
            📅 Calendario Customer Success
          </CardTitle>
          <p className="text-purple-100">
            Gestión inteligente de horarios semanales 24/7
          </p>
          <div className="flex justify-center gap-3 mt-4">
            <Button 
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              onClick={handleAutoAsignar}
            >
              Auto-Asignar Semanal
            </Button>
            <Button 
              variant="outline"
              onClick={limpiarCalendario}
              className="bg-transparent hover:bg-white/20 text-white border-white/30"
            >
              Limpiar
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="calendario" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="configuracion" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuración
          </TabsTrigger>
          <TabsTrigger value="calendario" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendario
          </TabsTrigger>
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="horas-extras" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Horas Extras
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configuracion">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">⚙️ Configuración del Mes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Mes:</label>
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
                  <label className="text-sm font-medium mb-2 block">Año:</label>
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

                <div className="space-y-2 pt-4">
                  <Badge variant="destructive" className="w-full justify-center">
                    🔴 Alta (1-5, 28-31)
                  </Badge>
                  <Badge variant="secondary" className="w-full justify-center bg-yellow-100 text-yellow-800">
                    🟡 Media (13-17)
                  </Badge>
                  <Badge variant="default" className="w-full justify-center bg-green-100 text-green-800">
                    🟢 Valle (resto)
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">🕐 Horarios de Turnos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(TURNOS).map(([key, turno]) => (
                  <div key={key} className={`p-3 rounded-md ${turno.color}`}>
                    <div className="font-medium text-sm">{turno.nombre}</div>
                    <div className="text-sm opacity-80">{turno.horario} ({turno.horas}h)</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendario">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">{MESES[mesActual]} {anoActual}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {DIAS_SEMANA.map(dia => (
                  <div key={dia} className="p-3 text-center font-semibold text-sm bg-gray-100 rounded border">
                    {dia}
                  </div>
                ))}

                {dias.map((dia, index) => (
                  <div
                    key={index}
                    className={`min-h-[160px] p-2 border-2 rounded ${getColorSemana(dia)}`}
                  >
                    {dia && (
                      <>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-lg">{dia}</span>
                          <Badge variant="outline" className={`text-xs ${getTipoSemanaColor(dia)}`}>
                            {getTipoSemanaTexto(dia)}
                          </Badge>
                        </div>

                        {Object.entries(TURNOS).map(([turnoKey, turnoInfo]) => {
                          const empleadosTurno = getEmpleadosPorTurno(dia, turnoKey as TurnoType);
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
                              onDrop={(e) => handleDrop(e, dia, turnoKey as TurnoType)}
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
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personal">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                👥 Personal Disponible
                <span className="text-sm text-gray-500">Arrastra a los turnos del calendario</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {equipoConHoras.map(empleado => {
                  const excedeHoras = (empleado.horasAsignadas || 0) > empleado.horasMax;
                  const utilizacion = ((empleado.horasAsignadas || 0) / empleado.horasMax) * 100;
                  return (
                    <div
                      key={empleado.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, empleado.id)}
                      className={`p-3 border-2 rounded-lg cursor-move hover:shadow-md transition-all ${
                        excedeHoras ? 'border-red-300 bg-red-50' : 
                        utilizacion < 50 ? 'border-yellow-300 bg-yellow-50' :
                        'border-gray-200 hover:border-purple-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {getCountryFlag(empleado.pais)}
                        <span className="font-medium text-sm">{empleado.nombre}</span>
                        {excedeHoras && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      </div>
                      <div className="text-xs text-gray-600 mb-1">
                        {empleado.departamento} - {empleado.tipo}
                      </div>
                      <div className={`text-xs font-medium ${
                        excedeHoras ? 'text-red-600' : 
                        utilizacion < 50 ? 'text-yellow-600' :
                        'text-gray-700'
                      }`}>
                        {empleado.horasAsignadas || 0} / {empleado.horasMax}h ({Math.round(utilizacion)}%)
                      </div>
                      {utilizacion < 50 && (
                        <div className="text-xs text-yellow-600">⚠️ Subutilizado</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="horas-extras">
          <div className="space-y-6">
            <HorasExtrasForm 
              empleados={equipoConHoras.map(e => ({
                id: e.id,
                nombre: e.nombre,
                pais: e.pais,
                departamento: e.departamento
              }))}
              onSolicitudCreada={(solicitud) => {
                setSolicitudesHorasExtras(prev => [...prev, solicitud]);
              }}
            />
            
            {solicitudesHorasExtras.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">📋 Solicitudes Pendientes</CardTitle>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}