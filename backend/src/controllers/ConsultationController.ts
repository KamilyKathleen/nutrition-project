/**
 * 🏥 CONTROLLER DE CONSULTAS
 * =========================
 * Endpoints para sistema completo de consultas
 */

import { Response, NextFunction } from 'express';
import ConsultationService from '../services/ConsultationService';
import { AuthenticatedRequest } from '../middlewares/auth';
import { AppError } from '../middlewares/errorHandler';

class ConsultationController {

  /**
   * 📅 CRIAR NOVA CONSULTA
   * POST /api/consultations
   */
  async createConsultation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const nutritionistId = req.user!.userId;
      const {
        patientId,
        scheduledDate,
        duration,
        type
      } = req.body;

      const consultation = await ConsultationService.create({
        patientId,
        nutritionistId,
        scheduledDate: new Date(scheduledDate),
        duration,
        type
      });

      res.status(201).json({
        success: true,
        message: 'Consulta agendada com sucesso',
        data: consultation
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 📋 LISTAR CONSULTAS DO NUTRICIONISTA
   * GET /api/consultations
   */
  async getConsultationsByNutritionist(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const nutritionistId = req.user!.userId;
      const page = Number.parseInt(req.query.page as string) || 1;
      const limit = Number.parseInt(req.query.limit as string) || 10;

      // Filtros opcionais
      const filters: any = {};
      if (req.query.status) filters.status = req.query.status as string;
      if (req.query.type) filters.type = req.query.type as string;
      if (req.query.patientId) filters.patientId = req.query.patientId as string;
      
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }

      const result = await ConsultationService.findByNutritionistId(
        nutritionistId,
        page,
        limit,
        filters
      );

      res.json({
        success: true,
        message: 'Consultas listadas com sucesso',
        data: result.consultations,
        pagination: {
          page: result.currentPage,
          limit,
          total: result.total,
          pages: result.pages
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🔍 BUSCAR CONSULTA POR ID
   * GET /api/consultations/:id
   */
  async getConsultationById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const nutritionistId = req.user!.role === 'nutritionist' ? req.user!.userId : undefined;

      if (!id) {
        return next(new AppError('ID da consulta é obrigatório', 400));
      }
      
      const consultation = await ConsultationService.findById(id, nutritionistId);

      if (!consultation) {
        throw new AppError('Consulta não encontrada', 404);
      }

      res.json({
        success: true,
        message: 'Consulta encontrada',
        data: consultation
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 📋 LISTAR CONSULTAS DO PACIENTE
   * GET /api/consultations/patient/:patientId
   */
  async getConsultationsByPatient(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { patientId } = req.params;
      const nutritionistId = req.user!.userId;
      const page = Number.parseInt(req.query.page as string) || 1;
      const limit = Number.parseInt(req.query.limit as string) || 10;

      const result = await ConsultationService.findByPatientId(
        patientId!,
        nutritionistId,
        page,
        limit
      );

      res.json({
        success: true,
        message: 'Histórico de consultas do paciente',
        data: result.consultations,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: result.pages
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 📅 AGENDA DO DIA
   * GET /api/consultations/today
   */
  async getTodaySchedule(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const nutritionistId = req.user!.userId;

      const consultations = await ConsultationService.getTodaySchedule(nutritionistId);

      res.json({
        success: true,
        message: 'Agenda de hoje',
        data: consultations,
        count: consultations.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ✏️ ATUALIZAR CONSULTA
   * PUT /api/consultations/:id
   */
  async updateConsultation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const nutritionistId = req.user!.userId;
      const updateData = req.body;

      // Converter datas
      if (updateData.scheduledDate) {
        updateData.scheduledDate = new Date(updateData.scheduledDate);
      }
      if (updateData.nextAppointment) {
        updateData.nextAppointment = new Date(updateData.nextAppointment);
      }

      const consultation = await ConsultationService.update(id!, nutritionistId, updateData);

      res.json({
        success: true,
        message: 'Consulta atualizada com sucesso',
        data: consultation
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ✅ FINALIZAR CONSULTA
   * PATCH /api/consultations/:id/complete
   */
  async completeConsultation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const nutritionistId = req.user!.userId;
      const {
        weight,
        bloodPressure,
        vitalSigns,
        chiefComplaint,
        symptoms,
        currentMedications,
        observations,
        recommendations,
        followUpInstructions,
        nextAppointment,
        prescriptions
      } = req.body;

      const updateData: any = {
        status: 'completed',
        weight,
        bloodPressure,
        vitalSigns,
        chiefComplaint,
        symptoms,
        currentMedications,
        observations,
        recommendations,
        followUpInstructions,
        prescriptions
      };

      if (nextAppointment) {
        updateData.nextAppointment = new Date(nextAppointment as string);
      }

      const consultation = await ConsultationService.update(id!, nutritionistId, updateData);

      res.json({
        success: true,
        message: 'Consulta finalizada com sucesso',
        data: consultation
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ❌ CANCELAR CONSULTA
   * PATCH /api/consultations/:id/cancel
   */
  async cancelConsultation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const nutritionistId = req.user!.userId;
      const { reason } = req.body;

      const consultation = await ConsultationService.cancel(id!, nutritionistId, reason);

      res.json({
        success: true,
        message: 'Consulta cancelada com sucesso',
        data: consultation
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🔄 REAGENDAR CONSULTA
   * PATCH /api/consultations/:id/reschedule
   */
  async rescheduleConsultation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const nutritionistId = req.user!.userId;
      const { newDate, reason } = req.body;

      const consultation = await ConsultationService.reschedule(
        id!,
        nutritionistId,
        new Date(newDate),
        reason
      );

      res.json({
        success: true,
        message: 'Consulta reagendada com sucesso',
        data: consultation
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🗑️ REMOVER CONSULTA
   * DELETE /api/consultations/:id
   */
  async deleteConsultation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const nutritionistId = req.user!.userId;

      await ConsultationService.delete(id!, nutritionistId);

      res.json({
        success: true,
        message: 'Consulta removida com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 📊 ESTATÍSTICAS DAS CONSULTAS
   * GET /api/consultations/stats/overview
   */
  async getConsultationStatistics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const nutritionistId = req.user!.userId;

      // Período opcional
      let period;
      if (req.query.startDate && req.query.endDate) {
        period = {
          startDate: new Date(req.query.startDate as string),
          endDate: new Date(req.query.endDate as string)
        };
      }

      const stats = await ConsultationService.getStatistics(nutritionistId, period);

      res.json({
        success: true,
        message: 'Estatísticas das consultas',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 📅 AGENDA SEMANAL
   * GET /api/consultations/schedule/week
   */
  async getWeeklySchedule(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const nutritionistId = req.user!.userId;
      
      // Calcular início e fim da semana
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const result = await ConsultationService.findByNutritionistId(
        nutritionistId,
        1,
        100, // Limite alto para pegar toda a semana
        {
          startDate: startOfWeek,
          endDate: endOfWeek,
          status: 'scheduled'
        }
      );

      // Agrupar por dia
      const weeklySchedule = result.consultations.reduce((acc: Record<string, any[]>, consultation) => {
        const dayStr = consultation.date?.toISOString().split('T')[0] || 'unknown';
        if (!acc[dayStr]) {
          acc[dayStr] = [];
        }
        acc[dayStr].push(consultation);
        return acc;
      }, {} as Record<string, any[]>);

      res.json({
        success: true,
        message: 'Agenda semanal',
        data: {
          period: {
            startDate: startOfWeek,
            endDate: endOfWeek
          },
          schedule: weeklySchedule,
          totalConsultations: result.consultations.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ⏰ CONSULTAS PRÓXIMAS (24h)
   * GET /api/consultations/upcoming
   */
  async getUpcomingConsultations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const nutritionistId = req.user!.userId;
      const hours = Number.parseInt(req.query.hours as string) || 24;
      
      const now = new Date();
      const futureTime = new Date(now.getTime() + (hours * 60 * 60 * 1000));

      const result = await ConsultationService.findByNutritionistId(
        nutritionistId,
        1,
        50,
        {
          startDate: now,
          endDate: futureTime,
          status: 'scheduled'
        }
      );

      res.json({
        success: true,
        message: `Próximas consultas (${hours}h)`,
        data: result.consultations,
        count: result.consultations.length
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ConsultationController();