/**
 * 🏥 ROTAS DE CONSULTAS
 * ====================
 * Sistema completo de agendamento e gestão de consultas
 */

import { Router } from 'express';
import { body, query, param } from 'express-validator';
import ConsultationController from '@/controllers/ConsultationController';
import { authenticate, authorize } from '@/middlewares/auth';
import { auditSensitiveAccess } from '@/middlewares/auditMiddleware';
import { AppError } from '@/middlewares/errorHandler';
import { UserRole } from '@/types';

const router = Router();

/**
 * 🔒 MIDDLEWARE DE VALIDAÇÃO DE REQUEST
 */
const validateRequest = (req: any, res: any, next: any) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Dados inválidos: ' + errors.array().map((e: any) => e.msg).join(', '), 400));
  }
  next();
};

/**
 * 🔒 MIDDLEWARE DE AUTENTICAÇÃO APLICADO A TODAS AS ROTAS
 */
router.use(authenticate);

/**
 * 🎯 VALIDAÇÕES PARA CRIAÇÃO DE CONSULTA
 */
const createConsultationValidation = [
  body('patientId')
    .isMongoId()
    .withMessage('ID do paciente inválido'),
  body('scheduledDate')
    .isISO8601()
    .withMessage('Data agendada inválida')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Data da consulta deve ser no futuro');
      }
      return true;
    }),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 240 })
    .withMessage('Duração deve estar entre 15 e 240 minutos'),
  body('type')
    .optional()
    .isIn(['initial', 'follow_up', 'emergency', 'online', 'in_person'])
    .withMessage('Tipo de consulta inválido')
];

/**
 * 🎯 VALIDAÇÕES PARA ATUALIZAÇÃO DE CONSULTA
 */
const updateConsultationValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID da consulta inválido'),
  body('scheduledDate')
    .optional()
    .isISO8601()
    .withMessage('Data agendada inválida'),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 240 })
    .withMessage('Duração deve estar entre 15 e 240 minutos'),
  body('status')
    .optional()
    .isIn(['scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled'])
    .withMessage('Status inválido'),
  body('weight')
    .optional()
    .isFloat({ min: 1, max: 500 })
    .withMessage('Peso deve estar entre 1 e 500 kg'),
  body('bloodPressure.systolic')
    .optional()
    .isInt({ min: 60, max: 300 })
    .withMessage('Pressão sistólica inválida'),
  body('bloodPressure.diastolic')
    .optional()
    .isInt({ min: 40, max: 200 })
    .withMessage('Pressão diastólica inválida'),
  body('observations')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Observações muito longas'),
  body('recommendations')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Recomendações muito longas')
];

/**
 * 🎯 VALIDAÇÕES PARA FINALIZAR CONSULTA
 */
const completeConsultationValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID da consulta inválido'),
  body('observations')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Observações são obrigatórias (mínimo 10 caracteres)'),
  body('recommendations')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Recomendações são obrigatórias (mínimo 10 caracteres)'),
  body('weight')
    .optional()
    .isFloat({ min: 1, max: 500 })
    .withMessage('Peso deve estar entre 1 e 500 kg')
];

/**
 * 🎯 VALIDAÇÕES PARA CONSULTAS COM PAGINAÇÃO
 */
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve estar entre 1 e 100'),
  query('status')
    .optional()
    .isIn(['scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled'])
    .withMessage('Status inválido'),
  query('type')
    .optional()
    .isIn(['initial', 'follow_up', 'emergency', 'online', 'in_person'])
    .withMessage('Tipo inválido'),
  query('patientId')
    .optional()
    .isMongoId()
    .withMessage('ID do paciente inválido'),
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
// 🎯 ROTAS PRINCIPAIS - CRUD
// ================================

/**
 * 📅 Criar nova consulta
 * Apenas nutricionistas podem agendar consultas
 */
router.post('/',
  authorize(UserRole.NUTRITIONIST),
  createConsultationValidation,
  validateRequest,
  auditSensitiveAccess('consultation_create', 'PATIENT', (req) => req.body.patientId),
  ConsultationController.createConsultation
);

/**
 * 📋 Listar consultas do nutricionista (com paginação e filtros)
 */
router.get('/',
  authorize(UserRole.NUTRITIONIST),
  paginationValidation,
  validateRequest,
  ConsultationController.getConsultationsByNutritionist
);

/**
 * 🔍 Buscar consulta por ID
 */
router.get('/:id',
  [param('id').isMongoId().withMessage('ID da consulta inválido')],
  validateRequest,
  ConsultationController.getConsultationById
);

/**
 * ✏️ Atualizar consulta
 * Apenas o nutricionista que criou pode editar
 */
router.put('/:id',
  authorize(UserRole.NUTRITIONIST),
  updateConsultationValidation,
  validateRequest,
  auditSensitiveAccess('consultation_update', 'PATIENT', (req) => req.params.id || ''),
  ConsultationController.updateConsultation
);

/**
 * 🗑️ Remover consulta
 * Apenas o nutricionista que criou pode remover
 */
router.delete('/:id',
  authorize(UserRole.NUTRITIONIST),
  [param('id').isMongoId().withMessage('ID da consulta inválido')],
  validateRequest,
  auditSensitiveAccess('consultation_delete', 'PATIENT', (req) => req.params.id || ''),
  ConsultationController.deleteConsultation
);

// ================================
// 🎯 ROTAS ESPECIALIZADAS
// ================================

/**
 * 📋 Listar consultas do paciente
 */
router.get('/patient/:patientId',
  [
    param('patientId').isMongoId().withMessage('ID do paciente inválido'),
    ...paginationValidation
  ],
  validateRequest,
  ConsultationController.getConsultationsByPatient
);

/**
 * 📅 Agenda de hoje
 */
router.get('/schedule/today',
  authorize(UserRole.NUTRITIONIST),
  ConsultationController.getTodaySchedule
);

/**
 * 📅 Agenda semanal
 */
router.get('/schedule/week',
  authorize(UserRole.NUTRITIONIST),
  ConsultationController.getWeeklySchedule
);

/**
 * ⏰ Próximas consultas
 */
router.get('/schedule/upcoming',
  authorize(UserRole.NUTRITIONIST),
  [
    query('hours')
      .optional()
      .isInt({ min: 1, max: 168 })
      .withMessage('Horas deve estar entre 1 e 168 (1 semana)')
  ],
  validateRequest,
  ConsultationController.getUpcomingConsultations
);

/**
 * ✅ Finalizar consulta
 */
router.patch('/:id/complete',
  authorize(UserRole.NUTRITIONIST),
  completeConsultationValidation,
  validateRequest,
  auditSensitiveAccess('consultation_complete', 'PATIENT', (req) => req.params.id || ''),
  ConsultationController.completeConsultation
);

/**
 * ❌ Cancelar consulta
 */
router.patch('/:id/cancel',
  authorize(UserRole.NUTRITIONIST),
  [
    param('id').isMongoId().withMessage('ID da consulta inválido'),
    body('reason').optional().isLength({ max: 500 }).withMessage('Motivo muito longo')
  ],
  validateRequest,
  auditSensitiveAccess('consultation_cancel', 'PATIENT', (req) => req.params.id || ''),
  ConsultationController.cancelConsultation
);

/**
 * 🔄 Reagendar consulta
 */
router.patch('/:id/reschedule',
  authorize(UserRole.NUTRITIONIST),
  [
    param('id').isMongoId().withMessage('ID da consulta inválido'),
    body('newDate')
      .isISO8601()
      .withMessage('Nova data inválida')
      .custom((value) => {
        if (new Date(value) <= new Date()) {
          throw new Error('Nova data deve ser no futuro');
        }
        return true;
      }),
    body('reason').optional().isLength({ max: 500 }).withMessage('Motivo muito longo')
  ],
  validateRequest,
  auditSensitiveAccess('consultation_reschedule', 'PATIENT', (req) => req.params.id || ''),
  ConsultationController.rescheduleConsultation
);

/**
 * 📊 Estatísticas das consultas
 */
router.get('/stats/overview',
  authorize(UserRole.NUTRITIONIST),
  [
    query('startDate').optional().isISO8601().withMessage('Data inicial inválida'),
    query('endDate').optional().isISO8601().withMessage('Data final inválida')
  ],
  validateRequest,
  ConsultationController.getConsultationStatistics
);

export { router as consultationRoutes };
