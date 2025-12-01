/**
 * 🍽️ ROTAS DE PLANOS DIETÉTICOS
 * =============================
 * Sistema completo de gerenciamento de planos alimentares
 */

import { Router } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import DietPlanController from '../controllers/DietPlanController';
import { authenticate, authorize } from '../middlewares/auth';
import { auditSensitiveAccess } from '../middlewares/auditMiddleware';
import { AppError } from '../middlewares/errorHandler';
import { UserRole } from '../types';

const router = Router();

/**
 * 🔒 MIDDLEWARE DE VALIDAÇÃO DE REQUEST
 */
const validateRequest = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Dados inválidos: ' + errors.array().map(e => e.msg).join(', '), 400));
  }
  next();
};

/**
 * 🔒 MIDDLEWARE DE AUTENTICAÇÃO APLICADO A TODAS AS ROTAS
 */
router.use(authenticate);

/**
 * 📋 ROTA ESPECÍFICA PARA PACIENTE VER SEUS PRÓPRIOS PLANOS
 * Deve vir ANTES das autorizações de nutricionista
 */
router.get('/my-plans',
  authorize([UserRole.PATIENT]),
  DietPlanController.getMyPlans
);

/**
 * 📄 ROTA PARA PACIENTE BAIXAR PLANO ATIVO EM PDF
 */
router.get('/active/pdf',
  authorize([UserRole.PATIENT]),
  DietPlanController.downloadActivePlanPDF
);

/**
 * 🎯 VALIDAÇÕES PARA CRIAÇÃO DE PLANO DIETÉTICO
 */
const createDietPlanValidation = [
  body('patientId')
    .isMongoId()
    .withMessage('ID do paciente inválido'),
  body('title')
    .isLength({ min: 3, max: 100 })
    .withMessage('Título deve ter entre 3 e 100 caracteres')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres')
    .trim(),
  body('startDate')
    .isISO8601()
    .withMessage('Data de início inválida'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Data de fim inválida'),
  body('targetCalories')
    .isNumeric()
    .isFloat({ min: 800, max: 5000 })
    .withMessage('Meta de calorias deve estar entre 800 e 5000'),
  body('targetProteins')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Meta de proteínas deve ser positiva'),
  body('targetCarbohydrates')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Meta de carboidratos deve ser positiva'),
  body('targetFats')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Meta de gorduras deve ser positiva'),
  body('meals')
    .isArray({ min: 1 })
    .withMessage('Deve haver pelo menos uma refeição'),
  body('meals.*.type')
    .isIn(['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'evening_snack'])
    .withMessage('Tipo de refeição inválido'),
  body('meals.*.time')
    .matches(/^([0-1]?\d|2[0-3]):[0-5]\d$/)
    .withMessage('Horário deve estar no formato HH:MM'),
  body('meals.*.foods')
    .isArray({ min: 1 })
    .withMessage('Cada refeição deve ter pelo menos um alimento'),
  body('meals.*.foods.*.name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome do alimento deve ter entre 2 e 100 caracteres'),
  body('meals.*.foods.*.quantity')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Quantidade deve ser positiva'),
  body('meals.*.foods.*.unit')
    .isLength({ min: 1, max: 20 })
    .withMessage('Unidade deve ter entre 1 e 20 caracteres')
];

/**
 * 🎯 VALIDAÇÕES PARA ATUALIZAÇÃO DE PLANO DIETÉTICO
 */
const updateDietPlanValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID do plano inválido'),
  body('title')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Título deve ter entre 3 e 100 caracteres')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres')
    .trim(),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Data de fim inválida'),
  body('targetCalories')
    .optional()
    .isNumeric()
    .isFloat({ min: 800, max: 5000 })
    .withMessage('Meta de calorias deve estar entre 800 e 5000'),
  body('targetProteins')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Meta de proteínas deve ser positiva'),
  body('targetCarbohydrates')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Meta de carboidratos deve ser positiva'),
  body('targetFats')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Meta de gorduras deve ser positiva'),
  body('meals')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Deve haver pelo menos uma refeição'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Status ativo deve ser verdadeiro ou falso')
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
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('Filtro ativo deve ser verdadeiro ou falso'),
  query('patientId')
    .optional()
    .isMongoId()
    .withMessage('ID do paciente inválido'),
  query('search')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Busca deve ter entre 2 e 50 caracteres')
];

// ================================
// 🎯 ROTAS PRINCIPAIS - CRUD
// ================================

/**
 * 📝 Criar novo plano dietético
 * Apenas nutricionistas podem criar planos
 */
router.post('/',
  authorize(UserRole.NUTRITIONIST),
  createDietPlanValidation,
  validateRequest,
  auditSensitiveAccess('diet_plan_create', 'PATIENT', (req) => req.body.patientId),
  DietPlanController.createDietPlan
);

/**
 * 📋 Listar planos do nutricionista (com paginação e filtros)
 */
router.get('/',
  authorize(UserRole.NUTRITIONIST),
  paginationValidation,
  validateRequest,
  DietPlanController.getDietPlansByNutritionist
);

/**
 * 🔍 Buscar plano por ID
 */
router.get('/:id',
  [param('id').isMongoId().withMessage('ID do plano inválido')],
  validateRequest,
  DietPlanController.getDietPlanById
);

/**
 * ✏️ Atualizar plano dietético
 * Apenas o nutricionista que criou pode editar
 */
router.put('/:id',
  authorize(UserRole.NUTRITIONIST),
  updateDietPlanValidation,
  validateRequest,
  auditSensitiveAccess('diet_plan_update', 'PATIENT', (req) => req.params.id || ''),
  DietPlanController.updateDietPlan
);

/**
 * 🗑️ Remover plano dietético
 * Apenas o nutricionista que criou pode remover
 */
router.delete('/:id',
  authorize(UserRole.NUTRITIONIST),
  [param('id').isMongoId().withMessage('ID do plano inválido')],
  validateRequest,
  auditSensitiveAccess('diet_plan_delete', 'PATIENT', (req) => req.params.id || ''),
  DietPlanController.deleteDietPlan
);

// ================================
// 🎯 ROTAS ESPECIALIZADAS
// ================================

/**
 * 🎯 Buscar plano ativo do paciente
 * Pacientes podem ver seu próprio plano, nutricionistas podem ver qualquer um
 */
router.get('/patient/:patientId/active',
  [param('patientId').isMongoId().withMessage('ID do paciente inválido')],
  validateRequest,
  DietPlanController.getActiveDietPlan
);

/**
 * 📊 Análise nutricional do plano
 */
router.get('/:id/analysis',
  [param('id').isMongoId().withMessage('ID do plano inválido')],
  validateRequest,
  DietPlanController.getNutritionalAnalysis
);

/**
 * 📈 Estatísticas dos planos do nutricionista
 */
router.get('/stats/overview',
  authorize(UserRole.NUTRITIONIST),
  DietPlanController.getDietPlanStatistics
);

/**
 * 🔄 Duplicar plano dietético
 * Cria uma cópia do plano para reutilização
 */
router.post('/:id/duplicate',
  authorize(UserRole.NUTRITIONIST),
  [
    param('id').isMongoId().withMessage('ID do plano inválido'),
    body('patientId').isMongoId().withMessage('ID do paciente inválido'),
    body('title').optional().isLength({ min: 3, max: 100 }).withMessage('Título deve ter entre 3 e 100 caracteres')
  ],
  validateRequest,
  auditSensitiveAccess('diet_plan_duplicate', 'PATIENT', (req) => req.body.patientId),
  DietPlanController.duplicateDietPlan
);

/**
 * ⏹️ Ativar/Desativar plano
 */
router.patch('/:id/toggle-status',
  authorize(UserRole.NUTRITIONIST),
  [param('id').isMongoId().withMessage('ID do plano inválido')],
  validateRequest,
  auditSensitiveAccess('diet_plan_status_change', 'PATIENT', (req) => req.params.id || ''),
  DietPlanController.toggleDietPlan
);

/**
 * 📋 Relatório detalhado do plano com recomendações
 */
router.get('/:id/report',
  [param('id').isMongoId().withMessage('ID do plano inválido')],
  validateRequest,
  DietPlanController.getDietPlanReport
);

/**
 * 🔍 Buscar histórico de planos de um paciente
 * Simplificado para apenas buscar planos por paciente
 */
router.get('/patient/:patientId',
  [
    param('patientId').isMongoId().withMessage('ID do paciente inválido'),
    ...paginationValidation
  ],
  validateRequest,
  DietPlanController.getDietPlansByNutritionist // Usando método existente com filtro
);

export { router as dietPlanRoutes };
