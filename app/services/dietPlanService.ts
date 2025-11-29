/**
 * 🍽️ SERVIÇO DE PLANOS DIETÉTICOS - Frontend
 * 
 * Gerenciamento de planos alimentares do paciente
 */

import { apiClient } from './api';

interface Food {
    name: string;
    quantity: number;
    unit: string;
    calories?: number;
}

interface Meal {
    type: string;
    time: string;
    foods: Food[];
    _id?: string;
}

export interface DietPlan {
    id: string;
    patientId: string;
    nutritionistId: string;
    title: string;
    description?: string;
    targetCalories?: number;
    targetProteins?: number;
    targetCarbohydrates?: number;
    targetFats?: number;
    startDate: string;
    endDate?: string;
    isActive: boolean;
    meals: Meal[];
    createdAt: string;
    updatedAt: string;
}

interface DietPlanResponse {
    success: boolean;
    data: DietPlan[];
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}

class DietPlanService {

    /**
     * 🎯 Buscar plano ativo do paciente (primeiro plano da lista)
     */
    async getActiveDietPlan(): Promise<DietPlan | null> {
        try {
            console.log('🔍 [Frontend] Buscando plano ativo...');
            const response = await apiClient.get<DietPlanResponse>('/patient-data/diet-plans');
            console.log('📋 [Frontend] Planos recebidos:', response.data);
            
            // Retornar o primeiro plano ativo (mais recente)
            const activePlans = response.data?.filter(plan => plan.isActive) || [];
            return activePlans.length > 0 ? activePlans[0] : null;
        } catch (error: any) {
            console.error('❌ [Frontend] Erro ao buscar plano ativo:', error);
            
            // Se for 404, significa que não tem planos
            if (error?.message?.includes('404')) {
                return null;
            }
            
            throw error;
        }
    }

    /**
     * 📋 Buscar todos os planos do paciente
     */
    async getAllDietPlans(): Promise<DietPlan[]> {
        try {
            console.log('🔍 [Frontend] Buscando todos os planos...');
            const response = await apiClient.get<DietPlanResponse>('/patient-data/diet-plans');
            console.log('📋 [Frontend] Todos os planos recebidos:', response.data);
            
            return response.data || [];
        } catch (error: any) {
            console.error('❌ [Frontend] Erro ao buscar planos:', error);
            
            // Se for 404, retornar array vazio
            if (error?.message?.includes('404')) {
                return [];
            }
            
            throw error;
        }
    }
}

export const dietPlanService = new DietPlanService();