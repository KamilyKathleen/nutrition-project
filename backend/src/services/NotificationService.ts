/**
 * 📧 SERVIÇO DE NOTIFICAÇÕES
 * ==========================
 * Sistema completo de notificações com filas e processamento
 */

import { 
  NotificationModel, 
  NotificationType, 
  NotificationStatus, 
  NotificationChannel,
  INotification 
} from '../models/Notification';
import { EmailService } from './EmailService';
import { UserModel } from '../models/User';
import Bull from 'bull';

/**
 * 📧 DADOS PARA CRIAR NOTIFICAÇÃO
 */
interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  channel?: NotificationChannel;
  scheduledFor?: Date;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  expiresAt?: Date;
}

/**
 * 📊 ESTATÍSTICAS DE NOTIFICAÇÕES
 */
interface NotificationStats {
  total: number;
  sent: number;
  pending: number;
  failed: number;
  byType: { [key: string]: number };
  byChannel: { [key: string]: number };
}

/**
 * 📧 SERVIÇO DE NOTIFICAÇÕES
 */
export class NotificationService {
  private emailService: EmailService;
  private notificationQueue!: Bull.Queue;

  constructor() {
    this.emailService = new EmailService();
    this.initializeQueue();
  }

  /**
   * 🔧 Inicializar fila de processamento
   */
  private initializeQueue(): void {
    // Configurar Redis para as filas
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number.parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      db: Number.parseInt(process.env.REDIS_DB || '0')
    };

    this.notificationQueue = Bull('notification-queue', {
      redis: redisConfig,
      defaultJobOptions: {
        removeOnComplete: 50, // Manter apenas os 50 jobs completos mais recentes
        removeOnFail: 100,    // Manter apenas os 100 jobs falhados mais recentes
        attempts: 3,          // Máximo 3 tentativas
        backoff: {
          type: 'exponential',
          delay: 5000         // Delay inicial de 5 segundos
        }
      }
    });

    // Configurar processador da fila
    this.notificationQueue.process('send-notification', 10, this.processNotificationJob.bind(this));

    // Event listeners
    this.notificationQueue.on('completed', (job) => {
      console.log(`✅ Notificação processada: ${job.id}`);
    });

    this.notificationQueue.on('failed', (job, err) => {
      console.error(`❌ Falha no processamento da notificação ${job.id}:`, err);
    });

    this.notificationQueue.on('stalled', (job) => {
      console.warn(`⚠️ Job travado: ${job.id}`);
    });
  }

  /**
   * ➕ Criar nova notificação
   */
  async createNotification(data: CreateNotificationData): Promise<INotification> {
    try {
      const notification = new NotificationModel({
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data || {},
        channel: data.channel || NotificationChannel.EMAIL,
        scheduledFor: data.scheduledFor || new Date(),
        priority: data.priority || 'normal',
        expiresAt: data.expiresAt
      });

      const savedNotification = await notification.save();
      console.log(`📧 Notificação criada: ${savedNotification.id}`);

      // Adicionar à fila de processamento
      await this.queueNotification(savedNotification);

      return savedNotification;
    } catch (error) {
      console.error('❌ Erro ao criar notificação:', error);
      throw error;
    }
  }

  /**
   * 🔄 Adicionar notificação à fila
   */
  private async queueNotification(notification: INotification): Promise<void> {
    const delay = notification.scheduledFor ? 
      Math.max(0, notification.scheduledFor.getTime() - Date.now()) : 0;

    const priority = this.getPriorityValue(notification.priority);

    await this.notificationQueue.add(
      'send-notification',
      { notificationId: notification.id },
      {
        delay,
        priority,
        jobId: notification.id // Usar ID da notificação como ID do job para evitar duplicatas
      }
    );

    console.log(`📬 Notificação adicionada à fila: ${notification.id} (delay: ${delay}ms)`);
  }

  /**
   * 🎯 Converter prioridade para valor numérico
   */
  private getPriorityValue(priority: string): number {
    const priorities = {
      'urgent': 1,
      'high': 2,
      'normal': 3,
      'low': 4
    };
    return priorities[priority as keyof typeof priorities] || 3;
  }

  /**
   * ⚙️ Processar job da fila
   */
  private async processNotificationJob(job: any): Promise<void> {
    const { notificationId } = job.data;

    try {
      const notification = await NotificationModel.findById(notificationId);
      
      if (!notification) {
        throw new Error(`Notificação não encontrada: ${notificationId}`);
      }

      if (notification.status !== NotificationStatus.PENDING) {
        console.log(`⏭️ Notificação já processada: ${notificationId} (status: ${notification.status})`);
        return;
      }

      // Verificar se não expirou
      if (notification.expiresAt && notification.expiresAt < new Date()) {
        notification.status = NotificationStatus.CANCELLED;
        notification.failureReason = 'Notificação expirada';
        await notification.save();
        console.log(`⏰ Notificação expirada: ${notificationId}`);
        return;
      }

      // Processar baseado no canal
      let success = false;

      switch (notification.channel) {
        case NotificationChannel.EMAIL:
          success = await this.emailService.processNotification(notification);
          break;

        case NotificationChannel.SMS:
          // TODO: Implementar SMS
          console.log('📱 SMS não implementado ainda');
          notification.status = NotificationStatus.FAILED;
          notification.failureReason = 'Canal SMS não implementado';
          await notification.save();
          break;

        case NotificationChannel.PUSH:
          // TODO: Implementar Push Notifications
          console.log('📢 Push notifications não implementado ainda');
          notification.status = NotificationStatus.FAILED;
          notification.failureReason = 'Canal Push não implementado';
          await notification.save();
          break;

        default:
          throw new Error(`Canal de notificação não suportado: ${notification.channel}`);
      }

      if (!success && notification.retryCount < notification.maxRetries) {
        // Re-agendar para retry
        const retryDelay = Math.pow(2, notification.retryCount) * 5000; // Backoff exponencial
        await this.notificationQueue.add(
          'send-notification',
          { notificationId },
          { delay: retryDelay, priority: 1 } // Alta prioridade para retries
        );
        console.log(`🔄 Reagendando notificação para retry: ${notificationId} (tentativa ${notification.retryCount + 1})`);
      }

    } catch (error) {
      console.error(`❌ Erro no processamento do job ${notificationId}:`, error);
      
      // Atualizar notificação com erro
      try {
        const notification = await NotificationModel.findById(notificationId);
        if (notification) {
          notification.status = NotificationStatus.FAILED;
          notification.failureReason = error instanceof Error ? error.message : 'Erro desconhecido';
          notification.retryCount += 1;
          await notification.save();
        }
      } catch (updateError) {
        console.error('❌ Erro ao atualizar notificação com falha:', updateError);
      }

      throw error; // Re-throw para o Bull handle
    }
  }

  /**
   * 📋 Listar notificações do usuário
   */
  async getUserNotifications(
    userId: string, 
    page: number = 1, 
    limit: number = 20,
    filters?: {
      status?: NotificationStatus;
      type?: NotificationType;
      unreadOnly?: boolean;
    }
  ): Promise<{
    notifications: INotification[];
    total: number;
    pages: number;
    unreadCount: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      const query: any = { userId };

      if (filters?.status) {
        query.status = filters.status;
      }

      if (filters?.type) {
        query.type = filters.type;
      }

      if (filters?.unreadOnly) {
        query.readAt = { $exists: false };
      }

      const [notifications, total, unreadCount] = await Promise.all([
        NotificationModel
          .find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('userId', 'name email'),

        NotificationModel.countDocuments(query),

        NotificationModel.countDocuments({
          userId,
          readAt: { $exists: false },
          status: NotificationStatus.SENT
        })
      ]);

      return {
        notifications,
        total,
        pages: Math.ceil(total / limit),
        unreadCount
      };

    } catch (error) {
      console.error('❌ Erro ao buscar notificações do usuário:', error);
      throw error;
    }
  }

  /**
   * 👀 Marcar notificação como lida
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const result = await NotificationModel.updateOne(
        { _id: notificationId, userId, readAt: { $exists: false } },
        { $set: { readAt: new Date() } }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('❌ Erro ao marcar notificação como lida:', error);
      return false;
    }
  }

  /**
   * 👀 Marcar todas como lidas
   */
  async markAllAsRead(userId: string): Promise<number> {
    try {
      const result = await NotificationModel.updateMany(
        { userId, readAt: { $exists: false }, status: NotificationStatus.SENT },
        { $set: { readAt: new Date() } }
      );

      return result.modifiedCount;
    } catch (error) {
      console.error('❌ Erro ao marcar todas notificações como lidas:', error);
      return 0;
    }
  }

  /**
   * 🗑️ Deletar notificação
   */
  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      const result = await NotificationModel.deleteOne({
        _id: notificationId,
        userId
      });

      return result.deletedCount > 0;
    } catch (error) {
      console.error('❌ Erro ao deletar notificação:', error);
      return false;
    }
  }

  /**
   * 📊 Obter estatísticas de notificações
   */
  async getNotificationStats(
    userId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<NotificationStats> {
    try {
      const matchQuery: any = {};
      
      if (userId) {
        matchQuery.userId = userId;
      }

      if (startDate || endDate) {
        matchQuery.createdAt = {};
        if (startDate) matchQuery.createdAt.$gte = startDate;
        if (endDate) matchQuery.createdAt.$lte = endDate;
      }

      const stats = await NotificationModel.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            sent: { $sum: { $cond: [{ $eq: ['$status', NotificationStatus.SENT] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ['$status', NotificationStatus.PENDING] }, 1, 0] } },
            failed: { $sum: { $cond: [{ $eq: ['$status', NotificationStatus.FAILED] }, 1, 0] } }
          }
        }
      ]);

      const typeStats = await NotificationModel.aggregate([
        { $match: matchQuery },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]);

      const channelStats = await NotificationModel.aggregate([
        { $match: matchQuery },
        { $group: { _id: '$channel', count: { $sum: 1 } } }
      ]);

      const result: NotificationStats = {
        total: stats[0]?.total || 0,
        sent: stats[0]?.sent || 0,
        pending: stats[0]?.pending || 0,
        failed: stats[0]?.failed || 0,
        byType: {},
        byChannel: {}
      };

      typeStats.forEach(stat => {
        result.byType[stat._id] = stat.count;
      });

      channelStats.forEach(stat => {
        result.byChannel[stat._id] = stat.count;
      });

      return result;

    } catch (error) {
      console.error('❌ Erro ao obter estatísticas de notificações:', error);
      throw error;
    }
  }

  // ========================================
  // 🎯 MÉTODOS DE CONVENIÊNCIA
  // ========================================

  /**
   * 👋 Enviar email de boas-vindas
   */
  async sendWelcomeEmail(userId: string): Promise<INotification> {
    return this.createNotification({
      userId,
      type: NotificationType.WELCOME_EMAIL,
      title: 'Bem-vindo ao Sistema de Nutrição!',
      message: 'Seu cadastro foi realizado com sucesso. Explore todas as funcionalidades disponíveis.',
      priority: 'high'
    });
  }

  /**
   * ⏰ Enviar lembrete de consulta
   */
  async sendConsultationReminder(
    userId: string, 
    consultationData: any
  ): Promise<INotification> {
    const consultationDate = new Date(consultationData.scheduledFor);
    const reminderTime = new Date(consultationDate.getTime() - 24 * 60 * 60 * 1000); // 24h antes

    return this.createNotification({
      userId,
      type: NotificationType.CONSULTATION_REMINDER,
      title: 'Lembrete: Consulta agendada para amanhã',
      message: `Você tem uma consulta agendada para ${consultationDate.toLocaleDateString('pt-BR')} às ${consultationDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.`,
      data: consultationData,
      scheduledFor: reminderTime,
      priority: 'high'
    });
  }

  /**
   * 📅 Notificar consulta agendada
   */
  async sendConsultationScheduled(
    userId: string, 
    consultationData: any
  ): Promise<INotification> {
    return this.createNotification({
      userId,
      type: NotificationType.CONSULTATION_SCHEDULED,
      title: 'Consulta agendada com sucesso',
      message: 'Sua consulta foi agendada. Você receberá um lembrete 24 horas antes.',
      data: consultationData,
      priority: 'normal'
    });
  }

  /**
   * 🍽️ Notificar plano alimentar criado
   */
  async sendDietPlanCreated(
    userId: string, 
    dietPlanData: any
  ): Promise<INotification> {
    return this.createNotification({
      userId,
      type: NotificationType.DIET_PLAN_CREATED,
      title: 'Novo plano alimentar disponível',
      message: 'Seu nutricionista criou um novo plano alimentar personalizado para você.',
      data: dietPlanData,
      priority: 'normal'
    });
  }

  /**
   * 🔑 Enviar reset de senha
   */
  async sendPasswordReset(
    userId: string, 
    resetData: any
  ): Promise<INotification> {
    return this.createNotification({
      userId,
      type: NotificationType.PASSWORD_RESET,
      title: 'Redefinição de senha solicitada',
      message: 'Clique no link para redefinir sua senha. O link expira em 1 hora.',
      data: resetData,
      priority: 'urgent',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hora
    });
  }

  /**
   * 🔧 Limpar notificações antigas
   */
  async cleanupOldNotifications(): Promise<number> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const result = await NotificationModel.deleteMany({
        $or: [
          { expiresAt: { $lt: new Date() } },
          { createdAt: { $lt: thirtyDaysAgo }, status: { $in: [NotificationStatus.SENT, NotificationStatus.CANCELLED] } }
        ]
      });

      console.log(`🧹 Limpeza: ${result.deletedCount} notificações antigas removidas`);
      return result.deletedCount;
    } catch (error) {
      console.error('❌ Erro na limpeza de notificações antigas:', error);
      return 0;
    }
  }

  /**
   * ⚙️ Status da fila
   */
  async getQueueStats(): Promise<any> {
    const waiting = await this.notificationQueue.getWaiting();
    const active = await this.notificationQueue.getActive();
    const completed = await this.notificationQueue.getCompleted();
    const failed = await this.notificationQueue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      total: waiting.length + active.length + completed.length + failed.length
    };
  }

  /**
   * � Método de conveniência - Enviar notificação de boas-vindas
   */
  async sendWelcomeNotification(userId: string): Promise<INotification> {
    return await this.createNotification({
      userId,
      type: NotificationType.WELCOME_EMAIL,
      title: 'Bem-vindo!',
      message: 'Sua conta foi criada com sucesso. Aproveite todos os recursos da plataforma!',
      channel: NotificationChannel.EMAIL,
      priority: 'normal'
    });
  }

  /**
   * �🛑 Fechar conexões
   */
  async close(): Promise<void> {
    await this.notificationQueue.close();
  }
}