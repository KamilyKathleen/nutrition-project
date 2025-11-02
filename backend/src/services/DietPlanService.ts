/**
 * 🍽️ SERVIÇO DE PLANOS DIETÉTICOS
 * ================================
 * Gerenciamento completo de planos alimentares
 */

import { DietPlanModel } from '@/models/DietPlan';
import { PatientModel } from '@/models/Patient';
import { AppError } from '@/middlewares/errorHandler';
import { DietPlan } from '@/types';
import mongoose from 'mongoose';

export interface CreateDietPlanRequest {
  patientId: string;
  nutritionistId: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  targetCalories: number;
  targetProteins: number;
  targetCarbohydrates: number;
  targetFats: number;
  meals: Array<{
    type: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack';
    time: string;
    foods: Array<{
      name: string;
      quantity: number;
      unit: string;
      calories?: number;
      proteins?: number;
      carbohydrates?: number;
      fats?: number;
      fiber?: number;
    }>;
    instructions?: string;
  }>;
}

export interface UpdateDietPlanRequest extends Partial<CreateDietPlanRequest> {}

/**
 * 🍽️ SERVIÇO DE PLANOS DIETÉTICOS
 */
export class DietPlanService {
  
  /**
   * ➕ CRIAR NOVO PLANO DIETÉTICO
   */
  async create(data: CreateDietPlanRequest): Promise<DietPlan> {
    try {
      // Verificar se o paciente existe e pertence ao nutricionista
      const patient = await PatientModel.findOne({
        _id: data.patientId,
        nutritionistId: data.nutritionistId,
        isActive: true
      });

      if (!patient) {
        throw new AppError('Paciente não encontrado ou não pertence a este nutricionista', 404);
      }

      // Verificar se as datas são válidas
      if (data.endDate && data.endDate <= data.startDate) {
        throw new AppError('Data de fim deve ser posterior à data de início', 400);
      }

      const dietPlan = new DietPlanModel({
        patientId: new mongoose.Types.ObjectId(data.patientId),
        nutritionistId: new mongoose.Types.ObjectId(data.nutritionistId),
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        targetCalories: data.targetCalories,
        targetProteins: data.targetProteins,
        targetCarbohydrates: data.targetCarbohydrates,
        targetFats: data.targetFats,
        meals: data.meals
      });

      const savedPlan = await dietPlan.save();
      
      return this.mapToResponse(savedPlan);
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao criar plano dietético', 500);
    }
  }

  /**
   * 📋 LISTAR PLANOS POR NUTRICIONISTA
   */
  async findByNutritionistId(
    nutritionistId: string, 
    page: number = 1, 
    limit: number = 10,
    filters?: {
      isActive?: boolean;
      patientId?: string;
      search?: string;
    }
  ): Promise<{ plans: DietPlan[]; total: number; pages: number }> {
    try {
      const skip = (page - 1) * limit;
      
      // Construir query de filtros
      const query: any = { nutritionistId: new mongoose.Types.ObjectId(nutritionistId) };
      
      if (filters?.isActive !== undefined) {
        query.isActive = filters.isActive;
      }
      
      if (filters?.patientId) {
        query.patientId = new mongoose.Types.ObjectId(filters.patientId);
      }
      
      if (filters?.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } }
        ];
      }

      const [plans, total] = await Promise.all([
        DietPlanModel
          .find(query)
          .populate('patientId', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        DietPlanModel.countDocuments(query)
      ]);

      return {
        plans: plans.map(plan => this.mapToResponse(plan)),
        total,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new AppError('Erro ao listar planos dietéticos', 500);
    }
  }

  /**
   * 📋 LISTAR PLANOS POR PACIENTE
   */
  async findByPatientId(
    patientId: string,
    nutritionistId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ plans: DietPlan[]; total: number; pages: number }> {
    try {
      const skip = (page - 1) * limit;
      
      const [plans, total] = await Promise.all([
        DietPlanModel
          .find({ 
            patientId: new mongoose.Types.ObjectId(patientId),
            nutritionistId: new mongoose.Types.ObjectId(nutritionistId)
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        DietPlanModel
          .countDocuments({ 
            patientId: new mongoose.Types.ObjectId(patientId),
            nutritionistId: new mongoose.Types.ObjectId(nutritionistId)
          })
      ]);

      return {
        plans: plans.map(plan => this.mapToResponse(plan)),
        total,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new AppError('Erro ao listar planos do paciente', 500);
    }
  }

  /**
   * 🔍 BUSCAR PLANO POR ID
   */
  async findById(id: string, nutritionistId: string): Promise<DietPlan | null> {
    try {
      const plan = await DietPlanModel
        .findOne({ 
          _id: id,
          nutritionistId: new mongoose.Types.ObjectId(nutritionistId)
        })
        .populate('patientId', 'name email')
        .lean();

      if (!plan) return null;

      return this.mapToResponse(plan);
    } catch (error) {
      throw new AppError('Erro ao buscar plano dietético', 500);
    }
  }

  /**
   * 🎯 BUSCAR PLANO ATIVO DO PACIENTE
   */
  async findActiveByPatientId(patientId: string, nutritionistId: string): Promise<DietPlan | null> {
    try {
      const plan = await DietPlanModel
        .findOne({ 
          patientId: new mongoose.Types.ObjectId(patientId),
          nutritionistId: new mongoose.Types.ObjectId(nutritionistId),
          isActive: true
        })
        .populate('patientId', 'name email')
        .lean();

      if (!plan) return null;

      return this.mapToResponse(plan);
    } catch (error) {
      throw new AppError('Erro ao buscar plano ativo', 500);
    }
  }

  /**
   * ✏️ ATUALIZAR PLANO DIETÉTICO
   */
  async update(id: string, nutritionistId: string, data: UpdateDietPlanRequest): Promise<DietPlan> {
    try {
      const plan = await DietPlanModel.findOne({
        _id: id,
        nutritionistId: new mongoose.Types.ObjectId(nutritionistId)
      });

      if (!plan) {
        throw new AppError('Plano dietético não encontrado', 404);
      }

      // Validar datas se fornecidas
      if (data.endDate && data.startDate && data.endDate <= data.startDate) {
        throw new AppError('Data de fim deve ser posterior à data de início', 400);
      }

      // Atualizar campos fornecidos
      Object.assign(plan, data);
      
      const updatedPlan = await plan.save();

      return this.mapToResponse(updatedPlan);
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao atualizar plano dietético', 500);
    }
  }

  /**
   * 🔄 ATIVAR/DESATIVAR PLANO
   */
  async toggleActive(id: string, nutritionistId: string): Promise<DietPlan> {
    try {
      const plan = await DietPlanModel.findOne({
        _id: id,
        nutritionistId: new mongoose.Types.ObjectId(nutritionistId)
      });

      if (!plan) {
        throw new AppError('Plano dietético não encontrado', 404);
      }

      plan.isActive = !plan.isActive;
      const updatedPlan = await plan.save();

      return this.mapToResponse(updatedPlan);
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao alterar status do plano', 500);
    }
  }

  /**
   * 🗑️ EXCLUIR PLANO DIETÉTICO
   */
  async delete(id: string, nutritionistId: string): Promise<void> {
    try {
      const result = await DietPlanModel.deleteOne({
        _id: id,
        nutritionistId: new mongoose.Types.ObjectId(nutritionistId)
      });

      if (result.deletedCount === 0) {
        throw new AppError('Plano dietético não encontrado', 404);
      }
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao excluir plano dietético', 500);
    }
  }

  /**
   * 📊 ANÁLISE NUTRICIONAL DO PLANO
   */
  async getNutritionalAnalysis(id: string, nutritionistId: string): Promise<any> {
    try {
      const plan = await DietPlanModel.findOne({
        _id: id,
        nutritionistId: new mongoose.Types.ObjectId(nutritionistId)
      });

      if (!plan) {
        throw new AppError('Plano dietético não encontrado', 404);
      }

      return plan.getNutritionalSummary();
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao analisar plano nutricional', 500);
    }
  }

  /**
   * 📊 ESTATÍSTICAS DE PLANOS
   */
  async getStatistics(nutritionistId: string): Promise<{
    totalPlans: number;
    activePlans: number;
    plansThisMonth: number;
    averageCalories: number;
    mealTypeDistribution: Record<string, number>;
  }> {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [totalPlans, activePlans, plansThisMonth, nutritionalStats] = await Promise.all([
        DietPlanModel.countDocuments({
          nutritionistId: new mongoose.Types.ObjectId(nutritionistId)
        }),
        DietPlanModel.countDocuments({
          nutritionistId: new mongoose.Types.ObjectId(nutritionistId),
          isActive: true
        }),
        DietPlanModel.countDocuments({
          nutritionistId: new mongoose.Types.ObjectId(nutritionistId),
          createdAt: { $gte: startOfMonth }
        }),
        DietPlanModel.aggregate([
          { $match: { nutritionistId: new mongoose.Types.ObjectId(nutritionistId) } },
          {
            $group: {
              _id: null,
              avgCalories: { $avg: '$targetCalories' },
              mealTypes: { $push: '$meals.type' }
            }
          },
          {
            $project: {
              avgCalories: 1,
              mealTypeDistribution: {
                $reduce: {
                  input: { $concatArrays: '$mealTypes' },
                  initialValue: {},
                  in: {
                    $mergeObjects: [
                      '$$value',
                      { $arrayToObject: [
                        [{ k: '$$this', v: { $add: [{ $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] }, 1] } }]
                      ]}
                    ]
                  }
                }
              }
            }
          }
        ])
      ]);

      const stats = nutritionalStats[0] || {
        avgCalories: 0,
        mealTypeDistribution: {}
      };

      return {
        totalPlans,
        activePlans,
        plansThisMonth,
        averageCalories: Math.round(stats.avgCalories || 0),
        mealTypeDistribution: stats.mealTypeDistribution || {}
      };
    } catch (error) {
      throw new AppError('Erro ao calcular estatísticas', 500);
    }
  }

  /**
   * 🔄 DUPLICAR PLANO
   */
  async duplicate(id: string, nutritionistId: string, newTitle?: string): Promise<DietPlan> {
    try {
      const originalPlan = await DietPlanModel.findOne({
        _id: id,
        nutritionistId: new mongoose.Types.ObjectId(nutritionistId)
      });

      if (!originalPlan) {
        throw new AppError('Plano dietético não encontrado', 404);
      }

      const duplicatedPlan = new DietPlanModel({
        patientId: originalPlan.patientId,
        nutritionistId: originalPlan.nutritionistId,
        title: newTitle || `${originalPlan.title} (Cópia)`,
        description: originalPlan.description,
        startDate: new Date(),
        endDate: originalPlan.endDate ? new Date(Date.now() + (originalPlan.endDate.getTime() - originalPlan.startDate.getTime())) : undefined,
        targetCalories: originalPlan.targetCalories,
        targetProteins: originalPlan.targetProteins,
        targetCarbohydrates: originalPlan.targetCarbohydrates,
        targetFats: originalPlan.targetFats,
        meals: originalPlan.meals,
        isActive: false // Plano duplicado inicia inativo
      });

      const savedPlan = await duplicatedPlan.save();
      return this.mapToResponse(savedPlan);
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao duplicar plano dietético', 500);
    }
  }

  /**
   * 🎯 FUNÇÃO AUXILIAR PARA MAPEAR RESPOSTA
   */
  private mapToResponse(plan: any): DietPlan {
    return {
      id: plan._id.toString(),
      patientId: plan.patientId.toString(),
      nutritionistId: plan.nutritionistId.toString(),
      title: plan.title,
      description: plan.description,
      startDate: plan.startDate,
      endDate: plan.endDate,
      targetCalories: plan.targetCalories,
      targetProteins: plan.targetProteins,
      targetCarbohydrates: plan.targetCarbohydrates,
      targetFats: plan.targetFats,
      meals: plan.meals,
      isActive: plan.isActive,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt
    } as DietPlan;
  }
}

export default new DietPlanService();