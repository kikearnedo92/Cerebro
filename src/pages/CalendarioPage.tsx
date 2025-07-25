import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EQUIPO_COMPLETO, TURNOS, type TipoSemana, type TurnoType, type AsignacionTurno, type Empleado } from "@/types/equipo";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
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

  const autoAsignar = () => {
    const nuevasAsignaciones: AsignacionTurno[] = [];
    const dias = getDiasDelMes();
    
    // Obtener solo los días del mes actual para la semana
    const diasSemana = dias.filter(diaObj => !diaObj.esMesAnterior && !diaObj.esMesSiguiente);
    
    // Si no hay días válidos, usar todos los días visibles
    const diasParaAsignar = diasSemana.length > 0 ? diasSemana : dias;

    diasParaAsignar.forEach(diaObj => {
      const dia = diaObj.dia;
      const fecha = `${anoActual}-${String(mesActual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      const fechaObj = new Date(anoActual, mesActual, dia);
      const diaSemana = fechaObj.getDay(); // 0 = domingo, 1 = lunes, etc.
      const tipoSemana = getTipoSemanaTexto(dia);

      // Verificar límites de horas semanales
      const puedeAsignarHoras = (empleadoId: string, horas: number) => {
        const empleado = equipoConHoras.find(e => e.id === empleadoId);
        if (!empleado) return false;
        
        const limiteHoras = empleado.pais === 'Colombia' ? 44 : 45;
        const horasActuales = empleado.horasAsignadas || 0;
        
        return (horasActuales + horas) <= limiteHoras;
      };

      // Función para asignar turno
      const asignarTurno = (empleadoId: string, turno: TurnoType, suffix = '') => {
        const empleado = equipoConHoras.find(e => e.id === empleadoId);
        if (!empleado) return false;

        // Restricción de domingos para colombianos
        if (diaSemana === 0 && empleado.pais === 'Colombia') {
          return false;
        }

        if (puedeAsignarHoras(empleadoId, TURNOS[turno].horas)) {
          const nuevaAsignacion: AsignacionTurno = {
            id: `${empleadoId}-${fecha}-${turno}${suffix}`,
            empleadoId,
            fecha,
            turno,
            horas: TURNOS[turno].horas
          };
          nuevasAsignaciones.push(nuevaAsignacion);
          
          // Actualizar horas temporalmente para el siguiente cálculo
          const empleadoIndex = equipoConHoras.findIndex(e => e.id === empleadoId);
          if (empleadoIndex !== -1) {
            equipoConHoras[empleadoIndex].horasAsignadas = 
              (equipoConHoras[empleadoIndex].horasAsignadas || 0) + TURNOS[turno].horas;
          }
          return true;
        }
        return false;
      };

      // 1. MADRUGADAS (01:00-07:00): Sugli principal, Diana backup vie-sáb
      if (diaSemana === 5 || diaSemana === 6) { // Viernes y Sábado
        const diana = equipoConHoras.find(e => e.nombre === 'Diana Castillo');
        if (diana) asignarTurno(diana.id, 'madrugada', '-backup');
      } else {
        const sugli = equipoConHoras.find(e => e.nombre === 'Sugli Martinez');
        if (sugli) asignarTurno(sugli.id, 'madrugada');
      }

      // 2. SENIORS NOCTURNOS (18:00-01:00): Solo seniors
      const seniors = [
        equipoConHoras.find(e => e.nombre === 'Helen Rodríguez'),
        equipoConHoras.find(e => e.nombre === 'José Manuel Torres'),
        equipoConHoras.find(e => e.nombre === 'Mayra González')
      ].filter(Boolean);

      const seniorDisponible = seniors.find(senior => 
        senior && puedeAsignarHoras(senior.id, TURNOS.senior_nocturno.horas)
      );
      
      if (seniorDisponible) {
        asignarTurno(seniorDisponible.id, 'senior_nocturno');
      }

      // 3. MAÑANAS (07:00-15:00): Ashley fijo + cobertura según demanda
      const ashley = equipoConHoras.find(e => e.nombre === 'Ashley Jiménez');
      let asignadosAM = 0;

      if (ashley && asignarTurno(ashley.id, 'manana', '-onb')) {
        asignadosAM++;
      }

      // Cobertura según demanda
      let targetAM = 2; // Base
      if (tipoSemana === 'Alta') targetAM = 5;
      else if (tipoSemana === 'Media') targetAM = 3;

      // Lista de empleados para mañana
      const empleadosAM = [
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
      ].filter(Boolean);

      // Filtrar por domingos (solo no colombianos)
      const disponiblesAM = diaSemana === 0 ? 
        empleadosAM.filter(emp => emp && emp.pais !== 'Colombia') : 
        empleadosAM;

      // Asignar empleados hasta cubrir la demanda
      let asignados = 0;
      for (const emp of disponiblesAM) {
        if (asignados >= (targetAM - asignadosAM)) break;
        if (emp && puedeAsignarHoras(emp.id, TURNOS.manana.horas)) {
          if (asignarTurno(emp.id, 'manana', `-atc-${asignados}`)) {
            asignados++;
          }
        }
      }

      // 4. TARDES (15:00-23:00): Fernando fijo + cobertura
      const fernando = equipoConHoras.find(e => e.nombre === 'Fernando Pérez');
      let asignadosPM = 0;

      if (fernando && asignarTurno(fernando.id, 'tarde', '-onb')) {
        asignadosPM++;
      }

      let targetPM = 2; // Base
      if (tipoSemana === 'Alta') targetPM = 4;
      else if (tipoSemana === 'Media') targetPM = 3;

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

      let asignadosTarde = 0;
      for (const emp of disponiblesPM) {
        if (asignadosTarde >= (targetPM - asignadosPM)) break;
        if (emp && puedeAsignarHoras(emp.id, TURNOS.tarde.horas)) {
          if (asignarTurno(emp.id, 'tarde', `-atc-${asignadosTarde}`)) {
            asignadosTarde++;
          }
        }
      }
    });

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
      title: "Auto-asignación completada",
      description: `${asignacionesFiltradas.length} turnos asignados con cobertura 24/7`,
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
        <h1 className="text-3xl font-bold">Calendario de Turnos 24/7</h1>
        <div className="flex gap-2 items-center">
          <Button 
            onClick={autoAsignar}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Auto-asignar Semana
          </Button>
          <Button variant="outline" onClick={() => setMostrarFormularioHorasExtras(true)}>
            Horas Extras
          </Button>
          <Button variant="outline" onClick={limpiarCalendario}>
            Limpiar
          </Button>
        </div>
      </div>

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
        {/* Panel izquierdo - Personal disponible */}
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Disponible</CardTitle>
              <p className="text-sm text-muted-foreground">Horas semanales disponibles</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2 max-h-[600px] overflow-y-auto p-4">
                {equipoConHoras.map((empleado) => {
                  const horasSemanalesUsadas = empleado.horasAsignadas || 0;
                  const limiteHoras = empleado.pais === 'Colombia' ? 44 : 45;
                  const horasDisponibles = Math.max(0, limiteHoras - horasSemanalesUsadas);
                  const utilizacion = (horasSemanalesUsadas / limiteHoras) * 100;
                  
                  return (
                    <div
                      key={empleado.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, empleado.id)}
                      className="p-3 bg-white rounded-lg border border-gray-200 cursor-grab hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{empleado.nombre}</h4>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div>{getCountryFlag(empleado.pais)} {empleado.pais}</div>
                            <div>🏢 {empleado.departamento}</div>
                            <div>⭐ {empleado.especialidad}</div>
                            {empleado.lider && <div>👑 Líder</div>}
                          </div>
                        </div>
                        <div className="text-right text-xs">
                          <div className="font-semibold text-blue-600">
                            {horasDisponibles}h disponibles
                          </div>
                          <div className="text-gray-500">
                            {horasSemanalesUsadas}h de {limiteHoras}h
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div 
                              className={`h-1.5 rounded-full ${
                                utilizacion > 100 ? 'bg-red-500' : 
                                utilizacion > 90 ? 'bg-yellow-500' : 'bg-blue-500'
                              }`}
                              style={{ 
                                width: `${Math.min(100, utilizacion)}%` 
                              }}
                            ></div>
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

                {dias.map((diaObj, index) => (
                  <div
                    key={index}
                    className={`min-h-[160px] p-2 border-2 rounded ${getColorSemana(diaObj.dia)}`}
                  >
                    {diaObj && (
                      <>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-lg">{diaObj.dia}</span>
                          <Badge variant="outline" className={`text-xs ${getTipoSemanaColor(diaObj.dia)}`}>
                            {getTipoSemanaTexto(diaObj.dia)}
                          </Badge>
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
                ))}
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