
import { 
  NotificationModel, 
  NotificationType, 
  NotificationStatus, 
  NotificationChannel,
  INotification 
} from '../models/Notification';
import Bull from 'bull';

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

interface NotificationStats {
  total: number;
  sent: number;
  pending: number;
  failed: number;
  byType: { [key: string]: number };
  byChannel: { [key: string]: number };
}

export class NotificationService {
  private notificationQueue!: Bull.Queue;

  constructor() {
    this.initializeQueue();
  }

  private initializeQueue(): void {
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number.parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      db: Number.parseInt(process.env.REDIS_DB || '0')
    };

    this.notificationQueue = Bull('notification-queue', {
      redis: redisConfig,
      defaultJobOptions: {
        removeOnComplete: 50, 
        removeOnFail: 100,    
        attempts: 3,          
        backoff: {
          type: 'exponential',
          delay: 5000         
        }
      }
    });

    this.notificationQueue.process('send-notification', 10, this.processNotificationJob.bind(this));

    this.notificationQueue.on('completed', (job) => {
      console.log(`Notificação processada: ${job.id}`);
    });

    this.notificationQueue.on('failed', (job, err) => {
      console.error(`Falha no processamento da notificação ${job.id}:`, err);
    });

    this.notificationQueue.on('stalled', (job) => {
      console.warn(`Job travado: ${job.id}`);
    });
  }

  async createNotification(data: CreateNotificationData): Promise<INotification> {
    try {
      const notification = new NotificationModel({
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data || {},
        channel: data.channel || NotificationChannel.IN_APP,
        scheduledFor: data.scheduledFor || new Date(),
        priority: data.priority || 'normal',
        expiresAt: data.expiresAt
      });

      const savedNotification = await notification.save();
      console.log(`Notificação criada: ${savedNotification.id}`);

      await this.queueNotification(savedNotification);

      return savedNotification;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }
  }

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
        jobId: notification.id 
      }
    );

    console.log(`Notificação adicionada à fila: ${notification.id} (delay: ${delay}ms)`);
  }

  private getPriorityValue(priority: string): number {
    const priorities = {
      'urgent': 1,
      'high': 2,
      'normal': 3,
      'low': 4
    };
    return priorities[priority as keyof typeof priorities] || 3;
  }

  private async processNotificationJob(job: any): Promise<void> {
    const { notificationId } = job.data;

    try {
      const notification = await NotificationModel.findById(notificationId);
      
      if (!notification) {
        throw new Error(`Notificação não encontrada: ${notificationId}`);
      }

      if (notification.status !== NotificationStatus.PENDING) {
        console.log(`Notificação já processada: ${notificationId} (status: ${notification.status})`);
        return;
      }

      if (notification.expiresAt && notification.expiresAt < new Date()) {
        notification.status = NotificationStatus.CANCELLED;
        notification.failureReason = 'Notificação expirada';
        await notification.save();
        console.log(`Notificação expirada: ${notificationId}`);
        return;
      }

      let success = false;

      switch (notification.channel) {
        case NotificationChannel.EMAIL:
          console.log('E-mails processados via Firebase');
          notification.status = NotificationStatus.SENT;
          notification.sentAt = new Date();
          await notification.save();
          success = true;
          break;

        case NotificationChannel.IN_APP:
          console.log('Notificação in-app processada');
          notification.status = NotificationStatus.SENT;
          notification.sentAt = new Date();
          await notification.save();
          success = true;
          break;

        default:
          throw new Error(`Canal de notificação não suportado: ${notification.channel}`);
      }

      if (!success && notification.retryCount < notification.maxRetries) {
        const retryDelay = Math.pow(2, notification.retryCount) * 5000; 
        await this.notificationQueue.add(
          'send-notification',
          { notificationId },
          { delay: retryDelay, priority: 1 } 
        );
        console.log(`Reagendando notificação para retry: ${notificationId} (tentativa ${notification.retryCount + 1})`);
      }

    } catch (error) {
      console.error(`Erro no processamento do job ${notificationId}:`, error);
      
      try {
        const notification = await NotificationModel.findById(notificationId);
        if (notification) {
          notification.status = NotificationStatus.FAILED;
          notification.failureReason = error instanceof Error ? error.message : 'Erro desconhecido';
          notification.retryCount += 1;
          await notification.save();
        }
      } catch (updateError) {
        console.error('Erro ao atualizar notificação com falha:', updateError);
      }

      throw error; 
    }
  }

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
      console.error('Erro ao buscar notificações do usuário:', error);
      throw error;
    }
  }


  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const result = await NotificationModel.updateOne(
        { _id: notificationId, userId, readAt: { $exists: false } },
        { $set: { readAt: new Date() } }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      return false;
    }
  }

  async markAllAsRead(userId: string): Promise<number> {
    try {
      const result = await NotificationModel.updateMany(
        { userId, readAt: { $exists: false }, status: NotificationStatus.SENT },
        { $set: { readAt: new Date() } }
      );

      return result.modifiedCount;
    } catch (error) {
      console.error('Erro ao marcar todas notificações como lidas:', error);
      return 0;
    }
  }

  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      const result = await NotificationModel.deleteOne({
        _id: notificationId,
        userId
      });

      return result.deletedCount > 0;
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      return false;
    }
  }

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
      console.error('Erro ao obter estatísticas de notificações:', error);
      throw error;
    }
  }

  /**
   * Enviar lembrete de consulta
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
   * Criar notificação quando o Firebase enviar email de reset de senha
   */
  async notifyPasswordResetSent(
    userId: string, 
    email: string
  ): Promise<INotification> {
    return this.createNotification({
      userId,
      type: NotificationType.PASSWORD_RESET,
      title: 'Email de recuperação enviado',
      message: `Um email para redefinição de senha foi enviado para ${email}. Verifique sua caixa de entrada e spam.`,
      data: { email, sentVia: 'firebase' },
      channel: NotificationChannel.IN_APP,
      priority: 'normal'
    });
  }

  /**
   * Limpar notificações antigas
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

      console.log(`Limpeza: ${result.deletedCount} notificações antigas removidas`);
      return result.deletedCount;
    } catch (error) {
      console.error('Erro na limpeza de notificações antigas:', error);
      return 0;
    }
  }

  /**
   * Status da fila
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
   * Fechar conexões
   */
  async close(): Promise<void> {
    await this.notificationQueue.close();
  }
}