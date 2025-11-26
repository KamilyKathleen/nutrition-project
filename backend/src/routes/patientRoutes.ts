import { Router } from 'express';
import { PatientController } from '../controllers/PatientController';
import { authenticate } from '../middlewares/auth';
import { validate, validateQuery } from '../middlewares/validation';
import { auditPatientAccess, auditPatientList, auditMedicalDataAccess } from '../middlewares/auditMiddleware';
import Joi from 'joi';

const router = Router();
const patientController = new PatientController();

// 🎯 SCHEMAS DE VALIDAÇÃO
const createPatientSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  email: Joi.string().email().optional(),
  birthDate: Joi.date().required(),
  gender: Joi.string().valid('male', 'female', 'other').required(),
  address: Joi.object({
    street: Joi.string().required(),
    number: Joi.string().required(),
    neighborhood: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().length(2).required(),
    zipCode: Joi.string().required()
  }).optional(),
  medicalHistory: Joi.string().optional(),
  allergies: Joi.array().items(Joi.string()).optional(),
  medications: Joi.array().items(Joi.string()).optional(),
  nutritionalGoals: Joi.array().items(Joi.string()).optional(),
  notes: Joi.string().optional()
});

const updatePatientSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  birthDate: Joi.date().optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  address: Joi.object({
    street: Joi.string().optional(),
    number: Joi.string().optional(),
    neighborhood: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().length(2).optional(),
    zipCode: Joi.string().optional()
  }).optional(),
  medicalHistory: Joi.string().optional(),
  allergies: Joi.array().items(Joi.string()).optional(),
  medications: Joi.array().items(Joi.string()).optional(),
  nutritionalGoals: Joi.array().items(Joi.string()).optional(),
  notes: Joi.string().optional()
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

// 🛣️ ROTAS
/**
 * 📝 CRIAR PACIENTE
 * POST /api/patients
 * Headers: Authorization: Bearer <token>
 * Body: CreatePatientRequest
 */
router.post(
  '/',
  authenticate,
  validate(createPatientSchema),
  auditPatientAccess('PATIENT_CREATE'),
  patientController.create.bind(patientController)
);

/**
 * 📋 LISTAR PACIENTES
 * GET /api/patients?page=1&limit=20
 * Headers: Authorization: Bearer <token>
 */
router.get(
  '/',
  authenticate,
  validateQuery(querySchema),
  auditPatientList(),
  patientController.list.bind(patientController)
);

/**
 * 🔍 BUSCAR PACIENTE POR ID
 * GET /api/patients/:id
 * Headers: Authorization: Bearer <token>
 */
router.get(
  '/:id',
  authenticate,
  auditPatientAccess('PATIENT_READ'),
  auditMedicalDataAccess(),
  patientController.findById.bind(patientController)
);

/**
 * ✏️ ATUALIZAR PACIENTE
 * PUT /api/patients/:id
 * Headers: Authorization: Bearer <token>
 * Body: UpdatePatientRequest
 */
router.put(
  '/:id',
  authenticate,
  validate(updatePatientSchema),
  auditPatientAccess('PATIENT_UPDATE'),
  patientController.update.bind(patientController)
);

/**
 * �️ DELETAR PACIENTE
 * DELETE /api/patients/:id
 * Headers: Authorization: Bearer <token>
 */
router.delete(
  '/:id',
  authenticate,
  auditPatientAccess('PATIENT_DELETE'),
  patientController.delete.bind(patientController)
);

export { router as patientRoutes };
