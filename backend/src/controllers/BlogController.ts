/**
 * 📚 CONTROLLER DO BLOG
 * =====================
 * Endpoints para gestão de conteúdo educativo
 */

import { Request, Response, NextFunction } from 'express';
import BlogService from '../services/BlogService';
import { BlogCategory, BlogStatus } from '../models/Blog';
import { AppError } from '../middlewares/errorHandler';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

class BlogController {
  /**
   * 📝 Criar nova postagem
   */
  async createPost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Verificar autenticação
      if (!req.user?.id) {
        return next(new AppError('Usuário não autenticado', 401));
      }

      const userId = req.user.id;
      console.log('📝 [BlogController.createPost] userId:', userId);
      console.log('📝 [BlogController.createPost] req.body:', JSON.stringify(req.body, null, 2));

      const post = await BlogService.createPost(req.body, userId);
      
      console.log('✅ [BlogController.createPost] Post criado com sucesso:', post._id);
      
      res.status(201).json({
        success: true,
        message: 'Post criado com sucesso',
        data: post
      });
    } catch (error: any) {
      console.error('❌ [BlogController.createPost] Erro capturado:', error.message);
      console.error('❌ [BlogController.createPost] Stack:', error.stack);
      next(error);
    }
  }

  /**
   * 📋 Listar posts com filtros e paginação
   */
  async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = '1',
        limit = '10',
        sortBy = 'publishedAt',
        sortOrder = 'desc',
        category,
        status,
        author,
        startDate,
        endDate,
        searchText
      } = req.query;

      // Construir filtros
      const filters: any = {};
      
      if (category) filters.category = category as BlogCategory;
      if (status) filters.status = status as BlogStatus;
      if (author) filters.author = author as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (searchText) filters.searchText = searchText as string;

      // Opções de paginação
      const pagination = {
        page: Number.parseInt(page as string) || 1,
        limit: Number.parseInt(limit as string) || 10,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      };

      const result = await BlogService.getPosts(filters, pagination);

      res.json({
        success: true,
        data: result.posts,
        pagination: {
          currentPage: result.currentPage,
          totalPages: result.pages,
          totalItems: result.total,
          itemsPerPage: pagination.limit
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 📋 Listar posts públicos (sem necessidade de autenticação)
   */
  async getPublicPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = '1',
        limit = '10',
        category,
        tags,
        searchText,
        status
      } = req.query;

      // Filtros base - se não especificar status, retorna TODOS os posts
      const filters: any = {};
      
      if (status) filters.status = status as BlogStatus;
      if (category) filters.category = category as BlogCategory;
      if (searchText) filters.searchText = searchText as string;

      const pagination = {
        page: Number.parseInt(page as string) || 1,
        limit: Number.parseInt(limit as string) || 10,
        sortBy: 'publishedAt',
        sortOrder: 'desc' as const
      };

      const result = await BlogService.getPosts(filters, pagination);

      res.json({
        success: true,
        data: result.posts,
        pagination: {
          currentPage: result.currentPage,
          totalPages: result.pages,
          totalItems: result.total,
          itemsPerPage: pagination.limit
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🔍 Buscar post por ID
   */
  async getPostById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { increaseViews = 'false' } = req.query;

      if (!id) {
        return next(new AppError('ID do post é obrigatório', 400));
      }

      const post = await BlogService.getPostById(id, increaseViews === 'true');
      
      if (!post) {
        return next(new AppError('Post não encontrado', 404));
      }

      res.json({
        success: true,
        data: post
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🔍 Buscar post público por slug
   */
  async getPostBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const { increaseViews = 'true' } = req.query;

      if (!slug) {
        return next(new AppError('Slug do post é obrigatório', 400));
      }

      const post = await BlogService.getPostBySlug(slug, increaseViews === 'true');
      
      if (!post) {
        return next(new AppError('Post não encontrado', 404));
      }

      // Verificar se post está publicado (para acesso público)
      if (post.status !== BlogStatus.PUBLISHED) {
        return next(new AppError('Post não está disponível', 404));
      }

      res.json({
        success: true,
        data: post
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ✏️ Atualizar post
   */
  async updatePost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      // Verificar autenticação
      if (!req.user?.id) {
        return next(new AppError('Usuário não autenticado', 401));
      }

      const userId = req.user.id;
      console.log('✏️ [updatePost] userId:', userId);

      if (!id) {
        return next(new AppError('ID do post é obrigatório', 400));
      }

      const post = await BlogService.updatePost(id, req.body, userId);

      res.json({
        success: true,
        message: 'Post atualizado com sucesso',
        data: post
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🗑️ Remover post
   */
  async deletePost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      // Verificar autenticação
      if (!req.user?.id) {
        return next(new AppError('Usuário não autenticado', 401));
      }

      const userId = req.user.id;
      console.log('🗑️ [deletePost] userId:', userId);

      if (!id) {
        return next(new AppError('ID do post é obrigatório', 400));
      }

      await BlogService.deletePost(id, userId);

      res.json({
        success: true,
        message: 'Post removido com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 📅 Posts publicados recentes
   */
  async getRecentPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = '10' } = req.query;
      
      const posts = await BlogService.getRecentPublishedPosts(Number.parseInt(limit as string));

      res.json({
        success: true,
        data: posts
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ⭐ Posts em destaque
   */
  async getFeaturedPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = '5' } = req.query;
      
      const posts = await BlogService.getFeaturedPosts(Number.parseInt(limit as string));

      res.json({
        success: true,
        data: posts
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 📂 Posts por categoria
   */
  async getPostsByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { category } = req.params;
      const { limit = '10' } = req.query;

      // Validar categoria
      if (!Object.values(BlogCategory).includes(category as BlogCategory)) {
        return next(new AppError('Categoria inválida', 400));
      }

      const posts = await BlogService.getPostsByCategory(
        category as BlogCategory, 
        Number.parseInt(limit as string)
      );

      res.json({
        success: true,
        data: posts
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🔍 Posts relacionados
   */
  async getRelatedPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { limit = '5' } = req.query;

      if (!id) {
        return next(new AppError('ID do post é obrigatório', 400));
      }
      
      const posts = await BlogService.getRelatedPosts(id, Number.parseInt(limit as string));

      res.json({
        success: true,
        data: posts
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 📋 Posts do autor autenticado
   */
  async getMyPosts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return next(new AppError('Usuário não autenticado', 401));
      }

      const {
        page = '1',
        limit = '10',
        status,
        category
      } = req.query;

      const filters: any = { author: userId };
      if (status) filters.status = status as BlogStatus;
      if (category) filters.category = category as BlogCategory;

      const pagination = {
        page: Number.parseInt(page as string) || 1,
        limit: Number.parseInt(limit as string) || 10,
        sortBy: 'updatedAt',
        sortOrder: 'desc' as const
      };

      const result = await BlogService.getPosts(filters, pagination);

      res.json({
        success: true,
        data: result.posts,
        pagination: {
          currentPage: result.currentPage,
          totalPages: result.pages,
          totalItems: result.total,
          itemsPerPage: pagination.limit
        }
      });
    } catch (error) {
      next(error);
    }
  }



  /**
   * 📊 Estatísticas do blog
   */
  async getBlogStatistics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { author } = req.query;
      
      // Se não for admin, só pode ver suas próprias estatísticas
      const authorId = req.user?.role === 'admin' && author ? author as string : userId;

      const stats = await BlogService.getBlogStatistics(authorId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 📂 Listar categorias disponíveis
   */
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = Object.values(BlogCategory).map(category => ({
        value: category,
        label: category.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
      }));

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new BlogController();