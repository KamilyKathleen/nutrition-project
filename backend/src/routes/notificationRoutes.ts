/**
 * 📧 ROTAS DE NOTIFICAÇÕES
 * ========================
 * Sistema completo de gerenciamento de notificações
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, authorize } from '../middlewares/auth';
import { validateRequest } from '../middlewares/expressValidation';
import { auditSensitiveAccess } from '../middlewares/auditMiddleware';
import { NotificationController } from '../controllers/NotificationController';
import { UserRole } from '../types';
import { NotificationType, NotificationChannel } from '../models/Notification';

const router = Router();
const notificationController = new NotificationController();

// Middleware de autenticação para todas as rotas
router.use(authenticate);

// ================================
// VALIDAÇÕES
// ================================

/**
 * 📧 Validações para criação de notificação
 */
const createNotificationValidation = [
  body('userId')
    .isMongoId()
    .withMessage('ID do usuário inválido'),
  body('type')
    .isIn(Object.values(NotificationType))
    .withMessage('Tipo de notificação inválido'),
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Título deve ter entre 1 e 200 caracteres')
    .trim(),
  body('message')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Mensagem deve ter entre 1 e 2000 caracteres')
    .trim(),
  body('channel')
    .optional()
    .isIn(Object.values(NotificationChannel))
    .withMessage('Canal de notificação inválido'),
  body('scheduledFor')
    .optional()
    .isISO8601()
    .withMessage('Data de agendamento inválida'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Prioridade inválida'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Data de expiração inválida'),
  body('data')
    .optional()
    .isObject()
    .withMessage('Dados devem ser um objeto')
];

/**
 * 📧 Validações para paginação
 */
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número maior que 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve estar entre 1 e 100'),
  query('status')
    .optional()
    .isIn(['pending', 'sent', 'failed', 'cancelled'])
    .withMessage('Status inválido'),
  query('type')
    .optional()
    .isIn(Object.values(NotificationType))
    .withMessage('Tipo inválido'),
  query('unread')
    .optional()
    .isBoolean()
    .withMessage('Unread deve ser um boolean')
];

/**
 * 📧 Validações para MongoDB ID
 */
const mongoIdValidation = [
  param('notificationId')
    .isMongoId()
    .withMessage('ID da notificação inválido')
];

/**
 * 📧 Validações para datas
 */
const dateRangeValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Data inicial inválida'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Data final inválida')
];

// ================================
// ROTAS PRINCIPAIS - CRUD
// ================================

/**
 * 📋 Listar notificações do usuário
 */
router.get('/',
  paginationValidation,
  validateRequest,
  notificationController.getUserNotifications
);

/**
 * ➕ Criar notificação (admin/sistema apenas)
 */
router.post('/',
  authorize(UserRole.ADMIN),
  createNotificationValidation,
  validateRequest,
  auditSensitiveAccess('notification_create', 'USER', (req) => req.body.userId),
  notificationController.createNotification
);

/**
 * 🔍 Buscar notificação específica
 */
router.get('/:notificationId',
  mongoIdValidation,
  validateRequest,
  notificationController.getNotificationById
);

/**
 * 🗑️ Deletar notificação
 */
router.delete('/:notificationId',
  mongoIdValidation,
  validateRequest,
  auditSensitiveAccess('notification_delete', 'USER', (req) => req.params.notificationId || ''),
  notificationController.deleteNotification
);

// ================================
// 🎯 ROTAS DE AÇÕES
// ================================

/**
 * 👀 Marcar notificação como lida
 */
router.patch('/:notificationId/read',
  mongoIdValidation,
  validateRequest,
  notificationController.markAsRead
);

/**
 * 👀 Marcar todas notificações como lidas
 */
router.patch('/mark-all-read',
  notificationController.markAllAsRead
);

/**
 * 🔄 Reenviar notificação falhada
 */
router.post('/:notificationId/resend',
  mongoIdValidation,
  validateRequest,
  auditSensitiveAccess('notification_resend', 'USER', (req) => req.params.notificationId || ''),
  notificationController.resendNotification
);

/**
 * 📤 Enviar notificação de teste
 */
router.post('/send-test',
  notificationController.sendTestNotification
);

// ================================
// ROTAS DE CONVENIÊNCIA
// ================================

/**
 * Enviar lembrete de consulta
 */
router.post('/consultation-reminder',
  authorize([UserRole.NUTRITIONIST, UserRole.ADMIN]),
  [
    body('userId')
      .isMongoId()
      .withMessage('ID do usuário inválido'),
    body('consultationData')
      .isObject()
      .withMessage('Dados da consulta são obrigatórios'),
    body('consultationData.scheduledFor')
      .isISO8601()
      .withMessage('Data da consulta inválida')
  ],
  validateRequest,
  auditSensitiveAccess('notification_consultation_reminder', 'USER', (req) => req.body.userId),
  notificationController.sendConsultationReminder
);

// ================================
// 🎯 ROTAS DE ESTATÍSTICAS
// ================================

/**
 * 📊 Estatísticas do usuário
 */
router.get('/stats/user',
  dateRangeValidation,
  validateRequest,
  notificationController.getUserNotificationStats
);

/**
 * 📊 Contadores rápidos
 */
router.get('/stats/counters',
  notificationController.getNotificationCounters
);

/**
 * 📊 Estatísticas do sistema (admin apenas)
 */
router.get('/stats/system',
  authorize(UserRole.ADMIN),
  dateRangeValidation,
  validateRequest,
  notificationController.getSystemNotificationStats
);

// ================================
// ROTAS ADMINISTRATIVAS
// ================================

/**
 * 🧹 Limpeza de notificações antigas
 */
router.post('/admin/cleanup',
  authorize(UserRole.ADMIN),
  auditSensitiveAccess('notification_cleanup', 'USER', () => 'system'),
  notificationController.cleanupOldNotifications
);

export { router as notificationRoutes };