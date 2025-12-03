/**
 * 📊 CONTROLLER DE AVALIAÇÃO NUTRICIONAL
 * ======================================
 * Endpoints para gerenciamento de avaliações nutricionais
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import NutritionalAssessmentService, { CreateAssessmentRequest, UpdateAssessmentRequest } from '../services/NutritionalAssessmentService';

/**
 * 📊 CONTROLLER DE AVALIAÇÃO NUTRICIONAL
 */
export class NutritionalAssessmentController {

  /**
   * ➕ CRIAR NOVA AVALIAÇÃO NUTRICIONAL
   */
  createAssessment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const nutritionistId = req.user!.userId;
      const data: CreateAssessmentRequest = {
        ...req.body,
        nutritionistId
      };

      const assessment = await NutritionalAssessmentService.create(data);

      res.status(201).json({
        success: true,
        message: 'Avaliação nutricional criada com sucesso',
        data: assessment
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  };

  /**
   * 📋 LISTAR AVALIAÇÕES DO NUTRICIONISTA
   */
  getAssessmentsByNutritionist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const nutritionistId = req.user!.userId;
      const page = Number.parseInt(req.query.page as string) || 1;
      const limit = Number.parseInt(req.query.limit as string) || 10;

      const result = await NutritionalAssessmentService.findByNutritionistId(nutritionistId, page, limit);

      res.json({
        success: true,
        message: 'Avaliações nutricionais listadas com sucesso',
        data: result.assessments,
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
   * 📋 LISTAR AVALIAÇÕES POR PACIENTE
   */
  getAssessmentsByPatient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

      const result = await NutritionalAssessmentService.findByPatientId(patientId, nutritionistId, page, limit);

      res.json({
        success: true,
        message: 'Avaliações do paciente listadas com sucesso',
        data: result.assessments,
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
   * 🔍 BUSCAR AVALIAÇÃO POR ID
   */
  getAssessmentById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const nutritionistId = req.user!.userId;
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID da avaliação é obrigatório'
        });
        return;
      }

      const assessment = await NutritionalAssessmentService.findById(id, nutritionistId);

      if (!assessment) {
        res.status(404).json({
          success: false,
          message: 'Avaliação nutricional não encontrada'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Avaliação nutricional encontrada',
        data: assessment
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  };

  /**
   * ✏️ ATUALIZAR AVALIAÇÃO NUTRICIONAL
   */
  updateAssessment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const nutritionistId = req.user!.userId;
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID da avaliação é obrigatório'
        });
        return;
      }

      const data: UpdateAssessmentRequest = req.body;

      const assessment = await NutritionalAssessmentService.update(id, nutritionistId, data);

      res.json({
        success: true,
        message: 'Avaliação nutricional atualizada com sucesso',
        data: assessment
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  };

  /**
   * 🗑️ EXCLUIR AVALIAÇÃO NUTRICIONAL
   */
  deleteAssessment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const nutritionistId = req.user!.userId;
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID da avaliação é obrigatório'
        });
        return;
      }

      await NutritionalAssessmentService.delete(id, nutritionistId);

      res.json({
        success: true,
        message: 'Avaliação nutricional excluída com sucesso'
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  };

  /**
   * 📊 ESTATÍSTICAS DE AVALIAÇÕES
   */
  getAssessmentStatistics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const nutritionistId = req.user!.userId;

      const statistics = await NutritionalAssessmentService.getStatistics(nutritionistId);

      res.json({
        success: true,
        message: 'Estatísticas de avaliações geradas com sucesso',
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
   * 📈 EVOLUÇÃO DO PACIENTE (IMC AO LONGO DO TEMPO)
   */
  getPatientEvolution = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

      const result = await NutritionalAssessmentService.findByPatientId(patientId, nutritionistId, 1, 100);
      
      const evolution = result.assessments
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .map(assessment => ({
          date: assessment.createdAt,
          weight: assessment.anthropometricData.weight,
          height: assessment.anthropometricData.height,
          bmi: assessment.anthropometricData.bmi,
          waistCircumference: assessment.anthropometricData.waistCircumference,
          bodyFatPercentage: assessment.anthropometricData.bodyFatPercentage
        }));

      res.json({
        success: true,
        message: 'Evolução do paciente gerada com sucesso',
        data: {
          patientId,
          evolution,
          totalAssessments: evolution.length,
          period: {
            start: evolution[0]?.date,
            end: evolution[evolution.length - 1]?.date
          }
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
   * 🏃‍♀️ ANÁLISE DE ATIVIDADE FÍSICA
   */
  getPhysicalActivityAnalysis = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

      const result = await NutritionalAssessmentService.findByPatientId(patientId, nutritionistId, 1, 10);
      
      const latestAssessment = result.assessments[0];
      if (!latestAssessment || !latestAssessment.physicalActivity) {
        res.status(404).json({
          success: false,
          message: 'Dados de atividade física não encontrados'
        });
        return;
      }

      const activity = latestAssessment.physicalActivity;
      const totalWeeklyMinutes = activity.activities.reduce((total, act) => 
        total + (act.duration * act.frequency), 0
      );

      const analysis = {
        weeklyFrequency: activity.weeklyFrequency,
        totalWeeklyMinutes,
        sedentaryTime: activity.sedentaryTime,
        activities: activity.activities,
        recommendations: {
          meetsWHOGuidelines: totalWeeklyMinutes >= 150, // WHO recomenda 150min/semana
          sedentaryWarning: activity.sedentaryTime > 8,
          suggestions: [] as string[]
        }
      };

      // Gerar sugestões baseadas na análise
      if (!analysis.recommendations.meetsWHOGuidelines) {
        analysis.recommendations.suggestions.push(
          'Recomenda-se aumentar a atividade física para pelo menos 150 minutos por semana'
        );
      }

      if (analysis.recommendations.sedentaryWarning) {
        analysis.recommendations.suggestions.push(
          'Reduzir o tempo sedentário para menos de 8 horas por dia'
        );
      }

      if (analysis.recommendations.suggestions.length === 0) {
        analysis.recommendations.suggestions.push(
          'Parabéns! Você está seguindo as recomendações de atividade física'
        );
      }

      res.json({
        success: true,
        message: 'Análise de atividade física gerada com sucesso',
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
   * 👤 BUSCAR AVALIAÇÕES DO PRÓPRIO PACIENTE
   */
}

export default new NutritionalAssessmentController();