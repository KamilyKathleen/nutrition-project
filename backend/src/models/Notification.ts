/**
 * 📧 MODELO DE NOTIFICAÇÕES
 * =========================
 * Sistema completo de notificações para usuários
 */

import mongoose, { Schema, Document } from 'mongoose';

/**
 * 📧 TIPOS DE NOTIFICAÇÃO
 */
export enum NotificationType {
  CONSULTATION_REMINDER = 'consultation_reminder',
  CONSULTATION_SCHEDULED = 'consultation_scheduled',
  CONSULTATION_CANCELLED = 'consultation_cancelled',
  DIET_PLAN_CREATED = 'diet_plan_created',
  DIET_PLAN_UPDATED = 'diet_plan_updated',
  ASSESSMENT_DUE = 'assessment_due',
  WELCOME_EMAIL = 'welcome_email',
  PASSWORD_RESET = 'password_reset',
  SYSTEM_ANNOUNCEMENT = 'system_announcement'
}

/**
 * 📧 STATUS DA NOTIFICAÇÃO
 */
export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * 📧 CANAL DE NOTIFICAÇÃO
 */
export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push'
}

/**
 * 📧 INTERFACE DA NOTIFICAÇÃO
 */
export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  
  // Conteúdo da notificação
  title: string;
  message: string;
  data?: any; // Dados adicionais específicos do tipo
  
  // Controle de envio
  scheduledFor?: Date;
  sentAt?: Date;
  failureReason?: string;
  retryCount: number;
  maxRetries: number;
  
  // Metadados
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expiresAt?: Date;
  readAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 📧 SCHEMA DA NOTIFICAÇÃO
 */
const notificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID do usuário é obrigatório'],
    index: true
  },
  type: {
    type: String,
    enum: Object.values(NotificationType),
    required: [true, 'Tipo da notificação é obrigatório'],
    index: true
  },
  channel: {
    type: String,
    enum: Object.values(NotificationChannel),
    required: [true, 'Canal da notificação é obrigatório'],
    default: NotificationChannel.EMAIL
  },
  status: {
    type: String,
    enum: Object.values(NotificationStatus),
    default: NotificationStatus.PENDING,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true,
    maxlength: [200, 'Título deve ter no máximo 200 caracteres']
  },
  message: {
    type: String,
    required: [true, 'Mensagem é obrigatória'],
    trim: true,
    maxlength: [2000, 'Mensagem deve ter no máximo 2000 caracteres']
  },
  data: {
    type: Schema.Types.Mixed,
    default: {}
  },
  scheduledFor: {
    type: Date,
    default: Date.now,
    index: true
  },
  sentAt: {
    type: Date,
    index: true
  },
  failureReason: {
    type: String,
    trim: true
  },
  retryCount: {
    type: Number,
    default: 0,
    min: [0, 'Contador de tentativas não pode ser negativo']
  },
  maxRetries: {
    type: Number,
    default: 3,
    min: [1, 'Máximo de tentativas deve ser pelo menos 1']
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
    index: true
  },
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 } // TTL automático
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices compostos para performance
notificationSchema.index({ userId: 1, status: 1 });
notificationSchema.index({ scheduledFor: 1, status: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });

// Middleware para definir expiração automática se não especificada
notificationSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    // Notificações expiram em 30 dias por padrão
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    this.expiresAt = new Date(Date.now() + thirtyDays);
  }
  next();
});

// Transform function para output
notificationSchema.set('toJSON', {
  transform: function(doc: any, ret: any) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    if (ret.userId) {
      ret.userId = ret.userId.toString();
    }
    return ret;
  }
});

export const NotificationModel = mongoose.model<INotification>('Notification', notificationSchema);