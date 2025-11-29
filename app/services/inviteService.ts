import { apiClient } from './api';

export interface Nutritionist {
  _id: string;
  name: string;
  email: string;
}

export interface PendingInvite {
  id: string;
  nutritionistId: string;
  patientEmail: string;
  patientName: string;
  inviteToken: string;
  status: string;
  expiresAt: string;
  sentAt: string;
  message?: string;
  nutritionist?: Nutritionist;
  createdAt: string;
  updatedAt: string;
}

export interface PatientRelationship {
  id: string;
  name: string;
  email: string;
  nutritionistId: string;
  isActive: boolean;
  createdAt: string;
}

export const inviteService = {
  // 📋 Buscar convites pendentes
  async getPendingInvites(): Promise<PendingInvite[]> {
    try {
      const response = await apiClient.get<{success: boolean, data: PendingInvite[]}>('/invites/pending');
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar convites pendentes:', error);
      throw error;
    }
  },

  // ✅ Aceitar convite
  async acceptInvite(inviteId: string): Promise<void> {
    try {
      await apiClient.post(`/invites/${inviteId}/accept`);
    } catch (error) {
      console.error('Erro ao aceitar convite:', error);
      throw error;
    }
  },

  // ❌ Rejeitar convite (implementar no backend se necessário)
  async rejectInvite(inviteId: string): Promise<void> {
    try {
      await apiClient.post(`/invites/${inviteId}/reject`);
    } catch (error) {
      console.error('Erro ao rejeitar convite:', error);
      throw error;
    }
  },

  // 🔗 Verificar se paciente tem nutricionista vinculado
  async checkPatientRelationship(): Promise<PatientRelationship | null> {
    try {
      console.log('🔍 Verificando relacionamento do paciente...');
      const response = await apiClient.get<{success: boolean, data: PatientRelationship}>('/patients/me');
      console.log('✅ Relacionamento encontrado:', response.data);
      return response.data || null;
    } catch (error: any) {
      console.error('❌ Erro ao verificar relacionamento:', error);
      
      // Se for erro 404, significa que não tem relacionamento
      if (error?.message?.includes('404') || error?.message?.includes('Nenhum relacionamento encontrado')) {
        console.log('ℹ️ Paciente não tem relacionamento ainda');
        return null;
      }
      
      // Para outros erros, lançar para ser tratado no componente
      throw new Error(`Erro ao verificar relacionamento: ${error.message}`);
    }
  },

  // 👨‍⚕️ Buscar dados do nutricionista vinculado
  async getNutritionistInfo(): Promise<Nutritionist | null> {
    try {
      const response = await apiClient.get<{success: boolean, data: Nutritionist}>('/patients/nutritionist');
      return response.data || null;
    } catch (error: any) {
      if (error?.message?.includes('404')) {
        return null;
      }
      console.error('Erro ao buscar dados do nutricionista:', error);
      throw error;
    }
  }
};