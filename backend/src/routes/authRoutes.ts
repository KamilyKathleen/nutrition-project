import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate } from '../middlewares/validation';
import Joi from 'joi';

const router = Router();
const authController = new AuthController();

// Schemas de validação
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  cpf: Joi.string().length(11).pattern(/^\d+$/).required(),
  phone: Joi.string().min(10).max(15).required(),
  crn: Joi.when('role', {
    is: 'nutritionist',
    then: Joi.string().pattern(/^CRN-\d\/\d{4,5}$/).required().messages({
      'any.required': 'CRN é obrigatório para nutricionistas',
      'string.pattern.base': 'CRN deve ter formato válido (ex: CRN-3/1234)'
    }),
    otherwise: Joi.optional()
  }),
  role: Joi.string().valid('student', 'nutritionist', 'admin').required()
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
  newPassword: Joi.string().min(8).max(128).required()
});

// Rotas
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', /* loginRateLimiterMiddleware, */ validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

export { router as authRoutes };