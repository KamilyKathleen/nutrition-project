import { PatientInviteModel } from '../models/PatientInvite';
import { AppError } from '../middlewares/errorHandler';
import crypto from 'node:crypto';
import mongoose from 'mongoose';

export interface CreateInviteRequest {
  patientEmail?: string;
  patientName?: string;
  message?: string;
}

export interface PatientInvite {
  id: string;
  nutritionistId: string;
  patientEmail: string;
  patientName: string;
  inviteToken: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expiresAt: Date;
  sentAt: Date;
  acceptedAt?: Date;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 📧 SERVIÇO DE CONVITES DE PACIENTES
 */
export class PatientInviteService {
  /**
   * 📤 CRIAR CONVITE
   */
  async createInvite(data: CreateInviteRequest, nutritionistId: string): Promise<PatientInvite> {
    try {
      // Validar que tem email
      if (!data.patientEmail) {
        throw new AppError('Email do paciente é obrigatório', 400);
      }

      // 🔍 VALIDAR SE O USUÁRIO EXISTE NO SISTEMA
      const { UserService } = await import('../services/UserService');
      const userService = new UserService();
      
      const existingUser = await userService.findByEmail(data.patientEmail);
      if (!existingUser) {
        throw new AppError('O paciente deve ter uma conta no sistema antes de receber um convite. Peça para ele se registrar primeiro.', 400);
      }

      if (existingUser.role !== 'patient') {
        throw new AppError('O usuário deve ter role de paciente para receber convites', 400);
      }

      // Gerar token único
      const inviteToken = crypto.randomBytes(32).toString('hex');
      
      // Expirar em 7 dias
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Verificar se já existe convite pendente para o mesmo email/nutricionista
      if (data.patientEmail) {
        const existingInvite = await PatientInviteModel.findOne({
          nutritionistId: new mongoose.Types.ObjectId(nutritionistId),
          patientEmail: data.patientEmail,
          status: 'pending'
        });

        if (existingInvite) {
          throw new AppError('Já existe um convite pendente para este email', 400);
        }
      }

      const invite = new PatientInviteModel({
        nutritionistId: new mongoose.Types.ObjectId(nutritionistId),
        patientEmail: data.patientEmail,
        patientName: data.patientName,
        inviteToken,
        expiresAt,
        message: data.message,
        status: 'pending'
      });

      const savedInvite = await invite.save();
      
      return {
        id: (savedInvite._id as mongoose.Types.ObjectId).toString(),
        nutritionistId: savedInvite.nutritionistId.toString(),
        patientEmail: savedInvite.patientEmail || '',
        patientName: savedInvite.patientName || '',
        inviteToken: savedInvite.inviteToken,
        status: savedInvite.status as any,
        expiresAt: savedInvite.expiresAt,
        sentAt: savedInvite.sentAt,
        acceptedAt: savedInvite.acceptedAt,
        message: savedInvite.message,
        createdAt: savedInvite.createdAt,
        updatedAt: savedInvite.updatedAt
      } as PatientInvite;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao criar convite', 500);
    }
  }

  /**
   * � LISTAR CONVITES PENDENTES POR EMAIL
   */
  async getInvitesByEmail(email: string): Promise<PatientInvite[]> {
    try {
      const invites = await PatientInviteModel
        .find({ 
          patientEmail: email.toLowerCase(),
          status: 'pending',
          expiresAt: { $gt: new Date() } // Não expirados
        })
        .populate('nutritionistId', 'name email')
        .sort({ createdAt: -1 })
        .lean();

      return invites.map(invite => ({
        id: (invite._id as mongoose.Types.ObjectId).toString(),
        nutritionistId: invite.nutritionistId.toString(),
        patientEmail: invite.patientEmail || '',
        patientName: invite.patientName || '',
        inviteToken: invite.inviteToken,
        status: invite.status as any,
        expiresAt: invite.expiresAt,
        sentAt: invite.sentAt,
        acceptedAt: invite.acceptedAt,
        message: invite.message,
        createdAt: invite.createdAt,
        updatedAt: invite.updatedAt,
        nutritionist: (invite as any).nutritionistId // Dados populados do nutricionista
      }));
    } catch (error: any) {
      console.error('Erro ao buscar convites por email:', error);
      throw new AppError('Erro ao buscar convites', 500);
    }
  }

  /**
   * �📋 LISTAR CONVITES DO NUTRICIONISTA
   */
  async getInvitesByNutritionist(nutritionistId: string, status?: string): Promise<PatientInvite[]> {
    try {
      const filter: any = {
        nutritionistId: new mongoose.Types.ObjectId(nutritionistId)
      };

      if (status) {
        filter.status = status;
      }

      const invites = await PatientInviteModel
        .find(filter)
        .sort({ createdAt: -1 })
        .lean();

      return invites.map(invite => ({
        id: (invite._id as mongoose.Types.ObjectId).toString(),
        nutritionistId: invite.nutritionistId.toString(),
        patientEmail: invite.patientEmail || '',
        patientName: invite.patientName || '',
        inviteToken: invite.inviteToken,
        status: invite.status as any,
        expiresAt: invite.expiresAt,
        sentAt: invite.sentAt,
        ...(invite.acceptedAt && { acceptedAt: invite.acceptedAt }),
        ...(invite.message && { message: invite.message }),
        createdAt: invite.createdAt,
        updatedAt: invite.updatedAt
      })) as PatientInvite[];
    } catch (error) {
      throw new AppError('Erro ao listar convites', 500);
    }
  }

  /**
   * 🔍 BUSCAR CONVITE POR TOKEN
   */
  async getInviteByToken(token: string): Promise<PatientInvite | null> {
    try {
      const invite = await PatientInviteModel
        .findOne({ inviteToken: token })
        .populate('nutritionistId', 'name email')
        .lean();

      if (!invite) return null;

      return {
        id: (invite._id as mongoose.Types.ObjectId).toString(),
        nutritionistId: invite.nutritionistId.toString(),
        patientEmail: invite.patientEmail || '',
        patientName: invite.patientName || '',
        inviteToken: invite.inviteToken,
        status: invite.status as any,
        expiresAt: invite.expiresAt,
        sentAt: invite.sentAt,
        acceptedAt: invite.acceptedAt,
        message: invite.message,
        createdAt: invite.createdAt,
        updatedAt: invite.updatedAt
      } as PatientInvite;
    } catch (error) {
      throw new AppError('Erro ao buscar convite', 500);
    }
  }

  /**
   * ✅ ACEITAR CONVITE
   */
  async acceptInvite(token: string): Promise<PatientInvite> {
    try {
      const invite = await PatientInviteModel.findOne({ inviteToken: token });

      if (!invite) {
        throw new AppError('Convite não encontrado', 404);
      }

      if ((invite as any).status !== 'pending') {
        throw new AppError('Este convite não está mais válido', 400);
      }

      if (invite.expiresAt < new Date()) {
        (invite as any).status = 'expired';
        await invite.save();
        throw new AppError('Este convite expirou', 400);
      }

      (invite as any).status = 'accepted';
      invite.acceptedAt = new Date();
      await invite.save();

      return {
        id: (invite._id as mongoose.Types.ObjectId).toString(),
        nutritionistId: invite.nutritionistId.toString(),
        patientEmail: invite.patientEmail || '',
        patientName: invite.patientName || '',
        inviteToken: invite.inviteToken,
        status: invite.status as any,
        expiresAt: invite.expiresAt,
        sentAt: invite.sentAt,
        acceptedAt: invite.acceptedAt,
        message: invite.message,
        createdAt: invite.createdAt,
        updatedAt: invite.updatedAt
      } as PatientInvite;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao aceitar convite', 500);
    }
  }

  /**
   * ✅ ACEITAR CONVITE POR ID
   */
  async acceptInviteById(inviteId: string): Promise<PatientInvite> {
    try {
      const invite = await PatientInviteModel.findById(inviteId);

      if (!invite) {
        throw new AppError('Convite não encontrado', 404);
      }

      if (invite.status !== 'pending') {
        throw new AppError('Este convite não está mais válido', 400);
      }

      if (invite.expiresAt < new Date()) {
        invite.status = 'expired';
        await invite.save();
        throw new AppError('Este convite expirou', 400);
      }

      // 🔄 CRIAR RELACIONAMENTO PACIENTE-NUTRICIONISTA
      await this.createPatientRelationship(invite);

      invite.status = 'accepted';
      invite.acceptedAt = new Date();
      await invite.save();

      return {
        id: (invite._id as mongoose.Types.ObjectId).toString(),
        nutritionistId: invite.nutritionistId.toString(),
        patientEmail: invite.patientEmail || '',
        patientName: invite.patientName || '',
        inviteToken: invite.inviteToken,
        status: invite.status as any,
        expiresAt: invite.expiresAt,
        sentAt: invite.sentAt,
        acceptedAt: invite.acceptedAt,
        message: invite.message,
        createdAt: invite.createdAt,
        updatedAt: invite.updatedAt
      } as PatientInvite;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao aceitar convite', 500);
    }
  }

  /**
   * 🔗 CRIAR RELACIONAMENTO PACIENTE-NUTRICIONISTA
   * Cria automaticamente o User (para login) e o Patient (dados do paciente)
   */
  private async createPatientRelationship(invite: any): Promise<void> {
    try {
      // Importar o PatientModel
      const { PatientModel } = await import('../models/Patient');
      const { UserService } = await import('../services/UserService');
      
      const userService = new UserService();

      // Buscar o usuário pelo email - DEVE EXISTIR!
      const user = await userService.findByEmail(invite.patientEmail);
      
      if (!user) {
        throw new AppError('Usuário não encontrado. O paciente deve ter uma conta no sistema antes de aceitar o convite.', 404);
      }

      // Verificar se já existe um relacionamento
      const existingPatient = await PatientModel.findOne({
        email: invite.patientEmail,
        nutritionistId: invite.nutritionistId
      });

      if (existingPatient) {
        console.log(`📋 Relacionamento já existe entre ${invite.patientEmail} e nutricionista ${invite.nutritionistId}`);
        return;
      }

      // Criar registro do paciente
      const patientData = {
        name: invite.patientName || user.name,
        email: invite.patientEmail,
        birthDate: new Date('1990-01-01'), // Data padrão - pode ser atualizada depois
        gender: 'other', // Gênero padrão - pode ser atualizado depois
        nutritionistId: invite.nutritionistId,
        isActive: true
      };

      const newPatient = new PatientModel(patientData);
      await newPatient.save();

      console.log(`✅ Relacionamento criado: Paciente ${invite.patientEmail} vinculado ao nutricionista ${invite.nutritionistId}`);
    } catch (error: any) {
      console.error('❌ Erro ao criar relacionamento:', error);
      // Não vamos falhar o aceite do convite por causa disso
      // throw error;
    }
  }

  /**
   * ❌ REJEITAR CONVITE
   */
  async rejectInvite(inviteId: string): Promise<void> {
    try {
      const invite = await PatientInviteModel.findById(inviteId);

      if (!invite) {
        throw new AppError('Convite não encontrado', 404);
      }

      if (invite.status !== 'pending') {
        throw new AppError('Este convite não está mais válido', 400);
      }

      invite.status = 'rejected';
      await invite.save();
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao rejeitar convite', 500);
    }
  }

  /**
   * 🗑️ CANCELAR CONVITE
   */
  async cancelInvite(inviteId: string, nutritionistId: string): Promise<void> {
    try {
      const invite = await PatientInviteModel.findOne({
        _id: new mongoose.Types.ObjectId(inviteId),
        nutritionistId: new mongoose.Types.ObjectId(nutritionistId)
      });

      if (!invite) {
        throw new AppError('Convite não encontrado', 404);
      }

      if ((invite as any).status !== 'pending') {
        throw new AppError('Apenas convites pendentes podem ser cancelados', 400);
      }

      (invite as any).status = 'cancelled';
      await invite.save();
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao cancelar convite', 500);
    }
  }
}