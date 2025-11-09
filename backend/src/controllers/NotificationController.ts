/**
 * 📧 CONTROLLER DE NOTIFICAÇÕES
 * =============================
 * Sistema completo de gerenciamento de notificações
 */

import { Request, Response } from 'express';
import { NotificationService } from '../services/NotificationService';
import { 
  NotificationModel, 
  NotificationType, 
  NotificationStatus,
  NotificationChannel 
} from '../models/Notification';
import { validationResult } from 'express-validator';

/**
 * 📧 CONTROLLER DE NOTIFICAÇÕES
 */
export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * 📋 Listar notificações do usuário
   */
  getUserNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const page = Number.parseInt(req.query.page as string) || 1;
      const limit = Math.min(Number.parseInt(req.query.limit as string) || 20, 100);
      
      const filters: any = {};
      
      if (req.query.status && Object.values(NotificationStatus).includes(req.query.status as NotificationStatus)) {
        filters.status = req.query.status as NotificationStatus;
      }
      
      if (req.query.type && Object.values(NotificationType).includes(req.query.type as NotificationType)) {
        filters.type = req.query.type as NotificationType;
      }
      
      if (req.query.unread === 'true') {
        filters.unreadOnly = true;
      }

      const result = await this.notificationService.getUserNotifications(
        userId,
        page,
        limit,
        filters
      );

      res.json({
        success: true,
        data: result.notifications,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: result.pages
        },
        unreadCount: result.unreadCount
      });

    } catch (error) {
      console.error('❌ Erro ao listar notificações:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };

  /**
   * ➕ Criar nova notificação (admin/sistema)
   */
  createNotification = async (req: Request, res: Response): Promise<void> => {
    try {
      // Verificar validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
        return;
      }

      const {
        userId,
        type,
        title,
        message,
        data,
        channel,
        scheduledFor,
        priority,
        expiresAt
      } = req.body;

      const notification = await this.notificationService.createNotification({
        userId,
        type,
        title,
        message,
        data,
        channel,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
        priority,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined
      });

      res.status(201).json({
        success: true,
        message: 'Notificação criada com sucesso',
        data: notification
      });

    } catch (error) {
      console.error('❌ Erro ao criar notificação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };

  /**
   * 👀 Marcar notificação como lida
   */
  markAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const { notificationId } = req.params;
      const userId = (req as any).user.id;

      if (!notificationId || !userId) {
        res.status(400).json({
          success: false,
          message: 'ID da notificação e usuário são obrigatórios'
        });
        return;
      }

      const success = await this.notificationService.markAsRead(notificationId, userId);

      if (success) {
        res.json({
          success: true,
          message: 'Notificação marcada como lida'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Notificação não encontrada ou já estava lida'
        });
      }

    } catch (error) {
      console.error('❌ Erro ao marcar notificação como lida:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };

  /**
   * 👀 Marcar todas notificações como lidas
   */
  markAllAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;

      const count = await this.notificationService.markAllAsRead(userId);

      res.json({
        success: true,
        message: `${count} notificações marcadas como lidas`,
        count
      });

    } catch (error) {
      console.error('❌ Erro ao marcar todas notificações como lidas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };

  /**
   * 🗑️ Deletar notificação
   */
  deleteNotification = async (req: Request, res: Response): Promise<void> => {
    try {
      const { notificationId } = req.params;
      const userId = (req as any).user.id;

      if (!notificationId || !userId) {
        res.status(400).json({
          success: false,
          message: 'ID da notificação e usuário são obrigatórios'
        });
        return;
      }

      const success = await this.notificationService.deleteNotification(notificationId, userId);

      if (success) {
        res.json({
          success: true,
          message: 'Notificação deletada com sucesso'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Notificação não encontrada'
        });
      }

    } catch (error) {
      console.error('❌ Erro ao deletar notificação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };

  /**
   * 🔍 Buscar notificação específica
   */
  getNotificationById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { notificationId } = req.params;
      const userId = (req as any).user.id;

      const notification = await NotificationModel
        .findOne({ _id: notificationId, userId })
        .populate('userId', 'name email');

      if (!notification) {
        res.status(404).json({
          success: false,
          message: 'Notificação não encontrada'
        });
        return;
      }

      res.json({
        success: true,
        data: notification
      });

    } catch (error) {
      console.error('❌ Erro ao buscar notificação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };

  /**
   * 📊 Estatísticas de notificações do usuário
   */
  getUserNotificationStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const stats = await this.notificationService.getNotificationStats(
        userId,
        startDate,
        endDate
      );

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('❌ Erro ao obter estatísticas do usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };

  /**
   * 📊 Estatísticas gerais do sistema (admin apenas)
   */
  getSystemNotificationStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const [notificationStats, queueStats] = await Promise.all([
        this.notificationService.getNotificationStats(undefined, startDate, endDate),
        this.notificationService.getQueueStats()
      ]);

      res.json({
        success: true,
        data: {
          notifications: notificationStats,
          queue: queueStats
        }
      });

    } catch (error) {
      console.error('❌ Erro ao obter estatísticas do sistema:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };

  /**
   * 🔄 Reenviar notificação falhada
   */
  resendNotification = async (req: Request, res: Response): Promise<void> => {
    try {
      const { notificationId } = req.params;
      const userId = (req as any).user.id;

      const notification = await NotificationModel.findOne({
        _id: notificationId,
        userId,
        status: NotificationStatus.FAILED
      });

      if (!notification) {
        res.status(404).json({
          success: false,
          message: 'Notificação não encontrada ou não está com falha'
        });
        return;
      }

      // Reset para reenvio
      notification.status = NotificationStatus.PENDING;
      notification.sentAt = undefined;
      notification.failureReason = undefined;
      notification.retryCount = 0;
      notification.scheduledFor = new Date();
      
      await notification.save();

      // Adicionar à fila novamente
      await (this.notificationService as any).queueNotification(notification);

      res.json({
        success: true,
        message: 'Notificação reagendada para reenvio'
      });

    } catch (error) {
      console.error('❌ Erro ao reenviar notificação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };

  /**
   * 🧹 Limpeza de notificações antigas (admin)
   */
  cleanupOldNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const deletedCount = await this.notificationService.cleanupOldNotifications();

      res.json({
        success: true,
        message: 'Limpeza concluída',
        deletedCount
      });

    } catch (error) {
      console.error('❌ Erro na limpeza de notificações:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };

  /**
   * 📤 Enviar notificação de teste
   */
  sendTestNotification = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;

      const notification = await this.notificationService.createNotification({
        userId,
        type: NotificationType.SYSTEM_ANNOUNCEMENT,
        title: 'Notificação de Teste',
        message: 'Esta é uma notificação de teste para verificar se o sistema está funcionando corretamente.',
        priority: 'normal'
      });

      res.json({
        success: true,
        message: 'Notificação de teste enviada',
        data: notification
      });

    } catch (error) {
      console.error('❌ Erro ao enviar notificação de teste:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };

  // ========================================
  // 🎯 MÉTODOS DE CONVENIÊNCIA
  // ========================================

  /**
   * 👋 Enviar boas-vindas
   */
  sendWelcomeNotification = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body;

      const notification = await this.notificationService.sendWelcomeEmail(userId);

      res.json({
        success: true,
        message: 'Email de boas-vindas enviado',
        data: notification
      });

    } catch (error) {
      console.error('❌ Erro ao enviar boas-vindas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };

  /**
   * ⏰ Enviar lembrete de consulta
   */
  sendConsultationReminder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, consultationData } = req.body;

      const notification = await this.notificationService.sendConsultationReminder(
        userId,
        consultationData
      );

      res.json({
        success: true,
        message: 'Lembrete de consulta agendado',
        data: notification
      });

    } catch (error) {
      console.error('❌ Erro ao agendar lembrete:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };

  /**
   * 📊 Obter contadores rápidos
   */
  getNotificationCounters = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;

      const [unreadCount, totalCount, pendingCount] = await Promise.all([
        NotificationModel.countDocuments({
          userId,
          readAt: { $exists: false },
          status: NotificationStatus.SENT
        }),
        NotificationModel.countDocuments({ userId }),
        NotificationModel.countDocuments({
          userId,
          status: NotificationStatus.PENDING
        })
      ]);

      res.json({
        success: true,
        data: {
          unread: unreadCount,
          total: totalCount,
          pending: pendingCount
        }
      });

    } catch (error) {
      console.error('❌ Erro ao obter contadores:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };
}