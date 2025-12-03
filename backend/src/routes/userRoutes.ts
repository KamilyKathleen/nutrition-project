import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticate, authorize } from '../middlewares/auth';
import { validate, validateParams, validateQuery } from '../middlewares/validation';
import { UserRole } from '../types';
import Joi from 'joi';

const router = Router();
const userController = new UserController();

// Schemas de validação
const idParamSchema = Joi.object({
  id: Joi.string().required().messages({
    'string.empty': 'ID é obrigatório',
    'any.required': 'ID é obrigatório'
  })
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  avatar: Joi.string().uri().optional()
});

const changeRoleSchema = Joi.object({
  role: Joi.string().valid(...Object.values(UserRole)).required()
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  role: Joi.string().valid(...Object.values(UserRole)).optional()
});

const searchQuerySchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'E-mail é obrigatório para busca',
    'string.email': 'E-mail inválido',
    'any.required': 'E-mail é obrigatório para busca'
  })
});

/**
 * 📋 ROTAS DE USUÁRIOS
 * 
 * Todas as rotas requerem autenticação
 * Algumas rotas requerem permissões específicas
 */

// GET /api/users/search - Buscar usuário por e-mail (nutricionista)
router.get('/search', 
  authenticate as any,
  authorize(UserRole.NUTRITIONIST) as any,
  validateQuery(searchQuerySchema),
  userController.searchByEmail
);

// GET /api/users - Listar usuários (admin)
router.get('/', 
  authenticate as any, 
  authorize(UserRole.ADMIN) as any,
  validateQuery(querySchema),
  userController.list
);

// GET /api/users/:id - Buscar usuário específico
router.get('/:id', 
  authenticate as any,
  validateParams(idParamSchema),
  userController.findById
);

// PUT /api/users/:id - Atualizar usuário
router.put('/:id', 
  authenticate as any,
  validateParams(idParamSchema),
  validate(updateUserSchema),
  userController.update
);

// DELETE /api/users/:id - Deletar usuário (apenas admin)
router.delete('/:id', 
  authenticate as any,
  authorize(UserRole.ADMIN) as any,
  validateParams(idParamSchema),
  userController.delete
);

// PATCH /api/users/:id/activate - Ativar usuário (apenas admin)
router.patch('/:id/activate', 
  authenticate as any,
  authorize(UserRole.ADMIN) as any,
  validateParams(idParamSchema),
  userController.activate
);

// PATCH /api/users/:id/deactivate - Desativar usuário (apenas admin)
router.patch('/:id/deactivate', 
  authenticate as any,
  authorize(UserRole.ADMIN) as any,
  validateParams(idParamSchema),
  userController.deactivate
);

// PATCH /api/users/:id/role - Alterar role (apenas admin)
router.patch('/:id/role', 
  authenticate as any,
  authorize(UserRole.ADMIN) as any,
  validateParams(idParamSchema),
  validate(changeRoleSchema),
  userController.changeRole
);

export { router as userRoutes };