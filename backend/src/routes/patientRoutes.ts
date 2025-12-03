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
  email: Joi.string().email().optional().allow('', null),
  phone: Joi.string().optional(),
  dateOfBirth: Joi.date().optional(),
  birthDate: Joi.date().optional(),
  sex: Joi.string().valid('male', 'female', 'other').optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  goal: Joi.string().optional(),
  medicalHistory: Joi.string().optional(),
  allergies: Joi.array().items(Joi.string()).optional(),
  medications: Joi.array().items(Joi.string()).optional(),
  nutritionalGoals: Joi.array().items(Joi.string()).optional(),
  notes: Joi.string().optional()
});

const updatePatientSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional().allow('', null),
  phone: Joi.string().optional(),
  dateOfBirth: Joi.date().optional(),
  birthDate: Joi.date().optional(),
  sex: Joi.string().valid('male', 'female', 'other').optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  goal: Joi.string().optional(),
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
 * � VERIFICAR RELACIONAMENTO DO PACIENTE
 * GET /api/patients/me
 * Headers: Authorization: Bearer <token>
 */
router.get(
  '/me',
  authenticate,
  patientController.getMyRelationship.bind(patientController)
);

/**
 * 👨‍⚕️ BUSCAR NUTRICIONISTA VINCULADO
 * GET /api/patients/nutritionist
 * Headers: Authorization: Bearer <token>
 */
router.get(
  '/nutritionist',
  authenticate,
  patientController.getMyNutritionist.bind(patientController)
);

/**
 * �🔍 BUSCAR PACIENTE POR ID
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
 * � VINCULAR PACIENTE A USUÁRIO
 * PUT /api/patients/:id/link
 * Headers: Authorization: Bearer <token>
 * Body: { userId: string }
 */
const linkPatientSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'E-mail é obrigatório',
    'any.required': 'E-mail é obrigatório',
    'string.email': 'E-mail inválido'
  })
});

router.put(
  '/:id/link',
  authenticate,
  validate(linkPatientSchema),
  auditPatientAccess('PATIENT_UPDATE'),
  patientController.linkToUser.bind(patientController)
);

/**
 * �🗑️ DELETAR PACIENTE
 * DELETE /api/patients/:id
 * Headers: Authorization: Bearer <token>
 */
router.delete(
  '/:id',
  authenticate,
  auditPatientAccess('PATIENT_DELETE'),
  patientController.delete.bind(patientController)
);

// 📧 SISTEMA DE CONVITES DE PACIENTES
const inviteSchema = Joi.object({
  patientEmail: Joi.string().email().required(),
  patientName: Joi.string().optional(),
  message: Joi.string().optional()
});

/**
 * 📤 ENVIAR CONVITE PARA PACIENTE
 * POST /api/patients/invite
 * Headers: Authorization: Bearer <token>
 * Body: { patientEmail: string, patientName?: string, message?: string }
 */
router.post(
  '/invite',
  authenticate,
  validate(inviteSchema),
  patientController.sendInvite.bind(patientController)
);

/**
 * 📋 LISTAR CONVITES ENVIADOS
 * GET /api/patients/invites
 * Headers: Authorization: Bearer <token>
 */
router.get(
  '/invites',
  authenticate,
  patientController.listInvites.bind(patientController)
);

/**
 * 🗑️ CANCELAR/EXCLUIR CONVITE
 * DELETE /api/patients/invite/:inviteId
 * Headers: Authorization: Bearer <token>
 */
router.delete(
  '/invite/:inviteId',
  authenticate,
  patientController.cancelInvite.bind(patientController)
);

export { router as patientRoutes };
