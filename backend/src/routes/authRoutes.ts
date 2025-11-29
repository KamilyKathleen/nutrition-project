import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate } from '../middlewares/validation';
import Joi from 'joi';

const router = Router();
const authController = new AuthController();

// 🔒 Schema de validação de senha Firebase-compatible
// Firebase exige: 6-12 chars + maiúscula + minúscula + número + especial
const firebasePasswordSchema = Joi.string()
  .min(6)
  .max(12) // 🚨 Firebase limita a 12 caracteres máximo!
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>\-_=+[\]\\;'/`~]).{6,12}$/)
  .required()
  .messages({
    'string.min': 'A senha deve ter pelo menos 6 caracteres',
    'string.max': 'A senha deve ter no máximo 12 caracteres (limitação do Firebase)',
    'string.pattern.base': 'A senha deve ter 6-12 caracteres e conter pelo menos: 1 letra minúscula, 1 letra maiúscula, 1 número e 1 caractere especial',
    'any.required': 'Senha é obrigatória'
  });

// Schemas de validação
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: firebasePasswordSchema,
  crn: Joi.when('role', {
    is: 'nutritionist',
    then: Joi.string().pattern(/^CRN-\d\/\d{4,5}$/).required().messages({
      'any.required': 'CRN é obrigatório para nutricionistas',
      'string.pattern.base': 'CRN deve ter formato válido (ex: CRN-3/1234)'
    }),
    otherwise: Joi.optional()
  }),
  role: Joi.string().valid('student', 'patient', 'nutritionist', 'admin').required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: firebasePasswordSchema
});

// Rotas
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', /* loginRateLimiterMiddleware, */ validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

export { router as authRoutes };