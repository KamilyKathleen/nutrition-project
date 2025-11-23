import { InternalNotificationService } from '../models/InternalNotification';
import { UserModel } from '../models/User';
import { PatientModel } from '../models/Patient';
import { FirebaseAuthService } from '../lib/firebase';
import crypto from 'crypto';

/**
 * 📧 SISTEMA DE CONVITES INTERNOS
 * ===============================
 * Substitui completamente o sistema de emails por notificações internas
 */

export interface IInternalInvite {
  id: string;
  nutritionistId: string; // Firebase UID
  patientEmail: string;
  patientName: string;
  inviteToken: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expiresAt: Date;
  sentAt: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  message?: string;
}

export class InternalInviteService {

  /**
   * 📤 Enviar convite interno (SEM email)
   */
  static async sendInternalInvite(data: {
    nutritionistId: string; // Firebase UID
    patientEmail: string;
    patientName: string;
    message?: string;
  }) {
    try {
      // Verificar se nutricionista existe
      const nutritionist = await UserModel.findOne({ 
        firebaseUid: data.nutritionistId,
        role: 'nutritionist' 
      });

      if (!nutritionist) {
        throw new Error('Nutricionista não encontrado');
      }

      // Verificar se já existe paciente com este email
      const existingPatient = await PatientModel.findOne({
        email: data.patientEmail,
        nutritionistId: data.nutritionistId
      });

      if (existingPatient) {
        throw new Error('Paciente já está vinculado a este nutricionista');
      }

      // Gerar token único
      const inviteToken = crypto.randomBytes(32).toString('hex');

      // Criar convite no MongoDB
      const invite = {
        nutritionistId: data.nutritionistId,
        patientEmail: data.patientEmail,
        patientName: data.patientName,
        inviteToken,
        status: 'pending' as const,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        sentAt: new Date(),
        message: data.message
      };

      // Salvar no banco (usando coleção temporária ou campo no user)
      // Por enquanto vamos usar uma collection específica

      // ESTRATÉGIA: Criar uma notificação para quando o usuário fizer login
      // Isso funciona mesmo se o usuário ainda não tem conta

      const notificationData = {
        type: 'invite' as const,
        title: `Convite do Dr(a). ${nutritionist.name} 👨‍⚕️`,
        message: data.message 
          ? `"${data.message}" - Aceite para começar seu acompanhamento nutricional.`
          : 'Você foi convidado para acompanhamento nutricional. Aceite para começar.',
        actionRequired: true,
        actionUrl: `/aceitar-convite/${inviteToken}`,
        actionLabel: 'Aceitar Convite',
        priority: 'urgent' as const,
        expiresAt: invite.expiresAt,
        createdBy: data.nutritionistId,
        data: {
          inviteToken,
          nutritionistName: nutritionist.name,
          nutritionistCrn: nutritionist.crn,
          patientEmail: data.patientEmail,
          patientName: data.patientName,
          message: data.message
        }
      };

      // Primeiro, vamos verificar se o usuário já tem conta Firebase
      let targetUserId = null;
      
      try {
        // Se o usuário já existe, criar notificação para ele
        const existingUser = await UserModel.findOne({ email: data.patientEmail });
        if (existingUser && existingUser.firebaseUid) {
          targetUserId = existingUser.firebaseUid;
        }
      } catch (error) {
        // Usuário não existe ainda
      }

      if (targetUserId) {
        // Usuário já tem conta - criar notificação diretamente
        await InternalNotificationService.create({
          userId: targetUserId,
          ...notificationData
        });
      } else {
        // Usuário não tem conta - salvar convite pendente
        // Será criado quando o usuário se registrar
        const pendingInvite = new PendingInviteModel({
          ...invite,
          notificationData
        });
        await pendingInvite.save();
      }

      return {
        success: true,
        invite: {
          id: inviteToken,
          ...invite
        },
        message: targetUserId 
          ? 'Convite enviado! O paciente foi notificado.'
          : 'Convite criado! O paciente será notificado quando fizer login.'
      };

    } catch (error) {
      console.error('Erro ao enviar convite interno:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * 🔍 Buscar convite por token
   */
  static async getInviteByToken(inviteToken: string) {
    try {
      // Buscar em convites pendentes
      const pendingInvite = await PendingInviteModel.findOne({ inviteToken });
      
      if (pendingInvite) {
        // Verificar se não expirou
        if (pendingInvite.expiresAt < new Date()) {
          pendingInvite.status = 'expired';
          await pendingInvite.save();
          
          throw new Error('Convite expirado');
        }

        return {
          success: true,
          invite: pendingInvite
        };
      }

      throw new Error('Convite não encontrado');
    } catch (error) {
      console.error('Erro ao buscar convite:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * ✅ Aceitar convite interno
   */
  static async acceptInvite(inviteToken: string, userData: {
    firebaseUid: string;
    name: string;
    email: string;
    phone: string;
    birthDate: Date;
    gender: string;
    address?: any;
  }) {
    try {
      // Buscar convite
      const inviteResult = await this.getInviteByToken(inviteToken);
      if (!inviteResult.success) {
        throw new Error(inviteResult.error);
      }

      const invite = inviteResult.invite;
      if (!invite) {
        throw new Error('Convite não encontrado');
      }

      // Verificar se o email confere
      if (invite.patientEmail !== userData.email) {
        throw new Error('Email não confere com o convite');
      }

      // Criar o paciente
      const patient = new PatientModel({
        firebaseUid: userData.firebaseUid,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        birthDate: userData.birthDate,
        gender: userData.gender,
        address: userData.address || {},
        nutritionistId: invite.nutritionistId,
        invitationStatus: 'accepted',
        acceptedAt: new Date()
      });

      await patient.save();

      // Atualizar status do convite
      await PendingInviteModel.findOneAndUpdate(
        { inviteToken },
        {
          status: 'accepted',
          acceptedAt: new Date()
        }
      );

      // Criar notificação de boas-vindas para o paciente
      await InternalNotificationService.createWelcomeNotification(
        userData.firebaseUid,
        userData.name,
        'patient'
      );

      // Criar notificação para o nutricionista
      const nutritionist = await UserModel.findOne({ 
        firebaseUid: invite.nutritionistId 
      });

      if (nutritionist && nutritionist.firebaseUid) {
        await InternalNotificationService.create({
          userId: nutritionist.firebaseUid,
          type: 'reminder',
          title: 'Novo Paciente Aceito! 🎉',
          message: `${userData.name} aceitou seu convite e agora é seu paciente.`,
          actionUrl: '/pacientes',
          actionLabel: 'Ver Pacientes',
          priority: 'medium'
        });
      }

      return {
        success: true,
        patient,
        message: 'Convite aceito com sucesso!'
      };

    } catch (error) {
      console.error('Erro ao aceitar convite:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * ❌ Rejeitar convite
   */
  static async rejectInvite(inviteToken: string, reason?: string) {
    try {
      const result = await PendingInviteModel.findOneAndUpdate(
        { inviteToken, status: 'pending' },
        {
          status: 'rejected',
          rejectedAt: new Date(),
          message: reason
        },
        { new: true }
      );

      if (!result) {
        throw new Error('Convite não encontrado ou já processado');
      }

      return {
        success: true,
        message: 'Convite rejeitado'
      };

    } catch (error) {
      console.error('Erro ao rejeitar convite:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * 📋 Listar convites do nutricionista
   */
  static async getNutritionistInvites(nutritionistId: string, filters: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}) {
    try {
      const { status, page = 1, limit = 20 } = filters;
      const skip = (page - 1) * limit;

      const query: any = { nutritionistId };
      if (status) {
        query.status = status;
      }

      const invites = await PendingInviteModel
        .find(query)
        .sort({ sentAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      const total = await PendingInviteModel.countDocuments(query);

      return {
        success: true,
        invites,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: total
        }
      };

    } catch (error) {
      console.error('Erro ao buscar convites:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * 🔄 Processar convites pendentes para novo usuário
   */
  static async processPendingInvitesForUser(email: string, firebaseUid: string) {
    try {
      const pendingInvites = await PendingInviteModel.find({
        patientEmail: email,
        status: 'pending',
        expiresAt: { $gt: new Date() }
      });

      if (pendingInvites.length === 0) {
        return { success: true, processedCount: 0 };
      }

      let processedCount = 0;

      for (const invite of pendingInvites) {
        // Criar notificação para o usuário
        const notificationResult = await InternalNotificationService.create({
          userId: firebaseUid,
          ...invite.notificationData
        });

        if (notificationResult.success) {
          processedCount++;
        }
      }

      return {
        success: true,
        processedCount,
        message: `${processedCount} convites pendentes foram processados`
      };

    } catch (error) {
      console.error('Erro ao processar convites pendentes:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

// Modelo para convites pendentes (antes do usuário se registrar)
import mongoose from 'mongoose';

const pendingInviteSchema = new mongoose.Schema({
  nutritionistId: { type: String, required: true },
  patientEmail: { type: String, required: true, index: true },
  patientName: { type: String, required: true },
  inviteToken: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'expired'],
    default: 'pending'
  },
  expiresAt: { type: Date, required: true },
  sentAt: { type: Date, default: Date.now },
  acceptedAt: Date,
  rejectedAt: Date,
  message: String,
  notificationData: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

pendingInviteSchema.index({ inviteToken: 1 });
pendingInviteSchema.index({ nutritionistId: 1 });
pendingInviteSchema.index({ patientEmail: 1, status: 1 });

export const PendingInviteModel = mongoose.model('PendingInvite', pendingInviteSchema);