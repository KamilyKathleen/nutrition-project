/**
 * 🍽️ CONTROLLER DE PLANOS DIETÉTICOS
 * ===================================
 * Endpoints para gerenciamento de planos alimentares
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import DietPlanService, { CreateDietPlanRequest, UpdateDietPlanRequest } from '../services/DietPlanService';

/**
 * 🍽️ CONTROLLER DE PLANOS DIETÉTICOS
 */
export class DietPlanController {

  /**
   * ➕ CRIAR NOVO PLANO DIETÉTICO
   */
  createDietPlan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const nutritionistId = req.user!.userId;
      const data: CreateDietPlanRequest = {
        ...req.body,
        nutritionistId
      };

      const plan = await DietPlanService.create(data);

      res.status(201).json({
        success: true,
        message: 'Plano dietético criado com sucesso',
        data: plan
      });
    } catch (error: any) {
      console.error('🔥 Erro detalhado na criação do plano:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro ao criar plano dietético',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  };

  /**
   * 📋 PACIENTE VER SEUS PRÓPRIOS PLANOS (v2)
   */
  getMyPlans = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const userEmail = req.user!.email;
      
      console.log('🔍 [V2] Buscando planos para:', { userId, userEmail });
      
      // Buscar patientId pelo userId primeiro, depois por email
      let patient = await DietPlanService.findPatientByUserId(userId);
      
      if (!patient) {
        console.log('🔍 Não encontrado por userId, tentando por email...');
        patient = await DietPlanService.findPatientByEmail(userEmail);
      }
      
      if (!patient) {
        console.log('❌ Paciente não encontrado');
        res.status(404).json({
          success: false,
          message: 'Paciente não encontrado'
        });
        return;
      }

      console.log('✅ Paciente encontrado:', patient._id);
      console.log('✅ NutritionistId do paciente:', patient.nutritionistId);
      
      // Buscar planos do paciente através do serviço
      const patientPlans = await DietPlanService.getPatientPlans(patient._id.toString());
      
      console.log('✅ Planos encontrados do paciente:', patientPlans.length);

      res.json({
        success: true,
        message: 'Planos dietéticos listados com sucesso',
        data: patientPlans
      });
    } catch (error: any) {
      console.error('🔥 Erro ao buscar planos do paciente:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro ao buscar planos dietéticos'
      });
    }
  };

  /**
   * 📋 LISTAR PLANOS DO NUTRICIONISTA
   */
  getDietPlansByNutritionist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const nutritionistId = req.user!.userId;
      const page = Number.parseInt(req.query.page as string) || 1;
      const limit = Number.parseInt(req.query.limit as string) || 10;
      
      console.log('🔍 Controller: nutritionistId =', nutritionistId);
      
      // Filtros opcionais
      const filters: {
        isActive?: boolean;
        patientId?: string;
        search?: string;
      } = {};
      
      if (req.query.isActive) filters.isActive = req.query.isActive === 'true';
      if (req.query.patientId) filters.patientId = req.query.patientId as string;
      if (req.query.search) filters.search = req.query.search as string;

      const result = await DietPlanService.findByNutritionistId(nutritionistId, page, limit, filters);

      console.log('🔍 Controller: resultado =', result.plans.length, 'planos');

      res.json({
        success: true,
        message: 'Planos dietéticos listados com sucesso',
        data: result.plans,
        pagination: {
          currentPage: page,
          totalPages: result.pages,
          totalItems: result.total,
          itemsPerPage: limit
        }
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  };

  /**
   * 📋 LISTAR PLANOS POR PACIENTE
   */
  getDietPlansByPatient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const nutritionistId = req.user!.userId;
      const { patientId } = req.params;
      
      if (!patientId) {
        res.status(400).json({
          success: false,
          message: 'ID do paciente é obrigatório'
        });
        return;
      }

      const page = Number.parseInt(req.query.page as string) || 1;
      const limit = Number.parseInt(req.query.limit as string) || 10;

      const result = await DietPlanService.findByPatientId(patientId, nutritionistId, page, limit);

      res.json({
        success: true,
        message: 'Planos do paciente listados com sucesso',
        data: result.plans,
        pagination: {
          currentPage: page,
          totalPages: result.pages,
          totalItems: result.total,
          itemsPerPage: limit
        }
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  };

  /**
   * 🎯 BUSCAR PLANO ATIVO DO PACIENTE
   */
  getActiveDietPlan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const nutritionistId = req.user!.userId;
      const { patientId } = req.params;
      
      if (!patientId) {
        res.status(400).json({
          success: false,
          message: 'ID do paciente é obrigatório'
        });
        return;
      }

      const plan = await DietPlanService.findActiveByPatientId(patientId, nutritionistId);

      if (!plan) {
        res.status(404).json({
          success: false,
          message: 'Nenhum plano ativo encontrado para este paciente'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Plano ativo encontrado',
        data: plan
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  };

  /**
   * 🔍 BUSCAR PLANO POR ID
   */
  getDietPlanById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const nutritionistId = req.user!.userId;
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID do plano é obrigatório'
        });
        return;
      }

      const plan = await DietPlanService.findById(id, nutritionistId);

      if (!plan) {
        res.status(404).json({
          success: false,
          message: 'Plano dietético não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Plano dietético encontrado',
        data: plan
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  };

  /**
   * ✏️ ATUALIZAR PLANO DIETÉTICO
   */
  updateDietPlan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const nutritionistId = req.user!.userId;
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID do plano é obrigatório'
        });
        return;
      }

      const data: UpdateDietPlanRequest = req.body;
      const plan = await DietPlanService.update(id, nutritionistId, data);

      res.json({
        success: true,
        message: 'Plano dietético atualizado com sucesso',
        data: plan
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  };

  /**
   * 🔄 ATIVAR/DESATIVAR PLANO
   */
  toggleDietPlan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const nutritionistId = req.user!.userId;
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID do plano é obrigatório'
        });
        return;
      }

      const plan = await DietPlanService.toggleActive(id, nutritionistId);

      res.json({
        success: true,
        message: `Plano ${plan.isActive ? 'ativado' : 'desativado'} com sucesso`,
        data: plan
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  };

  /**
   * 🗑️ EXCLUIR PLANO DIETÉTICO
   */
  deleteDietPlan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const nutritionistId = req.user!.userId;
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID do plano é obrigatório'
        });
        return;
      }

      await DietPlanService.delete(id, nutritionistId);

      res.json({
        success: true,
        message: 'Plano dietético excluído com sucesso'
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  };

  /**
   * 📊 ANÁLISE NUTRICIONAL DO PLANO
   */
  getNutritionalAnalysis = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const nutritionistId = req.user!.userId;
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID do plano é obrigatório'
        });
        return;
      }

      const analysis = await DietPlanService.getNutritionalAnalysis(id, nutritionistId);

      res.json({
        success: true,
        message: 'Análise nutricional gerada com sucesso',
        data: analysis
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  };

  /**
   * 📊 ESTATÍSTICAS DE PLANOS
   */
  getDietPlanStatistics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const nutritionistId = req.user!.userId;

      const statistics = await DietPlanService.getStatistics(nutritionistId);

      res.json({
        success: true,
        message: 'Estatísticas de planos geradas com sucesso',
        data: statistics
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  };

  /**
   * 🔄 DUPLICAR PLANO
   */
  duplicateDietPlan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const nutritionistId = req.user!.userId;
      const { id } = req.params;
      const { newTitle } = req.body;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID do plano é obrigatório'
        });
        return;
      }

      const duplicatedPlan = await DietPlanService.duplicate(id, nutritionistId, newTitle);

      res.status(201).json({
        success: true,
        message: 'Plano duplicado com sucesso',
        data: duplicatedPlan
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  };

  /**
   * 📋 RELATÓRIO DETALHADO DO PLANO
   */
  getDietPlanReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const nutritionistId = req.user!.userId;
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID do plano é obrigatório'
        });
        return;
      }

      const [plan, analysis] = await Promise.all([
        DietPlanService.findById(id, nutritionistId),
        DietPlanService.getNutritionalAnalysis(id, nutritionistId)
      ]);

      if (!plan) {
        res.status(404).json({
          success: false,
          message: 'Plano dietético não encontrado'
        });
        return;
      }

      // Calcular informações adicionais para o relatório
      const mealsByType = plan.meals.reduce((acc: Record<string, any[]>, meal) => {
        if (!acc[meal.type]) acc[meal.type] = [];
        acc[meal.type]?.push(meal);
        return acc;
      }, {});

      const totalFoods = plan.meals.reduce((total, meal) => total + meal.foods.length, 0);

      const report = {
        plan,
        analysis,
        summary: {
          totalMeals: plan.meals.length,
          totalFoods,
          mealsByType,
          duration: plan.endDate ? 
            Math.ceil((plan.endDate.getTime() - plan.startDate.getTime()) / (1000 * 60 * 60 * 24)) : 
            null,
          daysRemaining: plan.endDate ? 
            Math.max(0, Math.ceil((plan.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 
            null
        },
        recommendations: this.generateRecommendations(analysis)
      };

      res.json({
        success: true,
        message: 'Relatório do plano gerado com sucesso',
        data: report
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  };

  /**
   * 🎯 GERAR RECOMENDAÇÕES BASEADAS NA ANÁLISE
   */
  private generateRecommendations(analysis: any): string[] {
    const recommendations: string[] = [];
    const { compliance } = analysis;

    // Análise de calorias
    if (compliance.calories < 90) {
      recommendations.push('⚠️ Plano com calorias abaixo do target - considere adicionar alimentos energéticos');
    } else if (compliance.calories > 110) {
      recommendations.push('⚠️ Plano com excesso de calorias - revise as porções dos alimentos');
    }

    // Análise de proteínas
    if (compliance.proteins < 85) {
      recommendations.push('💪 Aumentar fontes proteicas (carnes, ovos, leguminosas)');
    } else if (compliance.proteins > 120) {
      recommendations.push('💪 Reduzir proteínas - excesso pode sobrecarregar os rins');
    }

    // Análise de carboidratos
    if (compliance.carbohydrates < 80) {
      recommendations.push('🍞 Incluir mais carboidratos complexos (grãos integrais, tubérculos)');
    } else if (compliance.carbohydrates > 115) {
      recommendations.push('🍞 Reduzir carboidratos - priorizar fontes integrais');
    }

    // Análise de gorduras
    if (compliance.fats < 80) {
      recommendations.push('🥑 Adicionar gorduras saudáveis (abacate, oleaginosas, azeite)');
    } else if (compliance.fats > 115) {
      recommendations.push('🥑 Moderar gorduras - revisar métodos de preparo');
    }

    // Recomendações gerais
    if (recommendations.length === 0) {
      recommendations.push('✅ Plano bem balanceado! Continue com o acompanhamento');
    }

    recommendations.push(
      '💧 Lembre-se: hidratação adequada é fundamental (35ml/kg de peso)',
      '⏰ Manter regularidade nos horários das refeições'
    );

    return recommendations;
  }
}

export default new DietPlanController();