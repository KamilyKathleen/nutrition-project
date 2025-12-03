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
      console.log('🎯 Controller - Dados recebidos:', req.body);
      console.log('👤 Controller - Usuário:', req.user);
      
      const nutritionistId = req.user!.userId;
      const {
        patientId,
        scheduledDate,
        duration,
        type,
        notes
      } = req.body;

      console.log('📋 Controller - Processando dados:', {
        patientId,
        nutritionistId,
        scheduledDate,
        duration,
        type,
        notes
      });

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
      console.error('❌ Controller - Erro:', error);
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
   * ✅ MARCAR CONSULTA COMO REALIZADA
   * PATCH /api/consultations/:id/mark-completed
   */
  async markAsCompleted(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const nutritionistId = req.user!.userId;

      console.log('🎯 [MARK-COMPLETED] Iniciando...');
      console.log('📋 Consultation ID:', id);
      console.log('👨‍⚕️ Nutritionist ID:', nutritionistId);
      console.log('📦 Body recebido:', req.body);
      console.log('🔑 Headers Authorization:', req.headers.authorization ? 'Presente' : 'Ausente');

      if (!id) {
        console.error('❌ ID da consulta não fornecido');
        res.status(400).json({
          success: false,
          message: 'ID da consulta é obrigatório'
        });
        return;
      }

      console.log('⏳ Chamando ConsultationService.update...');
      const consultation = await ConsultationService.update(id, nutritionistId, {
        status: 'completed',
        actualDate: new Date()
      });

      console.log('✅ Consulta atualizada com sucesso:', consultation);

      res.json({
        success: true,
        message: 'Consulta marcada como realizada',
        data: consultation
      });
    } catch (error: any) {
      console.error('🔥 ERRO em markAsCompleted:', error);
      console.error('📊 Stack:', error.stack);
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

  /**
   * ⏰ PACIENTE VER SUAS PRÓXIMAS CONSULTAS
   * GET /api/consultations/my-upcoming
   */
  async getMyUpcomingConsultations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const userEmail = req.user!.email;
      
      console.log('🔍 Buscando consultas para paciente:', { userId, userEmail });
      
      // Buscar paciente por userId ou email
      const PatientModel = require('../models/Patient').PatientModel;
      let patient = await PatientModel.findOne({ userId }).lean();
      
      if (!patient) {
        console.log('🔍 Não encontrado por userId, tentando por email...');
        patient = await PatientModel.findOne({ email: userEmail }).lean();
      }
      
      if (!patient) {
        res.status(404).json({
          success: false,
          message: 'Paciente não encontrado'
        });
        return;
      }

      console.log('✅ Paciente encontrado:', patient._id);
      
      // Buscar consultas futuras do paciente
      const consultations = await ConsultationService.findUpcomingByPatientId(
        patient._id.toString()
      );

      console.log('✅ Consultas encontradas:', consultations.length);

      res.json({
        success: true,
        message: 'Próximas consultas do paciente',
        data: consultations
      });
    } catch (error) {
      console.error('🔥 Erro ao buscar consultas do paciente:', error);
      next(error);
    }
  }
}

export default new ConsultationController();
