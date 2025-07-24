export interface Empleado {
  id: string;
  nombre: string;
  pais: string;
  departamento: string;
  tipo: string;
  horasMax: number;
  lider: string;
  especialidad: string;
}

export type TipoSemana = 'alta' | 'media' | 'valle';
export type TurnoType = 'madrugada' | 'manana' | 'tarde' | 'senior_nocturno';

export interface AsignacionTurno {
  id: string;
  empleadoId: string;
  fecha: string;
  turno: TurnoType;
  horas: number;
}

export const EQUIPO_COMPLETO: Empleado[] = [
  // ATC SENIORS (Venezuela) - Líder: Edison Saldivia
  {
    id: 'helen-rodriguez',
    nombre: 'Helen Rodríguez',
    pais: 'Venezuela',
    departamento: 'ATC',
    tipo: 'Senior',
    horasMax: 45,
    lider: 'Edison Saldivia',
    especialidad: 'Soporte avanzado + horarios nocturnos'
  },
  {
    id: 'mayra-gonzalez',
    nombre: 'Mayra González',
    pais: 'Venezuela',
    departamento: 'ATC',
    tipo: 'Senior',
    horasMax: 45,
    lider: 'Edison Saldivia',
    especialidad: 'Gestión escalaciones + horarios nocturnos'
  },
  {
    id: 'jose-torres',
    nombre: 'José Manuel Torres',
    pais: 'Venezuela',
    departamento: 'ATC',
    tipo: 'Senior',
    horasMax: 45,
    lider: 'Edison Saldivia',
    especialidad: 'Casos complejos + horarios nocturnos'
  },

  // ATC REGULARES (Colombia) - Líder: Edison Saldivia
  {
    id: 'stella-morales',
    nombre: 'Stella Morales',
    pais: 'Colombia',
    departamento: 'ATC',
    tipo: 'Regular',
    horasMax: 46,
    lider: 'Edison Saldivia',
    especialidad: 'Atención general'
  },
  {
    id: 'diana-castillo',
    nombre: 'Diana Castillo',
    pais: 'Colombia',
    departamento: 'ATC',
    tipo: 'Regular',
    horasMax: 46,
    lider: 'Edison Saldivia',
    especialidad: 'Backup madrugadas (vie-sáb únicamente)'
  },
  {
    id: 'juan-lopez',
    nombre: 'Juan Carlos López',
    pais: 'Colombia',
    departamento: 'ATC',
    tipo: 'Híbrido',
    horasMax: 46,
    lider: 'Edison Saldivia',
    especialidad: 'ATC + Onboarding fines de semana'
  },
  {
    id: 'thalia-vargas',
    nombre: 'Thalia Vargas',
    pais: 'Colombia',
    departamento: 'ATC',
    tipo: 'Regular',
    horasMax: 46,
    lider: 'Edison Saldivia',
    especialidad: 'Atención general'
  },
  {
    id: 'alejandra-ruiz',
    nombre: 'Alejandra Ruiz',
    pais: 'Colombia',
    departamento: 'ATC',
    tipo: 'Híbrido',
    horasMax: 46,
    lider: 'Edison Saldivia',
    especialidad: 'ATC + Onboarding fines de semana'
  },
  {
    id: 'cristian-herrera',
    nombre: 'Cristian Herrera',
    pais: 'Colombia',
    departamento: 'ATC',
    tipo: 'Regular',
    horasMax: 46,
    lider: 'Edison Saldivia',
    especialidad: 'Atención general'
  },

  // ATC OTROS PAÍSES - Líder: Edison Saldivia
  {
    id: 'carmen-silva',
    nombre: 'Carmen Silva',
    pais: 'México',
    departamento: 'ATC',
    tipo: 'Regular',
    horasMax: 44,
    lider: 'Edison Saldivia',
    especialidad: 'Atención general + Onboarding domingos'
  },
  {
    id: 'nerean-medina',
    nombre: 'Nerean Medina',
    pais: 'Venezuela',
    departamento: 'ATC',
    tipo: 'Regular',
    horasMax: 45,
    lider: 'Edison Saldivia',
    especialidad: 'Atención general'
  },
  {
    id: 'belkis-ramirez',
    nombre: 'Belkis Ramírez',
    pais: 'Venezuela',
    departamento: 'ATC',
    tipo: 'Regular',
    horasMax: 45,
    lider: 'Edison Saldivia',
    especialidad: 'Atención general'
  },
  {
    id: 'sugli-martinez',
    nombre: 'Sugli Martínez',
    pais: 'Italia',
    departamento: 'ATC',
    tipo: 'Madrugada',
    horasMax: 45,
    lider: 'Edison Saldivia',
    especialidad: 'ÚNICA persona madrugadas 01:00-07:00'
  },

  // ONBOARDING - Líder: Jorge Carmona
  {
    id: 'ashley-jimenez',
    nombre: 'Ashley Jiménez',
    pais: 'Colombia',
    departamento: 'Onboarding',
    tipo: 'AM Especialista',
    horasMax: 46,
    lider: 'Jorge Carmona',
    especialidad: 'Onboarding turno mañana exclusivo'
  },
  {
    id: 'fernando-perez',
    nombre: 'Fernando Pérez',
    pais: 'Colombia',
    departamento: 'Onboarding',
    tipo: 'PM Especialista',
    horasMax: 46,
    lider: 'Jorge Carmona',
    especialidad: 'Onboarding turno tarde exclusivo'
  }
];

export const TURNOS = {
  madrugada: {
    nombre: 'Madrugada',
    horario: '01:00-07:00',
    horas: 6,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  },
  manana: {
    nombre: 'Mañana',
    horario: '07:00-15:00',
    horas: 8,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  },
  tarde: {
    nombre: 'Tarde',
    horario: '15:00-23:00',
    horas: 8,
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
  },
  senior_nocturno: {
    nombre: 'Senior Nocturno',
    horario: '18:00-01:00',
    horas: 7,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  }
};