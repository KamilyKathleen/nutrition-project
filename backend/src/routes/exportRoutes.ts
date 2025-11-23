/**
 * 📊 ROTAS DE EXPORTAÇÃO EXCEL
 * ============================
 * Sistema completo de exportação de dados em planilhas Excel
 */

import { Router, Response, NextFunction } from 'express';
import { query, param } from 'express-validator';
import { authenticate, authorize, AuthenticatedRequest } from '../middlewares/auth';
import { validateRequest } from '../middlewares/expressValidation';
import { auditSensitiveAccess } from '../middlewares/auditMiddleware';
import { ExcelExportController } from '../controllers/ExcelExportController';
import { UserRole } from '../types';

const router = Router();
const exportController = new ExcelExportController();

// Middleware de autenticação para todas as rotas
router.use(authenticate);

// ================================
// 🎯 VALIDAÇÕES
// ================================

/**
 * 📊 Validações para exportação
 */
const exportValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Data inicial deve estar no formato ISO8601'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Data final deve estar no formato ISO8601'),
  query('patientId')
    .optional()
    .isMongoId()
    .withMessage('ID do paciente inválido'),
  query('fileName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Nome do arquivo deve ter entre 1 e 100 caracteres')
    .matches(/^[a-zA-Z0-9_\-\s\.]+$/)
    .withMessage('Nome do arquivo contém caracteres inválidos'),
  query('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Título deve ter entre 1 e 200 caracteres'),
  query('description')
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage('Descrição deve ter entre 1 e 500 caracteres'),
  query('includeHeaders')
    .optional()
    .isBoolean()
    .withMessage('includeHeaders deve ser um boolean'),
  query('includeMetadata')
    .optional()
    .isBoolean()
    .withMessage('includeMetadata deve ser um boolean'),
  query('fields')
    .optional()
    .isString()
    .withMessage('fields deve ser uma string com nomes de campos separados por vírgula')
];

/**
 * 📊 Validação para exportação por paciente
 */
const patientExportValidation = [
  param('patientId')
    .isMongoId()
    .withMessage('ID do paciente inválido'),
  ...exportValidation
];

// ================================
// 🎯 ROTAS DE EXPORTAÇÃO ESPECÍFICA
// ================================

/**
 * 👥 Exportar pacientes
 */
router.get('/patients',
  exportValidation,
  validateRequest,
  auditSensitiveAccess('export_patients', 'USER', (req: AuthenticatedRequest) => req.user?.userId || ''),
  exportController.exportPatients
);

/**
 * 📋 Exportar avaliações nutricionais
 */
router.get('/assessments',
  exportValidation,
  validateRequest,
  auditSensitiveAccess('export_assessments', 'USER', (req: AuthenticatedRequest) => req.user?.userId || ''),
  exportController.exportAssessments
);

/**
 * 🍽️ Exportar planos alimentares
 */
router.get('/diet-plans',
  exportValidation,
  validateRequest,
  auditSensitiveAccess('export_diet_plans', 'USER', (req: AuthenticatedRequest) => req.user?.userId || ''),
  exportController.exportDietPlans
);

/**
 * 📅 Exportar consultas
 */
router.get('/consultations',
  exportValidation,
  validateRequest,
  auditSensitiveAccess('export_consultations', 'USER', (req: AuthenticatedRequest) => req.user?.userId || ''),
  exportController.exportConsultations
);

/**
 * 📊 Exportar métricas (admin apenas)
 */
router.get('/metrics',
  authorize(UserRole.ADMIN),
  exportValidation,
  validateRequest,
  auditSensitiveAccess('export_metrics', 'USER', (req: AuthenticatedRequest) => req.user?.userId || ''),
  exportController.exportMetrics
);

// ================================
// 🎯 ROTAS DE EXPORTAÇÃO COMBINADA
// ================================

/**
 * 📊 Exportar relatório completo
 */
router.get('/complete',
  authorize([UserRole.ADMIN, UserRole.NUTRITIONIST]),
  exportValidation,
  validateRequest,
  auditSensitiveAccess('export_complete_report', 'USER', (req: AuthenticatedRequest) => req.user?.userId || ''),
  exportController.exportComprehensiveReport
);

/**
 * 👤 Exportar dados específicos de um paciente
 */
router.get('/patient/:patientId',
  patientExportValidation,
  validateRequest,
  auditSensitiveAccess('export_patient_data', 'PATIENT', (req: AuthenticatedRequest) => req.params.patientId || ''),
  exportController.exportPatients
);

// ================================
// 🎯 ROTAS DE INFORMAÇÕES
// ================================

/**
 * ℹ️ Informações sobre exportações disponíveis
 */
router.get('/info',
  (req: AuthenticatedRequest, res: Response) => {
    res.json({
      success: true,
      message: 'Informações sobre exportações disponíveis',
      data: {
        formats: ['xlsx', 'csv'],
        types: ['patients', 'assessments', 'dietPlans', 'consultations', 'metrics', 'complete'],
        description: 'Sistema de exportação em Excel/CSV'
      }
    });
  }
);

/**
 * 🔧 Configurações de exportação
 */
router.get('/config',
  (req, res) => {
    res.json({
      success: true,
      message: 'Configurações de exportação obtidas com sucesso',
      data: {
        formats: {
          supported: ['xlsx'],
          default: 'xlsx',
          contentTypes: {
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        },
        limits: {
          maxRecords: 100000,
          maxFileSize: 52428800, // 50MB em bytes
          maxColumns: 1000,
          maxSheets: 10
        },
        features: {
          multipleSheets: true,
          customTitles: true,
          dateFiltering: true,
          userFiltering: true,
          patientFiltering: true,
          fieldSelection: true,
          customStyling: true
        },
        dateFormats: {
          input: 'ISO8601 (YYYY-MM-DDTHH:mm:ss.sssZ)',
          output: 'dd/MM/yyyy',
          examples: {
            valid: ['2024-01-15T10:30:00Z', '2024-12-31T23:59:59.999Z'],
            invalid: ['15/01/2024', '2024-01-15', 'Janeiro 2024']
          }
        },
        security: {
          authentication: 'required',
          authorization: {
            patients: ['ADMIN', 'NUTRITIONIST', 'PATIENT'],
            assessments: ['ADMIN', 'NUTRITIONIST', 'PATIENT'],
            dietPlans: ['ADMIN', 'NUTRITIONIST', 'PATIENT'],
            consultations: ['ADMIN', 'NUTRITIONIST', 'PATIENT'],
            metrics: ['ADMIN'],
            complete: ['ADMIN', 'NUTRITIONIST']
          },
          audit: 'all_exports_logged'
        }
      }
    });
  }
);

// ================================
// 🎯 ROTAS DE CONVENIÊNCIA
// ================================

/**
 * 📊 Exportação rápida - últimos 30 dias
 */
router.get('/quick/last-30-days/:type',
  [
    param('type')
      .isIn(['patients', 'assessments', 'diet-plans', 'consultations', 'complete'])
      .withMessage('Tipo de exportação inválido'),
    ...exportValidation.filter(validation => 
      !['startDate', 'endDate'].some(field => 
        validation.toString().includes(field)
      )
    )
  ],
  validateRequest,
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Configurar automaticamente para últimos 30 dias
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    req.query.startDate = startDate.toISOString();
    req.query.endDate = endDate.toISOString();
    
    if (!req.query.title) {
      req.query.title = `Relatório dos Últimos 30 Dias - ${req.params.type}`;
    }
    
    next();
  },
  auditSensitiveAccess('export_quick_30_days', 'USER', (req: AuthenticatedRequest) => req.user?.userId || ''),
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Direcionar para o método correto baseado no tipo
    const type = req.params.type;
    
    switch (type) {
      case 'patients':
        return exportController.exportPatients(req, res, next);
      case 'assessments':
        return exportController.exportAssessments(req, res, next);
      case 'diet-plans':
        return exportController.exportDietPlans(req, res, next);
      case 'consultations':
        return exportController.exportConsultations(req, res, next);
      case 'complete':
        return exportController.exportComprehensiveReport(req, res, next);
      default:
        return next(new Error('Tipo de exportação não suportado'));
    }
  }
);

/**
 * 📊 Exportação mensal
 */
router.get('/monthly/:year/:month/:type',
  [
    param('year')
      .isInt({ min: 2020, max: 2030 })
      .withMessage('Ano deve estar entre 2020 e 2030'),
    param('month')
      .isInt({ min: 1, max: 12 })
      .withMessage('Mês deve estar entre 1 e 12'),
    param('type')
      .isIn(['patients', 'assessments', 'diet-plans', 'consultations', 'complete'])
      .withMessage('Tipo de exportação inválido'),
    ...exportValidation.filter(validation => 
      !['startDate', 'endDate'].some(field => 
        validation.toString().includes(field)
      )
    )
  ],
  validateRequest,
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Configurar automaticamente para o mês especificado
    const year = Number.parseInt(req.params.year || '2024');
    const month = Number.parseInt(req.params.month || '1');
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    
    req.query.startDate = startDate.toISOString();
    req.query.endDate = endDate.toISOString();
    
    if (!req.query.title) {
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      req.query.title = `Relatório de ${monthNames[month - 1]}/${year} - ${req.params.type}`;
    }
    
    next();
  },
  auditSensitiveAccess('export_monthly', 'USER', (req: AuthenticatedRequest) => req.user?.userId || ''),
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Direcionar para o método correto baseado no tipo
    const type = req.params.type;
    
    switch (type) {
      case 'patients':
        return exportController.exportPatients(req, res, next);
      case 'assessments':
        return exportController.exportAssessments(req, res, next);
      case 'diet-plans':
        return exportController.exportDietPlans(req, res, next);
      case 'consultations':
        return exportController.exportConsultations(req, res, next);
      case 'complete':
        return exportController.exportComprehensiveReport(req, res, next);
      default:
        return next(new Error('Tipo de exportação não suportado'));
    }
  }
);

export { router as exportRoutes };