import { apiClient } from './api';

// Tipos para paciente
export interface Patient {
    id: string;
    userId: string;
    name: string;
    email: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    height: number;
    weight: number;
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'intense' | 'very_intense';
    healthConditions?: string[];
    allergies?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface CreatePatientRequest {
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    height: number;
    weight: number;
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'intense' | 'very_intense';
    healthConditions?: string[];
    allergies?: string[];
}

export interface UpdatePatientRequest {
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    height?: number;
    weight?: number;
    activityLevel?: 'sedentary' | 'light' | 'moderate' | 'intense' | 'very_intense';
    healthConditions?: string[];
    allergies?: string[];
}

// Serviços de paciente
export class PatientService {
    // Obter dados do paciente atual
    static async getProfile(): Promise<Patient> {
        return apiClient.get<Patient>('/patients/profile');
    }

    // Criar perfil de paciente (após registro como usuário)
    static async createProfile(patientData: CreatePatientRequest): Promise<Patient> {
        return apiClient.post<Patient>('/patients/profile', patientData);
    }

    // Atualizar perfil do paciente
    static async updateProfile(patientData: UpdatePatientRequest): Promise<Patient> {
        return apiClient.put<Patient>('/patients/profile', patientData);
    }

    // Para nutricionistas: obter lista de pacientes
    static async getPatients(): Promise<Patient[]> {
        return apiClient.get<Patient[]>('/patients');
    }

    // Para nutricionistas: obter paciente específico
    static async getPatientById(patientId: string): Promise<Patient> {
        return apiClient.get<Patient>(`/patients/${patientId}`);
    }

    // Para nutricionistas: buscar pacientes
    static async searchPatients(query: string): Promise<Patient[]> {
        return apiClient.get<Patient[]>(`/patients/search?q=${encodeURIComponent(query)}`);
    }
}

export default PatientService;