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
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
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
      // Validar que tem email OU nome
      if (!data.patientEmail && !data.patientName) {
        throw new AppError('Email ou nome do paciente é obrigatório', 400);
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
          status: 'PENDING'
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
        status: 'PENDING'
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
   * 📋 LISTAR CONVITES DO NUTRICIONISTA
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
        id: invite._id.toString(),
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
        id: invite._id.toString(),
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

      if ((invite as any).status !== 'PENDING') {
        throw new AppError('Este convite não está mais válido', 400);
      }

      if (invite.expiresAt < new Date()) {
        (invite as any).status = 'EXPIRED';
        await invite.save();
        throw new AppError('Este convite expirou', 400);
      }

      (invite as any).status = 'ACCEPTED';
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
   * ❌ CANCELAR CONVITE
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

      if ((invite as any).status !== 'PENDING') {
        throw new AppError('Apenas convites pendentes podem ser cancelados', 400);
      }

      (invite as any).status = 'CANCELLED';
      await invite.save();
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao cancelar convite', 500);
    }
  }
}