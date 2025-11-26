// Importar tipos dos serviços
import { Patient as ServicePatient } from '@/app/services';

// Estender tipos dos serviços para incluir campos específicos do dashboard
export interface Patient extends Omit<ServicePatient, 'dateOfBirth' | 'gender' | 'height' | 'weight' | 'activityLevel' | 'healthConditions' | 'allergies'> {
    lastAppointment?: string;
    status: 'Ativo' | 'Inativo';
}

export interface Appointment {
    id: string;
    patientName: string;
    date: string;
    time: string;
}

export type UserRole = 'nutritionist' | 'patient';

export interface User {
    name: string;
    role: UserRole;
}

// Re-exportar tipos dos serviços
export type { Patient as ServicePatient, User as ServiceUser } from '@/app/services';