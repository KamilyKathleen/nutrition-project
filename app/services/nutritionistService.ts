import { apiClient } from './api';
import { DashboardPatient, PatientHistory, PatientStatus } from '../pages/dashboard/types';

// Request para adicionar paciente
export interface AddPatientRequest {
    name: string;
    email: string;
    birthDate?: string;
    gender?: 'male' | 'female' | 'other';
    sendInvite?: boolean;
    message?: string;
}

// Request para enviar convite
export interface SendInviteRequest {
    patientEmail: string;
    patientName?: string;
    message?: string;
}

// Response padrão da API
interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}

class NutritionistService {
    
    /**
     * 📋 Buscar todos os pacientes do nutricionista
     * Inclui pacientes criados + convites pendentes
     */
    async getPatients(page = 1, limit = 20): Promise<DashboardPatient[]> {
        try {
            console.log('🔍 [Nutritionist] Buscando pacientes...');
            
            // Buscar pacientes vinculados
            const patientsResponse = await apiClient.get<ApiResponse<any[]>>(`/patients?page=${page}&limit=${limit}`);
            
            // Buscar convites enviados
            const invitesResponse = await apiClient.get<ApiResponse<any[]>>('/patients/invites');
            
            const patients = patientsResponse.data || [];
            const invites = invitesResponse.data || [];
            
            console.log('📋 [Nutritionist] Pacientes encontrados:', patients.length);
            console.log('📧 [Nutritionist] Convites encontrados:', invites.length);
            
            // Converter e combinar dados
            const dashboardPatients: DashboardPatient[] = [];
            
            // Adicionar pacientes vinculados
            patients.forEach(patient => {
                dashboardPatients.push({
                    id: patient._id || patient.id,
                    name: patient.name,
                    email: patient.email,
                    userId: patient.userId,
                    lastAppointment: patient.lastAppointment,
                    lastAssessment: patient.lastAssessment,
                    activePlan: patient.activePlan,
                    status: 'linked',
                    createdAt: patient.createdAt,
                    updatedAt: patient.updatedAt
                });
            });
            
            // Adicionar convites pendentes (que não se tornaram pacientes ainda)
            invites.forEach(invite => {
                // Verificar se já não existe um paciente com este email
                const existingPatient = dashboardPatients.find(p => p.email === invite.patientEmail);
                if (!existingPatient && invite.status === 'pending') {
                    dashboardPatients.push({
                        id: invite._id || invite.id,
                        name: invite.patientName || invite.patientEmail.split('@')[0],
                        email: invite.patientEmail,
                        status: this.getInviteStatus(invite),
                        inviteId: invite._id || invite.id,
                        inviteDate: invite.sentAt || invite.createdAt,
                        createdAt: invite.createdAt,
                        updatedAt: invite.updatedAt
                    });
                }
            });
            
            console.log('✅ [Nutritionist] Total no dashboard:', dashboardPatients.length);
            return dashboardPatients;
            
        } catch (error: any) {
            console.error('❌ [Nutritionist] Erro ao buscar pacientes:', error);
            throw new Error(`Erro ao carregar pacientes: ${error.message}`);
        }
    }
    
    /**
     * 👁️ Buscar histórico completo de um paciente
     */
    async getPatientHistory(patientId: string): Promise<PatientHistory> {
        try {
            console.log(`🔍 [Nutritionist] Buscando histórico do paciente ${patientId}...`);
            
            // Buscar dados do paciente
            const patientResponse = await apiClient.get<ApiResponse<any>>(`/patients/${patientId}`);
            
            // Buscar avaliações do paciente  
            const assessmentsResponse = await apiClient.get<ApiResponse<any[]>>(`/nutritional-assessments/patient/${patientId}`);
            
            // Buscar planos alimentares
            const plansResponse = await apiClient.get<ApiResponse<any[]>>(`/diet-plans/patient/${patientId}`);
            
            const patient = patientResponse.data;
            const assessments = assessmentsResponse.data || [];
            const dietPlans = plansResponse.data || [];
            
            const history: PatientHistory = {
                patient: {
                    id: patient._id || patient.id,
                    name: patient.name,
                    email: patient.email,
                    userId: patient.userId,
                    status: 'linked',
                    createdAt: patient.createdAt,
                    updatedAt: patient.updatedAt
                },
                assessments: assessments.map(assessment => ({
                    id: assessment._id || assessment.id,
                    patientId: assessment.patientId,
                    nutritionistId: assessment.nutritionistId,
                    weight: assessment.weight,
                    height: assessment.height,
                    bodyFat: assessment.bodyFat,
                    muscleMass: assessment.muscleMass,
                    notes: assessment.notes,
                    createdAt: assessment.createdAt
                })),
                dietPlans: dietPlans.map(plan => ({
                    id: plan._id || plan.id,
                    patientId: plan.patientId,
                    title: plan.title,
                    description: plan.description,
                    isActive: plan.isActive,
                    startDate: plan.startDate,
                    endDate: plan.endDate,
                    createdAt: plan.createdAt
                })),
                appointments: [] // TODO: implementar quando houver sistema de agendamentos
            };
            
            console.log('✅ [Nutritionist] Histórico carregado:', {
                assessments: history.assessments.length,
                dietPlans: history.dietPlans.length
            });
            
            return history;
            
        } catch (error: any) {
            console.error('❌ [Nutritionist] Erro ao buscar histórico:', error);
            throw new Error(`Erro ao carregar histórico: ${error.message}`);
        }
    }
    
    /**
     * ➕ Adicionar novo paciente (com opção de enviar convite)
     */
    async addPatient(patientData: AddPatientRequest): Promise<DashboardPatient> {
        try {
            console.log('➕ [Nutritionist] Adicionando paciente:', patientData);
            
            if (patientData.sendInvite) {
                // Enviar apenas convite
                const inviteResponse = await apiClient.post<ApiResponse<any>>('/patients/invite', {
                    patientEmail: patientData.email,
                    patientName: patientData.name,
                    message: patientData.message
                });
                
                const invite = inviteResponse.data;
                
                return {
                    id: invite._id || invite.id,
                    name: patientData.name,
                    email: patientData.email,
                    status: 'invite_pending',
                    inviteId: invite._id || invite.id,
                    inviteDate: invite.sentAt || new Date().toISOString(),
                    createdAt: invite.createdAt || new Date().toISOString(),
                    updatedAt: invite.updatedAt || new Date().toISOString()
                };
            } else {
                // Criar paciente diretamente
                const patientResponse = await apiClient.post<ApiResponse<any>>('/patients', {
                    name: patientData.name,
                    email: patientData.email,
                    birthDate: patientData.birthDate,
                    gender: patientData.gender
                });
                
                const patient = patientResponse.data;
                
                return {
                    id: patient._id || patient.id,
                    name: patient.name,
                    email: patient.email,
                    userId: patient.userId,
                    status: 'linked',
                    createdAt: patient.createdAt,
                    updatedAt: patient.updatedAt
                };
            }
            
        } catch (error: any) {
            console.error('❌ [Nutritionist] Erro ao adicionar paciente:', error);
            throw new Error(`Erro ao adicionar paciente: ${error.message}`);
        }
    }
    
    /**
     * 📧 Enviar convite para email
     */
    async sendInvite(inviteData: SendInviteRequest): Promise<void> {
        try {
            console.log('📧 [Nutritionist] Enviando convite:', inviteData);
            
            await apiClient.post<ApiResponse<any>>('/patients/invite', inviteData);
            
            console.log('✅ [Nutritionist] Convite enviado com sucesso');
            
        } catch (error: any) {
            console.error('❌ [Nutritionist] Erro ao enviar convite:', error);
            throw new Error(`Erro ao enviar convite: ${error.message}`);
        }
    }
    
    /**
     * ❌ Cancelar convite pendente
     */
    async cancelInvite(inviteId: string): Promise<void> {
        try {
            console.log(`❌ [Nutritionist] Cancelando convite ${inviteId}...`);
            
            await apiClient.delete(`/patients/invite/${inviteId}`);
            
            console.log('✅ [Nutritionist] Convite cancelado');
            
        } catch (error: any) {
            console.error('❌ [Nutritionist] Erro ao cancelar convite:', error);
            throw new Error(`Erro ao cancelar convite: ${error.message}`);
        }
    }
    
    /**
     * 🎯 Determinar status do convite
     */
    private getInviteStatus(invite: any): PatientStatus {
        if (invite.status === 'pending') {
            // Verificar se expirou
            const expiresAt = new Date(invite.expiresAt);
            const now = new Date();
            
            if (expiresAt < now) {
                return 'invite_expired';
            }
            
            return 'invite_pending';
        }
        
        if (invite.status === 'accepted') {
            return 'linked';
        }
        
        return 'not_linked';
    }
    
    /**
     * 📊 Buscar estatísticas do dashboard
     */
    async getDashboardStats() {
        try {
            // Buscar todos os pacientes para calcular estatísticas
            const patients = await this.getPatients(1, 1000);
            
            const stats = {
                totalPatients: patients.length,
                linkedPatients: patients.filter(p => p.status === 'linked').length,
                pendingInvites: patients.filter(p => p.status === 'invite_pending').length,
                activePlans: patients.filter(p => p.activePlan).length,
                recentAssessments: patients.filter(p => p.lastAssessment).length
            };
            
            return stats;
            
        } catch (error: any) {
            console.error('❌ [Nutritionist] Erro ao buscar estatísticas:', error);
            return {
                totalPatients: 0,
                linkedPatients: 0,
                pendingInvites: 0,
                activePlans: 0,
                recentAssessments: 0
            };
        }
    }
}

export const nutritionistService = new NutritionistService();
export default nutritionistService;