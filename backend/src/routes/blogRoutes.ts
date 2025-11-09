/**
 * 📚 ROTAS DO BLOG
 * ================
 * Sistema de conteúdo educativo sobre nutrição
 */

import { Router } from 'express';
import { body, query, param } from 'express-validator';
import BlogController from '@/controllers/BlogController';
import { authenticate, authorize } from '@/middlewares/auth';
import { AppError } from '@/middlewares/errorHandler';
import { UserRole } from '@/types';
import { BlogCategory, BlogStatus } from '@/models/Blog';

/**
 * 📋 Middleware de auditoria para blog
 */
const auditBlogAccess = (action: string, getResourceId: (req: any) => string) => {
  return (req: any, res: any, next: any) => {
    // Implementação simples de log para blog
    const resourceId = getResourceId(req);
    const userId = req.user?.id || 'anonymous';
    console.log(`[BLOG AUDIT] ${action} - User: ${userId} - Resource: ${resourceId}`);
    next();
  };
};

const router = Router();

/**
 * 🔒 MIDDLEWARE DE VALIDAÇÃO DE REQUEST
 */
const validateRequest = (req: any, res: any, next: any) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Dados inválidos: ' + errors.array().map((e: any) => e.msg).join(', '), 400));
  }
  next();
};

/**
 * 🎯 VALIDAÇÕES PARA CRIAÇÃO DE POST
 */
const createPostValidation = [
  body('title')
    .isLength({ min: 10, max: 200 })
    .withMessage('Título deve ter entre 10 e 200 caracteres')
    .trim(),
  body('slug')
    .optional()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug deve conter apenas letras minúsculas, números e hífens'),
  body('excerpt')
    .isLength({ min: 50, max: 300 })
    .withMessage('Resumo deve ter entre 50 e 300 caracteres')
    .trim(),
  body('content')
    .isLength({ min: 200, max: 50000 })
    .withMessage('Conteúdo deve ter entre 200 e 50.000 caracteres'),
  body('category')
    .isIn(Object.values(BlogCategory))
    .withMessage('Categoria inválida'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Máximo 10 tags permitidas'),
  body('status')
    .optional()
    .isIn(Object.values(BlogStatus))
    .withMessage('Status inválido'),
  body('featuredImage')
    .optional()
    .isURL()
    .withMessage('URL da imagem destacada inválida'),
  body('seoTitle')
    .optional()
    .isLength({ max: 60 })
    .withMessage('Título SEO não pode exceder 60 caracteres'),
  body('seoDescription')
    .optional()
    .isLength({ max: 160 })
    .withMessage('Descrição SEO não pode exceder 160 caracteres')
];

/**
 * 🎯 VALIDAÇÕES PARA ATUALIZAÇÃO DE POST
 */
const updatePostValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID do post inválido'),
  body('title')
    .optional()
    .isLength({ min: 10, max: 200 })
    .withMessage('Título deve ter entre 10 e 200 caracteres')
    .trim(),
  body('slug')
    .optional()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug deve conter apenas letras minúsculas, números e hífens'),
  body('excerpt')
    .optional()
    .isLength({ min: 50, max: 300 })
    .withMessage('Resumo deve ter entre 50 e 300 caracteres')
    .trim(),
  body('content')
    .optional()
    .isLength({ min: 200, max: 50000 })
    .withMessage('Conteúdo deve ter entre 200 e 50.000 caracteres'),
  body('category')
    .optional()
    .isIn(Object.values(BlogCategory))
    .withMessage('Categoria inválida'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Máximo 10 tags permitidas'),
  body('status')
    .optional()
    .isIn(Object.values(BlogStatus))
    .withMessage('Status inválido'),
  body('featuredImage')
    .optional()
    .isURL()
    .withMessage('URL da imagem destacada inválida'),
  body('seoTitle')
    .optional()
    .isLength({ max: 60 })
    .withMessage('Título SEO não pode exceder 60 caracteres'),
  body('seoDescription')
    .optional()
    .isLength({ max: 160 })
    .withMessage('Descrição SEO não pode exceder 160 caracteres')
];

/**
 * 🎯 VALIDAÇÕES PARA LISTAGEM COM PAGINAÇÃO
 */
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limite deve estar entre 1 e 50'),
  query('sortBy')
    .optional()
    .isIn(['publishedAt', 'views', 'likes', 'title', 'createdAt', 'updatedAt'])
    .withMessage('Campo de ordenação inválido'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Ordem deve ser asc ou desc'),
  query('category')
    .optional()
    .isIn(Object.values(BlogCategory))
    .withMessage('Categoria inválida'),
  query('status')
    .optional()
    .isIn(Object.values(BlogStatus))
    .withMessage('Status inválido'),
  query('tags')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') return true;
      if (Array.isArray(value) && value.length <= 5) return true;
      throw new Error('Tags deve ser uma string ou array com máximo 5 elementos');
    })
];

// ================================
// 🎯 ROTAS PÚBLICAS (SEM AUTENTICAÇÃO)
// ================================

/**
 * 📋 Listar posts públicos (publicados)
 */
router.get('/public',
  paginationValidation,
  validateRequest,
  BlogController.getPublicPosts
);

/**
 * 🔍 Buscar post público por slug
 */
router.get('/public/:slug',
  [param('slug').notEmpty().withMessage('Slug é obrigatório')],
  validateRequest,
  BlogController.getPostBySlug
);

/**
 * 📅 Posts recentes públicos
 */
router.get('/public/recent/posts',
  [query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limite deve estar entre 1 e 20')],
  validateRequest,
  BlogController.getRecentPosts
);

/**
 * ⭐ Posts em destaque públicos
 */
router.get('/public/featured/posts',
  [query('limit').optional().isInt({ min: 1, max: 10 }).withMessage('Limite deve estar entre 1 e 10')],
  validateRequest,
  BlogController.getFeaturedPosts
);

/**
 * 📂 Posts por categoria públicos
 */
router.get('/public/category/:category',
  [
    param('category').isIn(Object.values(BlogCategory)).withMessage('Categoria inválida'),
    query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limite deve estar entre 1 e 20')
  ],
  validateRequest,
  BlogController.getPostsByCategory
);

/**
 * 🏷️ Buscar todas as tags públicas
 */
router.get('/public/tags',
  BlogController.getAllTags
);

/**
 * 📂 Listar categorias disponíveis
 */
router.get('/public/categories',
  BlogController.getCategories
);

// ================================
// 🎯 ROTAS AUTENTICADAS
// ================================

/**
 * 🔒 MIDDLEWARE DE AUTENTICAÇÃO APLICADO ÀS ROTAS A SEGUIR
 */
router.use(authenticate);

/**
 * 📝 Criar novo post (apenas nutricionistas)
 */
router.post('/',
  authorize(UserRole.NUTRITIONIST),
  createPostValidation,
  validateRequest,
  auditBlogAccess('blog_create', () => 'new_post'),
  BlogController.createPost
);

/**
 * 📋 Listar posts (admin vê todos, nutricionista vê próprios)
 */
router.get('/',
  authorize(UserRole.NUTRITIONIST),
  paginationValidation,
  validateRequest,
  BlogController.getPosts
);

/**
 * 📋 Meus posts (posts do nutricionista autenticado)
 */
router.get('/my-posts',
  authorize(UserRole.NUTRITIONIST),
  paginationValidation,
  validateRequest,
  BlogController.getMyPosts
);

/**
 * 🔍 Buscar post por ID (acesso completo para autenticados)
 */
router.get('/:id',
  [param('id').isMongoId().withMessage('ID do post inválido')],
  validateRequest,
  BlogController.getPostById
);

/**
 * ✏️ Atualizar post (apenas autor ou admin)
 */
router.put('/:id',
  authorize(UserRole.NUTRITIONIST),
  updatePostValidation,
  validateRequest,
  auditBlogAccess('blog_update', (req) => req.params.id || ''),
  BlogController.updatePost
);

/**
 * 🗑️ Remover post (apenas autor ou admin)
 */
router.delete('/:id',
  authorize(UserRole.NUTRITIONIST),
  [param('id').isMongoId().withMessage('ID do post inválido')],
  validateRequest,
  auditBlogAccess('blog_delete', (req) => req.params.id || ''),
  BlogController.deletePost
);

/**
 * 🔍 Posts relacionados
 */
router.get('/:id/related',
  [
    param('id').isMongoId().withMessage('ID do post inválido'),
    query('limit').optional().isInt({ min: 1, max: 10 }).withMessage('Limite deve estar entre 1 e 10')
  ],
  validateRequest,
  BlogController.getRelatedPosts
);

/**
 * 👍 Curtir post
 */
router.post('/:id/like',
  [param('id').isMongoId().withMessage('ID do post inválido')],
  validateRequest,
  auditBlogAccess('blog_like', (req) => req.params.id || ''),
  BlogController.likePost
);

/**
 * 👎 Descurtir post
 */
router.delete('/:id/like',
  [param('id').isMongoId().withMessage('ID do post inválido')],
  validateRequest,
  auditBlogAccess('blog_unlike', (req) => req.params.id || ''),
  BlogController.unlikePost
);

/**
 * 📊 Estatísticas do blog (apenas nutricionistas e admin)
 */
router.get('/stats/overview',
  authorize(UserRole.NUTRITIONIST),
  [
    query('author')
      .optional()
      .isMongoId()
      .withMessage('ID do autor inválido')
  ],
  validateRequest,
  BlogController.getBlogStatistics
);

export { router as blogRoutes };
