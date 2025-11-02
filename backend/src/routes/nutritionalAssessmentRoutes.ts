/**
 * 📊 ROTAS DE AVALIAÇÃO NUTRICIONAL
 * =================================
 * Sistema completo de avaliações nutricionais
 */

import { Router } from 'express';
import { NutritionalAssessmentController } from '@/controllers/NutritionalAssessmentController';
import { authenticate, authorize } from '@/middlewares/auth';
import { validate } from '@/middlewares/validation';
import { auditSensitiveAccess } from '@/middlewares/auditMiddleware';
import { UserRole } from '@/types';
import Joi from 'joi';

const router = Router();
const controller = new NutritionalAssessmentController();

/**
 * 🎯 SCHEMAS DE VALIDAÇÃO
 */
const createAssessmentSchema = Joi.object({
  patientId: Joi.string().required(),
  anthropometricData: Joi.object({
    height: Joi.number().min(50).max(300).required(),
    weight: Joi.number().min(10).max(500).required(),
    waistCircumference: Joi.number().min(30).max(200).optional(),
    hipCircumference: Joi.number().min(40).max(200).optional(),
    bodyFatPercentage: Joi.number().min(1).max(70).optional(),
    muscleMass: Joi.number().min(10).max(200).optional(),
    boneDensity: Joi.number().min(0.5).max(3).optional(),
    skinfoldMeasurements: Joi.array().items(
      Joi.object({
        location: Joi.string().valid('bicep', 'tricep', 'subscapular', 'suprailiac', 'abdominal', 'thigh', 'calf').required(),
        measurement: Joi.number().min(1).max(100).required()
      })
    ).optional()
  }).required(),
  foodRecord: Joi.object({
    date: Joi.date().optional(),
    meals: Joi.array().items(
      Joi.object({
        type: Joi.string().valid('breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'evening_snack').required(),
        time: Joi.string().pattern(/^([0-1]?\d|2[0-3]):[0-5]\d$/).required(),
        foods: Joi.array().items(
          Joi.object({
            name: Joi.string().min(2).required(),
            quantity: Joi.number().min(0.1).required(),
            unit: Joi.string().valid('g', 'kg', 'ml', 'l', 'unidade', 'fatia', 'colher', 'xícara', 'copo').required(),
            calories: Joi.number().min(0).optional(),
            proteins: Joi.number().min(0).optional(),
            carbohydrates: Joi.number().min(0).optional(),
            fats: Joi.number().min(0).optional(),
            fiber: Joi.number().min(0).optional()
          })
        ).required()
      })
    ).required(),
    notes: Joi.string().max(1000).optional()
  }).optional(),
  physicalActivity: Joi.object({
    weeklyFrequency: Joi.number().min(0).max(7).required(),
    activities: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        duration: Joi.number().min(1).max(600).required(),
        intensity: Joi.string().valid('low', 'moderate', 'high').required(),
        frequency: Joi.number().min(1).max(7).required()
      })
    ).required(),
    sedentaryTime: Joi.number().min(0).max(24).required()
  }).optional(),
  observations: Joi.string().max(2000).optional()
});

const updateAssessmentSchema = createAssessmentSchema.fork(['patientId', 'anthropometricData'], (schema) => schema.optional());

/**
 * 🔐 APLICAR AUTENTICAÇÃO E AUTORIZAÇÃO
 */
router.use(authenticate);
router.use(authorize(UserRole.NUTRITIONIST, UserRole.ADMIN));

/**
 * ➕ CRIAR AVALIAÇÃO NUTRICIONAL
 */
router.post('/',
  validate(createAssessmentSchema),
  auditSensitiveAccess('CREATE', 'ASSESSMENT', (req) => req.body.patientId || 'unknown'),
  controller.createAssessment
);

/**
 * 📋 LISTAR AVALIAÇÕES DO NUTRICIONISTA
 */
router.get('/',
  auditSensitiveAccess('LIST', 'ASSESSMENT', (req) => (req as any).user?.userId || 'unknown'),
  controller.getAssessmentsByNutritionist
);

/**
 * 📊 ESTATÍSTICAS DE AVALIAÇÕES
 */
router.get('/statistics',
  controller.getAssessmentStatistics
);

/**
 * 📋 LISTAR AVALIAÇÕES POR PACIENTE
 */
router.get('/patient/:patientId',
  auditSensitiveAccess('LIST', 'ASSESSMENT', (req) => req.params.patientId || 'unknown'),
  controller.getAssessmentsByPatient
);

/**
 * 📈 EVOLUÇÃO DO PACIENTE
 */
router.get('/patient/:patientId/evolution',
  auditSensitiveAccess('VIEW', 'ASSESSMENT', (req) => req.params.patientId || 'unknown'),
  controller.getPatientEvolution
);

/**
 * 🏃‍♀️ ANÁLISE DE ATIVIDADE FÍSICA
 */
router.get('/patient/:patientId/activity-analysis',
  auditSensitiveAccess('VIEW', 'ASSESSMENT', (req) => req.params.patientId || 'unknown'),
  controller.getPhysicalActivityAnalysis
);

/**
 * 🔍 BUSCAR AVALIAÇÃO POR ID
 */
router.get('/:id',
  auditSensitiveAccess('VIEW', 'ASSESSMENT', (req) => req.params.id || 'unknown'),
  controller.getAssessmentById
);

/**
 * ✏️ ATUALIZAR AVALIAÇÃO NUTRICIONAL
 */
router.put('/:id',
  validate(updateAssessmentSchema),
  auditSensitiveAccess('UPDATE', 'ASSESSMENT', (req) => req.params.id || 'unknown'),
  controller.updateAssessment
);

/**
 * 🗑️ EXCLUIR AVALIAÇÃO NUTRICIONAL
 */
router.delete('/:id',
  auditSensitiveAccess('DELETE', 'ASSESSMENT', (req) => req.params.id || 'unknown'),
  controller.deleteAssessment
);

export { router as nutritionalAssessmentRoutes };
