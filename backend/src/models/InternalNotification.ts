import mongoose, { Schema, Document } from 'mongoose';

/**
 * 🔔 SISTEMA DE NOTIFICAÇÕES INTERNAS
 * ===================================
 * Substitui completamente o sistema de emails
 */

export interface IInternalNotification extends Document {
  userId: string; // Firebase UID
  type: 'invite' | 'consultation' | 'diet_plan' | 'assessment' | 'welcome' | 'reminder';
  title: string;
  message: string;
  data?: any; // Dados específicos da notificação
  read: boolean;
  actionRequired: boolean;
  actionUrl?: string;
  actionLabel?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: Date;
  createdBy?: string; // UID de quem criou
  createdAt: Date;
  readAt?: Date;
}

const internalNotificationSchema = new Schema<IInternalNotification>({
  userId: {
    type: String,
    required: [true, 'ID do usuário é obrigatório'],
    index: true
  },
  type: {
    type: String,
    enum: ['invite', 'consultation', 'diet_plan', 'assessment', 'welcome', 'reminder'],
    required: [true, 'Tipo da notificação é obrigatório']
  },
  title: {
    type: String,
    required: [true, 'Título é obrigatório'],
    maxlength: [100, 'Título deve ter no máximo 100 caracteres']
  },
  message: {
    type: String,
    required: [true, 'Mensagem é obrigatória'],
    maxlength: [500, 'Mensagem deve ter no máximo 500 caracteres']
  },
  data: {
    type: Schema.Types.Mixed,
    default: {}
  },
  read: {
    type: Boolean,
    default: false
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String,
    trim: true
  },
  actionLabel: {
    type: String,
    trim: true,
    maxlength: [50, 'Label da ação deve ter no máximo 50 caracteres']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  expiresAt: {
    type: Date
  },
  createdBy: {
    type: String, // Firebase UID
    index: true
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices para performance
internalNotificationSchema.index({ userId: 1, read: 1 });
internalNotificationSchema.index({ userId: 1, createdAt: -1 });
internalNotificationSchema.index({ type: 1 });
internalNotificationSchema.index({ expiresAt: 1 }); // Para limpeza automática

// Transform function
internalNotificationSchema.set('toJSON', {
  transform: function(doc: any, ret: any) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const InternalNotificationModel = mongoose.model<IInternalNotification>(
  'InternalNotification', 
  internalNotificationSchema
);

/**
 * 🔔 SERVIÇO DE NOTIFICAÇÕES INTERNAS
 * ===================================
 */
export class InternalNotificationService {

  /**
   * ✨ Criar notificação
   */
  static async create(data: {
    userId: string;
    type: IInternalNotification['type'];
    title: string;
    message: string;
    data?: any;
    actionRequired?: boolean;
    actionUrl?: string;
    actionLabel?: string;
    priority?: IInternalNotification['priority'];
    expiresAt?: Date;
    createdBy?: string;
  }) {
    try {
      const notification = new InternalNotificationModel(data);
      const saved = await notification.save();
      
      // TODO: Implementar push notification aqui se necessário
      
      return {
        success: true,
        notification: saved
      };
    } catch (error_: unknown) {
      console.error('Erro ao criar notificação:', error_);
      return {
        success: false,
        error: (error_ as any)?.message || 'Erro desconhecido'
      };
    }
  }

  /**
   * 📋 Listar notificações do usuário
   */
  static async getUserNotifications(userId: string, options: {
    read?: boolean;
    limit?: number;
    page?: number;
    type?: string;
  } = {}) {
    try {
      const {
        read,
        limit = 20,
        page = 1,
        type
      } = options;

      const query: any = { userId };
      
      if (read !== undefined) {
        query.read = read;
      }
      
      if (type) {
        query.type = type;
      }

      // Remover notificações expiradas
      query.$or = [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ];

      const skip = (page - 1) * limit;

      const notifications = await InternalNotificationModel
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      const total = await InternalNotificationModel.countDocuments(query);
      const unreadCount = await InternalNotificationModel.countDocuments({
        userId,
        read: false,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } }
        ]
      });

      return {
        success: true,
        notifications,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: total
        },
        unreadCount
      };
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return {
        success: false,
        error: (error as any)?.message || "Erro desconhecido"
      };
    }
  }

  /**
   * ✅ Marcar como lida
   */
  static async markAsRead(notificationId: string, userId: string) {
    try {
      const updated = await InternalNotificationModel.findOneAndUpdate(
        { _id: notificationId, userId },
        { 
          read: true,
          readAt: new Date()
        },
        { new: true }
      );

      if (!updated) {
        return {
          success: false,
          error: 'Notificação não encontrada'
        };
      }

      return {
        success: true,
        notification: updated
      };
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      return {
        success: false,
        error: (error as any)?.message || "Erro desconhecido"
      };
    }
  }

  /**
   * ✅ Marcar todas como lidas
   */
  static async markAllAsRead(userId: string) {
    try {
      const result = await InternalNotificationModel.updateMany(
        { userId, read: false },
        { 
          read: true,
          readAt: new Date()
        }
      );

      return {
        success: true,
        modifiedCount: result.modifiedCount
      };
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      return {
        success: false,
        error: (error as any)?.message || "Erro desconhecido"
      };
    }
  }

  /**
   * 🗑️ Deletar notificação
   */
  static async delete(notificationId: string, userId: string) {
    try {
      const deleted = await InternalNotificationModel.findOneAndDelete({
        _id: notificationId,
        userId
      });

      if (!deleted) {
        return {
          success: false,
          error: 'Notificação não encontrada'
        };
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      return {
        success: false,
        error: (error as any)?.message || "Erro desconhecido"
      };
    }
  }

  /**
   * 🧹 Limpar notificações expiradas
   */
  static async cleanExpired() {
    try {
      const result = await InternalNotificationModel.deleteMany({
        expiresAt: { $lt: new Date() }
      });

      console.log(`🧹 Limpeza: ${result.deletedCount} notificações expiradas removidas`);
      
      return {
        success: true,
        deletedCount: result.deletedCount
      };
    } catch (error) {
      console.error('Erro na limpeza:', error);
      return {
        success: false,
        error: (error as any)?.message || "Erro desconhecido"
      };
    }
  }

  /**
   * 📧 TEMPLATES DE NOTIFICAÇÕES
   * ============================
   */

  /**
   * 👋 Notificação de boas-vindas
   */
  static async createWelcomeNotification(userId: string, userName: string, userRole: string) {
    const isNutritionist = userRole === 'nutritionist';
    
    return this.create({
      userId,
      type: 'welcome',
      title: `Bem-vindo ao NutriPlan, ${userName}! 🎉`,
      message: isNutritionist 
        ? 'Configure seu perfil e comece a gerenciar seus pacientes.'
        : 'Aguarde o convite do seu nutricionista para começar.',
      actionRequired: true,
      actionUrl: '/perfil',
      actionLabel: 'Completar Perfil',
      priority: 'high'
    });
  }

  /**
   * 📧 Convite de paciente (substitui email)
   */
  static async createPatientInvite(
    patientUserId: string, 
    nutritionistName: string, 
    nutritionistCrn: string,
    inviteToken: string
  ) {
    return this.create({
      userId: patientUserId,
      type: 'invite',
      title: `Convite do Dr(a). ${nutritionistName} 👨‍⚕️`,
      message: `Você foi convidado para acompanhamento nutricional. CRN: ${nutritionistCrn}`,
      actionRequired: true,
      actionUrl: `/convite/${inviteToken}`,
      actionLabel: 'Aceitar Convite',
      priority: 'urgent',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      data: {
        nutritionistName,
        nutritionistCrn,
        inviteToken
      }
    });
  }

  /**
   * 📅 Lembrete de consulta
   */
  static async createConsultationReminder(
    userId: string,
    consultationDate: Date,
    nutritionistName: string
  ) {
    return this.create({
      userId,
      type: 'consultation',
      title: 'Lembrete de Consulta 📅',
      message: `Consulta com ${nutritionistName} em ${consultationDate.toLocaleDateString('pt-BR')}`,
      actionUrl: '/consultas',
      actionLabel: 'Ver Detalhes',
      priority: 'high',
      data: {
        consultationDate,
        nutritionistName
      }
    });
  }

  /**
   * 🍽️ Novo plano alimentar
   */
  static async createDietPlanNotification(
    userId: string,
    planName: string,
    nutritionistName: string
  ) {
    return this.create({
      userId,
      type: 'diet_plan',
      title: 'Novo Plano Alimentar! 🍽️',
      message: `${nutritionistName} criou o plano "${planName}" para você.`,
      actionRequired: true,
      actionUrl: '/plano-alimentar',
      actionLabel: 'Ver Plano',
      priority: 'high',
      data: {
        planName,
        nutritionistName
      }
    });
  }

  /**
   * 📊 Nova avaliação
   */
  static async createAssessmentNotification(
    userId: string,
    nutritionistName: string
  ) {
    return this.create({
      userId,
      type: 'assessment',
      title: 'Nova Avaliação Disponível! 📊',
      message: `${nutritionistName} realizou uma nova avaliação nutricional.`,
      actionUrl: '/avaliacoes',
      actionLabel: 'Ver Avaliação',
      priority: 'medium',
      data: {
        nutritionistName
      }
    });
  }
}