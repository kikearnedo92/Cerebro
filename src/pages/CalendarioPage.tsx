import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EQUIPO_COMPLETO, TURNOS, type TipoSemana, type TurnoType, type AsignacionTurno, type Empleado } from "@/types/equipo";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";

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

  // Actualizar horas asignadas cuando cambien las asignaciones
  useEffect(() => {
    const nuevoEquipo = EQUIPO_COMPLETO.map(empleado => {
      const horasAsignadasEnMes = asignaciones
        .filter(a => a.empleadoId === empleado.id)
        .reduce((total, a) => total + a.horas, 0);
      
      return {
        ...empleado,
        horasAsignadas: horasAsignadasEnMes
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
    for (let i = 0; i < primerDiaSemana; i++) {
      dias.push(null);
    }
    for (let dia = 1; dia <= diasEnMes; dia++) {
      dias.push(dia);
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
            Gestión inteligente de horarios 24/7
          </p>
          <div className="flex justify-center gap-3 mt-4">
            <Button 
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              Auto-Asignar
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

      <div className="grid grid-cols-12 gap-6">
        {/* Configuración del mes */}
        <Card className="col-span-12 lg:col-span-3 shadow-sm">
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

            <div className="space-y-2 pt-2">
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

        {/* Calendario principal */}
        <Card className="col-span-12 lg:col-span-9 shadow-sm">
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
                  className={`min-h-[140px] p-2 border-2 rounded ${getColorSemana(dia)}`}
                >
                  {dia && (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-lg">{dia}</span>
                        <Badge variant="outline" className={`text-xs ${getTipoSemanaColor(dia)}`}>
                          {getTipoSemanaTexto(dia)}
                        </Badge>
                      </div>

                      {Object.entries(TURNOS).map(([turnoKey, turnoInfo]) => (
                        <div
                          key={turnoKey}
                          className="mb-1 p-1 border rounded bg-white/70 min-h-[25px]"
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, dia, turnoKey as TurnoType)}
                        >
                          <div className={`text-xs font-medium mb-1 px-1 py-0.5 rounded ${turnoInfo.color}`}>
                            {turnoInfo.nombre}
                          </div>
                          {getEmpleadosPorTurno(dia, turnoKey as TurnoType).map(asignacion => (
                            <Badge
                              key={asignacion.id}
                              variant="secondary"
                              className="text-xs cursor-pointer m-0.5 hover:bg-red-100"
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

        {/* Personal disponible */}
        <Card className="col-span-12 lg:col-span-8 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              👥 Personal Disponible
              <span className="text-sm text-gray-500">Arrastra a los turnos del calendario</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {equipoConHoras.map(empleado => {
                const excedeHoras = (empleado.horasAsignadas || 0) > empleado.horasMax;
                return (
                  <div
                    key={empleado.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, empleado.id)}
                    className={`p-3 border-2 rounded-lg cursor-move hover:shadow-md transition-all ${
                      excedeHoras ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-purple-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getCountryFlag(empleado.pais)}
                      <span className="font-medium text-sm">{empleado.nombre}</span>
                      {excedeHoras && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    </div>
                    <div className="text-xs text-gray-600 mb-1">
                      {empleado.nivel} - {empleado.tipo}
                    </div>
                    <div className={`text-xs font-medium ${excedeHoras ? 'text-red-600' : 'text-gray-700'}`}>
                      {empleado.horasAsignadas || 0} / {empleado.horasMax}h
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Horarios de turnos */}
        <Card className="col-span-12 lg:col-span-4 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">🕐 Horarios de Turnos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(TURNOS).map(([key, turno]) => (
                <div key={key} className={`p-3 rounded-lg ${turno.color}`}>
                  <div className="font-medium text-sm">{turno.nombre}</div>
                  <div className="text-sm opacity-80">{turno.horario} ({turno.horas}h)</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}