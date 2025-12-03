/**
 * 📊 ROTAS DE MÉTRICAS E ANALYTICS
 * ================================
 * Sistema completo de consulta e análise de métricas
 */

import express, { Router, Request, Response } from 'express';
import { body, query, param } from 'express-validator';
import { authenticate, authorize } from '../middlewares/auth';
import { validateRequest } from '../middlewares/expressValidation';
import { auditSensitiveAccess } from '../middlewares/auditMiddleware';
import { MetricController } from '../controllers/MetricController';
import { UserRole } from '../types';
import { MetricType, MetricCategory } from '../models/Metric';

const router = Router();
const metricController = new MetricController();

// Middleware de autenticação para todas as rotas
router.use(authenticate);

// ================================
// 🎯 VALIDAÇÕES
// ================================

const recordMetricValidation = [
  body('type')
    .isIn(Object.values(MetricType))
    .withMessage('Tipo de métrica inválido'),
  body('value')
    .optional()
    .isNumeric()
    .withMessage('Valor deve ser numérico'),
  validateRequest
];

const aggregationValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Data de início inválida'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Data de fim inválida'),
  query('groupBy')
    .optional()
    .isIn(['hour', 'day', 'week', 'month', 'year'])
    .withMessage('Agrupamento inválido'),
  validateRequest
];

// ================================
// 🎯 ROTAS BÁSICAS
// ================================

/**
 * 📊 POST /metrics - Registrar nova métrica
 */
router.post('/',
  recordMetricValidation,
  metricController.recordMetric.bind(metricController)
);

/**
 * 📊 POST /metrics/batch - Registrar múltiplas métricas
 */
router.post('/batch',
  body('metrics').isArray().withMessage('Métricas devem ser um array'),
  validateRequest,
  metricController.recordBatch.bind(metricController)
);

/**
 * 📊 GET /metrics - Buscar métricas
 */
router.get('/',
  query('limit').optional().isInt({ min: 1, max: 1000 }),
  query('skip').optional().isInt({ min: 0 }),
  validateRequest,
  metricController.findMetrics.bind(metricController)
);

/**
 * 📈 GET /metrics/report - Gerar relatório
 */
router.get('/report',
  aggregationValidation,
  metricController.getReport.bind(metricController)
);

/**
 * 📅 GET /metrics/period - Métricas por período
 */
router.get('/period',
  aggregationValidation,
  metricController.getMetricsByPeriod.bind(metricController)
);

/**
 * 👤 GET /metrics/user/:userId - Métricas do usuário
 */
router.get('/user/:userId',
  param('userId').isMongoId().withMessage('ID do usuário inválido'),
  validateRequest,
  metricController.getUserMetrics.bind(metricController)
);

/**
 * 🧹 DELETE /metrics/cleanup - Limpar métricas antigas
 */
router.delete('/cleanup',
  authorize(UserRole.ADMIN),
  query('days').optional().isInt({ min: 1 }),
  validateRequest,
  metricController.cleanupMetrics.bind(metricController)
);

// ================================
// 🎯 ROTAS DE INFORMAÇÃO
// ================================

/**
 * 📋 GET /metrics/types - Listar tipos de métricas
 */
router.get('/types', (req: Request, res: Response) => {
  const types = Object.values(MetricType).map(type => ({
    value: type,
    label: type.replace(/_/g, ' ').toLowerCase(),
    category: 'unknown' // Simplificado por enquanto
  }));

  res.json({
    success: true,
    data: types
  });
});

/**
 * 📋 GET /metrics/categories - Listar categorias de métricas
 */
router.get('/categories', (req: Request, res: Response) => {
  const categories = Object.values(MetricCategory).map(category => ({
    value: category,
    label: category.replace(/_/g, ' ').toLowerCase()
  }));

  res.json({
    success: true,
    data: categories
  });
});

/**
 * ❤️ GET /metrics/health - Status do sistema de métricas
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Sistema de métricas operacional',
    data: {
      status: 'healthy',
      timestamp: new Date(),
      version: '1.0.0'
    }
  });
});

export default router;