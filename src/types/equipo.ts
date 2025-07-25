export interface Empleado {
  id: string;
  nombre: string;
  pais: string;
  departamento: string;
  tipo: string;
  horasMax: number;
  lider: string;
  especialidad: string;
  horasAsignadas?: number;
  activo: boolean;
  fechaIngreso: string;
  nivel: 'Junior' | 'Semi-Senior' | 'Senior' | 'Lead';
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
    especialidad: 'Soporte avanzado + horarios nocturnos',
    horasAsignadas: 0,
    activo: true,
    fechaIngreso: '2022-01-15',
    nivel: 'Senior'
  },
  {
    id: 'mayra-gonzalez',
    nombre: 'Mayra González',
    pais: 'Venezuela',
    departamento: 'ATC',
    tipo: 'Senior',
    horasMax: 45,
    lider: 'Edison Saldivia',
    especialidad: 'Gestión escalaciones + horarios nocturnos',
    horasAsignadas: 0,
    activo: true,
    fechaIngreso: '2022-03-20',
    nivel: 'Senior'
  },
  {
    id: 'jose-torres',
    nombre: 'José Manuel Torres',
    pais: 'Venezuela',
    departamento: 'ATC',
    tipo: 'Senior',
    horasMax: 45,
    lider: 'Edison Saldivia',
    especialidad: 'Casos complejos + horarios nocturnos',
    horasAsignadas: 0,
    activo: true,
    fechaIngreso: '2021-11-10',
    nivel: 'Senior'
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
    especialidad: 'Atención general',
    horasAsignadas: 0,
    activo: true,
    fechaIngreso: '2023-01-15',
    nivel: 'Semi-Senior'
  },
  {
    id: 'diana-castillo',
    nombre: 'Diana Castillo',
    pais: 'Colombia',
    departamento: 'ATC',
    tipo: 'Regular',
    horasMax: 46,
    lider: 'Edison Saldivia',
    especialidad: 'Backup madrugadas (vie-sáb únicamente)',
    horasAsignadas: 0,
    activo: true,
    fechaIngreso: '2023-04-01',
    nivel: 'Junior'
  },
  {
    id: 'juan-lopez',
    nombre: 'Juan Carlos López',
    pais: 'Colombia',
    departamento: 'ATC',
    tipo: 'Híbrido',
    horasMax: 46,
    lider: 'Edison Saldivia',
    especialidad: 'ATC + Onboarding fines de semana',
    horasAsignadas: 0,
    activo: true,
    fechaIngreso: '2022-08-15',
    nivel: 'Semi-Senior'
  },
  {
    id: 'thalia-vargas',
    nombre: 'Thalia Vargas',
    pais: 'Colombia',
    departamento: 'ATC',
    tipo: 'Regular',
    horasMax: 46,
    lider: 'Edison Saldivia',
    especialidad: 'Atención general',
    horasAsignadas: 0,
    activo: true,
    fechaIngreso: '2023-02-20',
    nivel: 'Junior'
  },
  {
    id: 'alejandra-ruiz',
    nombre: 'Alejandra Ruiz',
    pais: 'Colombia',
    departamento: 'ATC',
    tipo: 'Híbrido',
    horasMax: 46,
    lider: 'Edison Saldivia',
    especialidad: 'ATC + Onboarding fines de semana',
    horasAsignadas: 0,
    activo: true,
    fechaIngreso: '2022-12-01',
    nivel: 'Semi-Senior'
  },
  {
    id: 'cristian-herrera',
    nombre: 'Cristian Herrera',
    pais: 'Colombia',
    departamento: 'ATC',
    tipo: 'Regular',
    horasMax: 46,
    lider: 'Edison Saldivia',
    especialidad: 'Atención general',
    horasAsignadas: 0,
    activo: true,
    fechaIngreso: '2023-05-10',
    nivel: 'Junior'
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
    especialidad: 'Atención general + Onboarding domingos',
    horasAsignadas: 0,
    activo: true,
    fechaIngreso: '2023-01-05',
    nivel: 'Semi-Senior'
  },
  {
    id: 'nerean-medina',
    nombre: 'Nerean Medina',
    pais: 'Venezuela',
    departamento: 'ATC',
    tipo: 'Regular',
    horasMax: 45,
    lider: 'Edison Saldivia',
    especialidad: 'Atención general',
    horasAsignadas: 0,
    activo: true,
    fechaIngreso: '2023-03-15',
    nivel: 'Junior'
  },
  {
    id: 'belkis-ramirez',
    nombre: 'Belkis Ramírez',
    pais: 'Venezuela',
    departamento: 'ATC',
    tipo: 'Regular',
    horasMax: 45,
    lider: 'Edison Saldivia',
    especialidad: 'Atención general',
    horasAsignadas: 0,
    activo: true,
    fechaIngreso: '2023-02-28',
    nivel: 'Junior'
  },
  {
    id: 'sugli-martinez',
    nombre: 'Sugli Martínez',
    pais: 'Italia',
    departamento: 'ATC',
    tipo: 'Madrugada',
    horasMax: 45,
    lider: 'Edison Saldivia',
    especialidad: 'ÚNICA persona madrugadas 01:00-07:00',
    horasAsignadas: 0,
    activo: true,
    fechaIngreso: '2022-06-01',
    nivel: 'Senior'
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
    especialidad: 'Onboarding turno mañana exclusivo',
    horasAsignadas: 0,
    activo: true,
    fechaIngreso: '2022-10-15',
    nivel: 'Semi-Senior'
  },
  {
    id: 'fernando-perez',
    nombre: 'Fernando Pérez',
    pais: 'Colombia',
    departamento: 'Onboarding',
    tipo: 'PM Especialista',
    horasMax: 46,
    lider: 'Jorge Carmona',
    especialidad: 'Onboarding turno tarde exclusivo',
    horasAsignadas: 0,
    activo: true,
    fechaIngreso: '2022-09-20',
    nivel: 'Semi-Senior'
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