/**
 * 🏥 SERVIÇO DE CONSULTAS
 * =======================
 * Lógica de negócio para sistema de consultas
 */

import mongoose from 'mongoose';
import ConsultationModel from '../models/Consultation';
import { PatientModel } from '../models/Patient';
import { AppError } from '../middlewares/errorHandler';
import { Consultation } from '../types';

export class ConsultationService {
  
  /**
   * 📅 CRIAR NOVA CONSULTA
   */
  async create(data: {
    patientId: string;
    nutritionistId: string;
    scheduledDate: Date;
    duration?: number;
    type?: 'initial' | 'follow_up' | 'emergency' | 'online' | 'in_person';
  }): Promise<Consultation> {
    try {
      console.log('📋 Dados recebidos para criar consulta:', {
        patientId: data.patientId,
        nutritionistId: data.nutritionistId,
        scheduledDate: data.scheduledDate,
        duration: data.duration,
        type: data.type
      });

      // Verificar se o paciente existe e pertence ao nutricionista
      const patient = await PatientModel.findOne({
        _id: new mongoose.Types.ObjectId(data.patientId),
        nutritionistId: new mongoose.Types.ObjectId(data.nutritionistId)
      });

      console.log('🔍 Paciente encontrado:', patient ? 'Sim' : 'Não');

      if (!patient) {
        throw new AppError('Paciente não encontrado ou não pertence a este nutricionista', 404);
      }

      // Validar data futura
      const scheduledDate = new Date(data.scheduledDate);
      console.log('📅 Data agendada:', scheduledDate);
      console.log('📅 Data atual:', new Date());
      
      if (scheduledDate <= new Date()) {
        throw new AppError('Data da consulta deve ser no futuro', 400);
      }

      console.log('🏗️ Criando consulta...');
      const consultation = new ConsultationModel({
        patientId: new mongoose.Types.ObjectId(data.patientId),
        nutritionistId: new mongoose.Types.ObjectId(data.nutritionistId),
        scheduledDate: scheduledDate,
        duration: data.duration || 60,
        type: data.type || 'follow_up',
        status: 'scheduled'
      });

      console.log('💾 Salvando consulta...');
      const savedConsultation = await consultation.save();
      console.log('✅ Consulta salva:', savedConsultation._id);
      
      await savedConsultation.populate('patientId', 'name email');

      return this.mapToInterface(savedConsultation);
    } catch (error: any) {
      console.error('❌ Erro ao criar consulta:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao criar consulta: ' + error.message, 500);
    }
  }

  /**
   * 🔍 BUSCAR POR ID
   */
  async findById(id: string, nutritionistId?: string): Promise<Consultation | null> {
    try {
      const query: any = { _id: new mongoose.Types.ObjectId(id) };
      if (nutritionistId) {
        query.nutritionistId = new mongoose.Types.ObjectId(nutritionistId);
      }

      const consultation = await ConsultationModel
        .findOne(query)
        .populate('patientId', 'name email')
        .lean();

      if (!consultation) return null;

      return this.mapToInterface(consultation);
    } catch (error: any) {
      throw new AppError('Erro ao buscar consulta', 500);
    }
  }

  /**
   * 📋 LISTAR CONSULTAS DO NUTRICIONISTA
   */
  async findByNutritionistId(
    nutritionistId: string,
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: string;
      startDate?: Date;
      endDate?: Date;
      patientId?: string;
      type?: string;
    }
  ): Promise<{
    consultations: Consultation[];
    total: number;
    pages: number;
    currentPage: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      
      // Construir query
      const query: any = {
        nutritionistId: new mongoose.Types.ObjectId(nutritionistId)
      };

      if (filters?.status) {
        query.status = filters.status;
      }

      if (filters?.type) {
        query.type = filters.type;
      }

      if (filters?.patientId) {
        query.patientId = new mongoose.Types.ObjectId(filters.patientId);
      }

      if (filters?.startDate || filters?.endDate) {
        query.scheduledDate = {};
        if (filters.startDate) {
          query.scheduledDate.$gte = filters.startDate;
        }
        if (filters.endDate) {
          query.scheduledDate.$lte = filters.endDate;
        }
      }

      const [consultations, total] = await Promise.all([
        ConsultationModel
          .find(query)
          .populate('patientId', 'name email phone')
          .sort({ scheduledDate: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        ConsultationModel.countDocuments(query)
      ]);

      return {
        consultations: consultations.map(this.mapToInterface),
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      };
    } catch (error: any) {
      throw new AppError('Erro ao listar consultas', 500);
    }
  }

  /**
   * 📋 LISTAR CONSULTAS DO PACIENTE
   */
  async findByPatientId(
    patientId: string,
    nutritionistId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    consultations: Consultation[];
    total: number;
    pages: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const [consultations, total] = await Promise.all([
        ConsultationModel
          .find({
            patientId: new mongoose.Types.ObjectId(patientId),
            nutritionistId: new mongoose.Types.ObjectId(nutritionistId)
          })
          .populate('patientId', 'name email phone')
          .sort({ scheduledDate: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        ConsultationModel.countDocuments({
          patientId: new mongoose.Types.ObjectId(patientId),
          nutritionistId: new mongoose.Types.ObjectId(nutritionistId)
        })
      ]);

      return {
        consultations: consultations.map(this.mapToInterface),
        total,
        pages: Math.ceil(total / limit)
      };
    } catch (error: any) {
      throw new AppError('Erro ao listar consultas do paciente', 500);
    }
  }

  /**
   * 📅 BUSCAR AGENDA DO DIA
   */
  async getTodaySchedule(nutritionistId: string): Promise<Consultation[]> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const consultations = await ConsultationModel
        .find({
          nutritionistId: new mongoose.Types.ObjectId(nutritionistId),
          scheduledDate: {
            $gte: startOfDay,
            $lte: endOfDay
          },
          status: { $in: ['scheduled', 'rescheduled'] }
        })
        .populate('patientId', 'name phone')
        .sort({ scheduledDate: 1 })
        .lean();

      return consultations.map(this.mapToInterface);
    } catch (error: any) {
      throw new AppError('Erro ao buscar agenda do dia', 500);
    }
  }

  /**
   * ✏️ ATUALIZAR CONSULTA
   */
  async update(
    id: string,
    nutritionistId: string,
    data: Partial<{
      scheduledDate: Date;
      duration: number;
      type: string;
      status: string;
      weight: number;
      bloodPressure: { systolic: number; diastolic: number };
      vitalSigns: {
        heartRate?: number;
        temperature?: number;
        oxygenSaturation?: number;
      };
      chiefComplaint: string;
      symptoms: string[];
      currentMedications: string;
      observations: string;
      recommendations: string;
      followUpInstructions: string;
      nextAppointment: Date;
      prescriptions: Array<{
        type: 'diet' | 'supplement' | 'exercise' | 'other';
        description: string;
        instructions: string;
        duration?: string;
      }>;
    }>
  ): Promise<Consultation> {
    try {
      // Validações específicas
      if (data.scheduledDate && data.scheduledDate <= new Date()) {
        throw new AppError('Nova data deve ser no futuro', 400);
      }

      if (data.status === 'completed' && !data.observations) {
        throw new AppError('Observações são obrigatórias para finalizar consulta', 400);
      }

      if (data.status === 'completed' && !data.recommendations) {
        throw new AppError('Recomendações são obrigatórias para finalizar consulta', 400);
      }

      const updateData: any = { ...data };
      
      // Se está completando a consulta, definir data real
      if (data.status === 'completed' && !updateData.actualDate) {
        updateData.actualDate = new Date();
      }

      const consultation = await ConsultationModel
        .findOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(id),
            nutritionistId: new mongoose.Types.ObjectId(nutritionistId)
          },
          updateData,
          { new: true, runValidators: true }
        )
        .populate('patientId', 'name email phone');

      if (!consultation) {
        throw new AppError('Consulta não encontrada', 404);
      }

      return this.mapToInterface(consultation);
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao atualizar consulta: ' + error.message, 500);
    }
  }

  /**
   * ❌ CANCELAR CONSULTA
   */
  async cancel(
    id: string,
    nutritionistId: string,
    reason?: string
  ): Promise<Consultation> {
    try {
      const consultation = await ConsultationModel
        .findOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(id),
            nutritionistId: new mongoose.Types.ObjectId(nutritionistId),
            status: { $in: ['scheduled', 'rescheduled'] }
          },
          {
            status: 'cancelled',
            observations: reason ? `Cancelada. Motivo: ${reason}` : 'Consulta cancelada'
          },
          { new: true }
        )
        .populate('patientId', 'name email phone');

      if (!consultation) {
        throw new AppError('Consulta não encontrada ou não pode ser cancelada', 404);
      }

      return this.mapToInterface(consultation);
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao cancelar consulta', 500);
    }
  }

  /**
   * 📊 ESTATÍSTICAS DO NUTRICIONISTA
   */
  async getStatistics(nutritionistId: string, period?: {
    startDate: Date;
    endDate: Date;
  }): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    avgDuration: number;
    upcomingCount: number;
    todayCount: number;
  }> {
    try {
      const query: any = {
        nutritionistId: new mongoose.Types.ObjectId(nutritionistId)
      };

      if (period) {
        query.scheduledDate = {
          $gte: period.startDate,
          $lte: period.endDate
        };
      }

      const [statusStats, typeStats, overallStats] = await Promise.all([
        // Por status
        ConsultationModel.aggregate([
          { $match: query },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        // Por tipo
        ConsultationModel.aggregate([
          { $match: query },
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ]),
        // Estatísticas gerais
        ConsultationModel.aggregate([
          { $match: query },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              avgDuration: { $avg: '$duration' }
            }
          }
        ])
      ]);

      // Contar próximas consultas
      const upcomingCount = await ConsultationModel.countDocuments({
        nutritionistId: new mongoose.Types.ObjectId(nutritionistId),
        scheduledDate: { $gte: new Date() },
        status: { $in: ['scheduled', 'rescheduled'] }
      });

      // Contar consultas de hoje
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));
      
      const todayCount = await ConsultationModel.countDocuments({
        nutritionistId: new mongoose.Types.ObjectId(nutritionistId),
        scheduledDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['scheduled', 'rescheduled'] }
      });

      // Formatar resultados
      const byStatus: Record<string, number> = {};
      statusStats.forEach(stat => {
        byStatus[stat._id] = stat.count;
      });

      const byType: Record<string, number> = {};
      typeStats.forEach(stat => {
        byType[stat._id] = stat.count;
      });

      return {
        total: overallStats[0]?.total || 0,
        byStatus,
        byType,
        avgDuration: Math.round(overallStats[0]?.avgDuration || 0),
        upcomingCount,
        todayCount
      };
    } catch (error: any) {
      throw new AppError('Erro ao gerar estatísticas', 500);
    }
  }

  /**
   * 🔄 REAGENDAR CONSULTA
   */
  async reschedule(
    id: string,
    nutritionistId: string,
    newDate: Date,
    reason?: string
  ): Promise<Consultation> {
    try {
      if (newDate <= new Date()) {
        throw new AppError('Nova data deve ser no futuro', 400);
      }

      const consultation = await ConsultationModel
        .findOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(id),
            nutritionistId: new mongoose.Types.ObjectId(nutritionistId),
            status: { $in: ['scheduled'] }
          },
          {
            scheduledDate: newDate,
            status: 'rescheduled',
            observations: reason ? 
              `Reagendada para ${newDate.toLocaleString()}. Motivo: ${reason}` :
              `Reagendada para ${newDate.toLocaleString()}`
          },
          { new: true, runValidators: true }
        )
        .populate('patientId', 'name email phone');

      if (!consultation) {
        throw new AppError('Consulta não encontrada ou não pode ser reagendada', 404);
      }

      return this.mapToInterface(consultation);
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao reagendar consulta: ' + error.message, 500);
    }
  }

  /**
   * 🗑️ REMOVER CONSULTA
   */
  async delete(id: string, nutritionistId: string): Promise<void> {
    try {
      const consultation = await ConsultationModel.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(id),
        nutritionistId: new mongoose.Types.ObjectId(nutritionistId),
        status: { $in: ['scheduled', 'cancelled'] } // Não permitir deletar consultas concluídas
      });

      if (!consultation) {
        throw new AppError('Consulta não encontrada ou não pode ser removida', 404);
      }
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao remover consulta', 500);
    }
  }

  /**
   * 🔄 HELPER: Converter documento para interface
   */
  private mapToInterface(doc: any): Consultation {
    return {
      id: doc._id.toString(),
      patientId: doc.patientId._id?.toString() || doc.patientId.toString(),
      patientName: doc.patientId.name || undefined,
      studentId: doc.nutritionistId._id?.toString() || doc.nutritionistId.toString(),
      date: doc.scheduledDate,
      duration: doc.duration,
      type: doc.type,
      weight: doc.weight,
      bloodPressure: doc.bloodPressure,
      observations: doc.observations,
      recommendations: doc.recommendations,
      nextAppointment: doc.nextAppointment,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }
}

export default new ConsultationService();