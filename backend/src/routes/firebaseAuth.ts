import { Router, Request, Response, NextFunction } from 'express';
import { FirebaseAuthController } from '../controllers/FirebaseAuthController';
import { body, validationResult } from 'express-validator';
import { AppError } from '../middlewares/errorHandler';

// Middleware para validar express-validator
const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new AppError(`Dados inválidos: ${errorMessages.join(', ')}`, 400));
  }
  next();
};

/**
 * 🔥 FIREBASE AUTH ROUTES
 * 
 * Rotas básicas para autenticação Firebase:
 * - POST /api/firebase/login - Login ou criação de usuário Firebase básico
 * - GET /api/firebase/profile - Obter perfil do usuário autenticado
 */

const router = Router();
const firebaseAuthController = new FirebaseAuthController();

// Validators
const loginValidators = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('email')
    .isEmail()
    .withMessage('Email deve ser válido')
    .normalizeEmail(),
  validateRequest
];

/**
 * POST /api/firebase/login
 * Login com Firebase - cria ou autentica usuário básico (SEM CPF, telefone, avatar)
 * Body: { name?: string, email: string }
 * Headers: Authorization: Bearer <firebase_token>
 */
router.post(
  '/login',
  loginValidators,
  firebaseAuthController.loginWithFirebase
);

/**
 * GET /api/firebase/profile
 * Obter perfil do usuário Firebase autenticado
 * Headers: Authorization: Bearer <firebase_token>
 */
router.get(
  '/profile',
  firebaseAuthController.getProfile
);

export default router;