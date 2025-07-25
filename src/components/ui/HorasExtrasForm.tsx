import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { CalendarDays, Clock, DollarSign } from "lucide-react";

interface SolicitudHorasExtras {
  empleadoId: string;
  empleadoNombre: string;
  fecha: string;
  horasInicio: string;
  horasFin: string;
  tipoHoraExtra: string;
  justificacion: string;
  recargo?: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  fechaSolicitud: string;
}

interface HorasExtrasFormProps {
  empleados: Array<{
    id: string;
    nombre: string;
    pais: string;
    departamento: string;
  }>;
  onSolicitudCreada: (solicitud: SolicitudHorasExtras) => void;
}

const TIPOS_HORA_EXTRA = [
  'DIURNA',
  'NOCTURNA', 
  'NOCTURNA DOMINICAL',
  'NOCTURNA FESTIVO',
  'DIURNO FESTIVO DOMINICAL',
  'NOCTURNA DOMINICAL FESTIVO',
  'RECARGO FESTIVO',
  'DIURNA FESTIVO',
  'DIURNA DOMINICAL',
  'RECARGO NOCTURNO'
];

const RECARGOS_COLOMBIA = [
  'NOCTURNA',
  'NOCTURNA DOMINICAL', 
  'NOCTURNA FESTIVO',
  'DIURNO FESTIVO DOMINICAL',
  'NOCTURNA DOMINICAL FESTIVO',
  'RECARGO FESTIVO',
  'DIURNA FESTIVO',
  'DIURNA DOMINICAL',
  'RECARGO NOCTURNO'
];

export default function HorasExtrasForm({ empleados, onSolicitudCreada }: HorasExtrasFormProps) {
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
  const [fecha, setFecha] = useState('');
  const [horasInicio, setHorasInicio] = useState('');
  const [horasFin, setHorasFin] = useState('');
  const [tipoHoraExtra, setTipoHoraExtra] = useState('');
  const [recargo, setRecargo] = useState('');
  const [justificacion, setJustificacion] = useState('');

  const empleado = empleados.find(e => e.id === empleadoSeleccionado);
  const esColombiano = empleado?.pais === 'Colombia';

  const calcularHoras = () => {
    if (!horasInicio || !horasFin) return 0;
    const inicio = new Date(`2000-01-01T${horasInicio}`);
    const fin = new Date(`2000-01-01T${horasFin}`);
    if (fin < inicio) {
      fin.setDate(fin.getDate() + 1); // Turno cruza medianoche
    }
    return (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!empleadoSeleccionado || !fecha || !horasInicio || !horasFin || !tipoHoraExtra || !justificacion) {
      toast({
        title: "Campos requeridos",
        description: "Por favor complete todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    const horasCalculadas = calcularHoras();
    if (horasCalculadas <= 0 || horasCalculadas > 12) {
      toast({
        title: "Horas inválidas", 
        description: "Las horas deben ser válidas y no exceder 12 horas",
        variant: "destructive"
      });
      return;
    }

    const solicitud: SolicitudHorasExtras = {
      empleadoId: empleadoSeleccionado,
      empleadoNombre: empleado?.nombre || '',
      fecha,
      horasInicio,
      horasFin,
      tipoHoraExtra,
      justificacion,
      recargo: esColombiano ? recargo : undefined,
      estado: 'pendiente',
      fechaSolicitud: new Date().toISOString()
    };

    onSolicitudCreada(solicitud);
    
    // Limpiar formulario
    setEmpleadoSeleccionado('');
    setFecha('');
    setHorasInicio('');
    setHorasFin('');
    setTipoHoraExtra('');
    setRecargo('');
    setJustificacion('');

    toast({
      title: "Solicitud enviada",
      description: `Solicitud de horas extras para ${empleado?.nombre} enviada correctamente`,
    });
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
        <CardTitle className="text-xl font-bold flex items-center gap-3">
          <Clock className="h-6 w-6" />
          Solicitud de Horas Extras
        </CardTitle>
        <p className="text-blue-100">
          Formulario para solicitar aprobación de horas extras
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Empleado */}
            <div className="space-y-2">
              <Label htmlFor="empleado">Empleado *</Label>
              <Select value={empleadoSeleccionado} onValueChange={setEmpleadoSeleccionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar empleado" />
                </SelectTrigger>
                <SelectContent>
                  {empleados.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.nombre} - {emp.departamento} ({emp.pais})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fecha */}
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha *</Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="fecha"
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="pl-10"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Hora inicio */}
            <div className="space-y-2">
              <Label htmlFor="horasInicio">Hora de inicio *</Label>
              <Input
                id="horasInicio"
                type="time"
                value={horasInicio}
                onChange={(e) => setHorasInicio(e.target.value)}
              />
            </div>

            {/* Hora fin */}
            <div className="space-y-2">
              <Label htmlFor="horasFin">Hora de fin *</Label>
              <Input
                id="horasFin" 
                type="time"
                value={horasFin}
                onChange={(e) => setHorasFin(e.target.value)}
              />
            </div>

            {/* Tipo de hora extra */}
            <div className="space-y-2">
              <Label htmlFor="tipoHoraExtra">Tipo de hora extra *</Label>
              <Select value={tipoHoraExtra} onValueChange={setTipoHoraExtra}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_HORA_EXTRA.map(tipo => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Recargo (solo para colombianos) */}
            {esColombiano && (
              <div className="space-y-2">
                <Label htmlFor="recargo">Recargo aplicable</Label>
                <Select value={recargo} onValueChange={setRecargo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar recargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECARGOS_COLOMBIA.map(rec => (
                      <SelectItem key={rec} value={rec}>
                        {rec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Horas calculadas */}
          {horasInicio && horasFin && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="text-blue-800 font-medium">
                Total de horas: {calcularHoras().toFixed(2)} horas
              </span>
            </div>
          )}

          {/* Justificación */}
          <div className="space-y-2">
            <Label htmlFor="justificacion">Justificación *</Label>
            <Textarea
              id="justificacion"
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              placeholder="Describir el motivo de las horas extras..."
              rows={3}
            />
          </div>

          {/* Información adicional para colombianos */}
          {esColombiano && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Información de recargos (Colombia)</span>
              </div>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>• Domingos: Recargo del 75%</p>
                <p>• Festivos: Recargo del 75%</p> 
                <p>• Nocturnas: Recargo del 35%</p>
                <p>• Combinaciones aplican recargos acumulativos</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Enviar Solicitud
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setEmpleadoSeleccionado('');
                setFecha('');
                setHorasInicio('');
                setHorasFin('');
                setTipoHoraExtra('');
                setRecargo('');
                setJustificacion('');
              }}
            >
              Limpiar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}