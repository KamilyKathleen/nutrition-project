// Importar tipos dos serviços
import { Patient as ServicePatient } from '@/app/services';

// Estender tipos dos serviços para incluir campos específicos do dashboard
export interface Patient extends Omit<ServicePatient, 'dateOfBirth' | 'gender' | 'height' | 'weight' | 'activityLevel' | 'healthConditions' | 'allergies' | 'createdAt'> {
    lastAppointment?: string;
    status: 'Ativo' | 'Inativo';
    createdAt: string;
    inviteDate?: string; // Data do convite para vinculação
    inviteId?: string; // ID do convite pendente
}

// Alias para compatibilidade com PatientHistoryModal
export type DashboardPatient = Patient;

// Tipos para histórico de avaliações
export interface NutritionalAssessment {
    id: string;
    weight: number;
    height: number;
    bodyFat?: number;
    muscleMass?: number;
    waistCircumference?: number;
    hipCircumference?: number;
    notes?: string;
    createdAt: string;
}

// Tipos para planos alimentares
export interface DietPlan {
    id: string;
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    isActive: boolean;
    createdAt: string;
}

// Histórico completo do paciente
export interface PatientHistory {
    assessments: NutritionalAssessment[];
    dietPlans: DietPlan[];
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