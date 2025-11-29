// Importar tipos dos serviços
import { Patient as ServicePatient } from '@/app/services';

// Status do relacionamento paciente-nutricionista
export type PatientStatus = 'vinculado' | 'convite_pendente' | 'nao_vinculado' | 'convite_expirado';

// Interface para pacientes no dashboard do nutricionista
export interface DashboardPatient {
    id: string;
    name: string;
    email: string;
    userId?: string; // ID do usuário registrado (se existir)
    lastAppointment?: string;
    lastAssessment?: string;
    activePlan?: string;
    status: PatientStatus;
    inviteId?: string; // ID do convite (se existir)
    inviteDate?: string;
    createdAt: string;
    updatedAt: string;
}

// Histórico completo do paciente
export interface PatientHistory {
    patient: DashboardPatient;
    assessments: NutritionalAssessment[];
    dietPlans: DietPlan[];
    appointments: Appointment[];
}

// Avaliação nutricional
export interface NutritionalAssessment {
    id: string;
    patientId: string;
    nutritionistId: string;
    weight: number;
    height: number;
    bodyFat?: number;
    muscleMass?: number;
    notes?: string;
    createdAt: string;
}

// Plano alimentar simplificado
export interface DietPlan {
    id: string;
    patientId: string;
    title: string;
    description?: string;
    isActive: boolean;
    startDate: string;
    endDate?: string;
    createdAt: string;
}

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