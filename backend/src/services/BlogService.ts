/**
 * 📚 SERVIÇO DO BLOG
 * ==================
 * Lógica de negócio para gestão de conteúdo educativo
 */

import Blog, { IBlog, BlogCategory, BlogStatus } from '../models/Blog';
import { AppError } from '../middlewares/errorHandler';
import mongoose from 'mongoose';

/**
 * 🏷️ TIPOS DE FILTROS PARA BUSCA
 */
interface BlogFilters {
  category?: BlogCategory;
  status?: BlogStatus;
  author?: string;
  tags?: string[];
  isHighlighted?: boolean;
  startDate?: Date;
  endDate?: Date;
  searchText?: string;
}

/**
 * 🏷️ OPÇÕES DE PAGINAÇÃO
 */
interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 🏷️ DADOS PARA CRIAR POST
 */
interface CreateBlogData {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  category: BlogCategory;
  tags?: string[];
  status?: BlogStatus;
  seoTitle?: string;
  seoDescription?: string;
  isHighlighted?: boolean;
  relatedPosts?: string[];
}

/**
 * 🏷️ DADOS PARA ATUALIZAR POST
 */
interface UpdateBlogData extends Partial<CreateBlogData> {
  views?: number;
  likes?: number;
}

/**
 * 🏷️ ESTATÍSTICAS DO BLOG
 */
interface BlogStatistics {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  totalLikes: number;
  postsByCategory: { category: string; count: number }[];
  mostViewedPosts: IBlog[];
  mostLikedPosts: IBlog[];
  recentPosts: IBlog[];
  monthlyStats: { month: string; posts: number; views: number }[];
}

class BlogService {
  /**
   * 📝 Criar nova postagem
   */
  async createPost(postData: CreateBlogData, authorId: string): Promise<IBlog> {
    try {
      // Verificar se slug já existe
      if (postData.slug) {
        const existingPost = await Blog.findOne({ slug: postData.slug });
        if (existingPost) {
          throw new AppError('Slug já está em uso', 400);
        }
      }

      // Processar tags
      const processedTags = postData.tags
        ? postData.tags.map(tag => tag.toLowerCase().trim()).filter(Boolean)
        : [];

      // Criar post
      const post = new Blog({
        ...postData,
        author: authorId,
        tags: processedTags,
        auditInfo: {
          createdBy: authorId,
          createdAt: new Date(),
          updatedBy: authorId,
          updatedAt: new Date(),
          version: 1
        }
      });

      await post.save();

      // Log de auditoria (temporariamente comentado)
      // // await logAudit(
      //   'blog_create',
      //   'Blog',
      //   post.id,
      //   authorId,
      //   { title: post.title, category: post.category, status: post.status }
      // );

      return await Blog.findById(post._id)
        .populate('author', 'name email')
        .populate('relatedPosts', 'title slug excerpt featuredImage category') as IBlog;

    } catch (error: any) {
      if (error.code === 11000) {
        throw new AppError('Slug já está em uso', 400);
      }
      throw error;
    }
  }

  /**
   * 📋 Listar posts com filtros e paginação
   */
  async getPosts(
    filters: BlogFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<{ posts: IBlog[]; total: number; pages: number; currentPage: number }> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'publishedAt',
        sortOrder = 'desc'
      } = pagination;

      // Construir query de filtros
      const query: any = {};

      if (filters.category) query.category = filters.category;
      if (filters.status) query.status = filters.status;
      if (filters.author) query.author = filters.author;
      if (filters.isHighlighted !== undefined) query.isHighlighted = filters.isHighlighted;

      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
      }

      if (filters.startDate || filters.endDate) {
        query.publishedAt = {};
        if (filters.startDate) query.publishedAt.$gte = filters.startDate;
        if (filters.endDate) query.publishedAt.$lte = filters.endDate;
      }

      if (filters.searchText) {
        query.$text = { $search: filters.searchText };
      }

      // Calcular skip
      const skip = (page - 1) * limit;

      // Executar query
      let postsQuery = Blog.find(query)
        .populate('author', 'name email profileImage')
        .populate('relatedPosts', 'title slug excerpt featuredImage category')
        .skip(skip)
        .limit(limit);

      // Aplicar ordenação
      const sortObj: any = {};
      sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
      
      if (filters.searchText) {
        sortObj.score = { $meta: 'textScore' };
      }
      
      postsQuery = postsQuery.sort(sortObj);

      const [posts, total] = await Promise.all([
        postsQuery.exec(),
        Blog.countDocuments(query)
      ]);

      const pages = Math.ceil(total / limit);

      return {
        posts,
        total,
        pages,
        currentPage: page
      };

    } catch (error) {
      throw new AppError('Erro ao buscar posts', 500);
    }
  }

  /**
   * 🔍 Buscar post por ID
   */
  async getPostById(postId: string, increaseViews = false): Promise<IBlog | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new AppError('ID do post inválido', 400);
      }

      const post = await Blog.findById(postId)
        .populate('author', 'name email profileImage bio')
        .populate('relatedPosts', 'title slug excerpt featuredImage category publishedAt');

      if (!post) {
        return null;
      }

      // Incrementar visualizações se solicitado
      if (increaseViews && post.status === BlogStatus.PUBLISHED) {
        await post.incrementViews();
      }

      return post;

    } catch (error) {
      throw new AppError('Erro ao buscar post', 500);
    }
  }

  /**
   * 🔍 Buscar post por slug
   */
  async getPostBySlug(slug: string, increaseViews = false): Promise<IBlog | null> {
    try {
      const post = await Blog.findOne({ slug })
        .populate('author', 'name email profileImage bio')
        .populate('relatedPosts', 'title slug excerpt featuredImage category publishedAt');

      if (!post) {
        return null;
      }

      // Incrementar visualizações se solicitado
      if (increaseViews && post.status === BlogStatus.PUBLISHED) {
        await post.incrementViews();
      }

      return post;

    } catch (error) {
      throw new AppError('Erro ao buscar post', 500);
    }
  }

  /**
   * ✏️ Atualizar post
   */
  async updatePost(postId: string, updateData: UpdateBlogData, userId: string): Promise<IBlog> {
    try {
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new AppError('ID do post inválido', 400);
      }

      const post = await Blog.findById(postId);
      if (!post) {
        throw new AppError('Post não encontrado', 404);
      }

      // Verificar se usuário pode editar
      if (post.author.toString() !== userId) {
        throw new AppError('Apenas o autor pode editar este post', 403);
      }

      // Verificar slug se foi alterado
      if (updateData.slug && updateData.slug !== post.slug) {
        const existingPost = await Blog.findOne({ slug: updateData.slug });
        if (existingPost) {
          throw new AppError('Slug já está em uso', 400);
        }
      }

      // Processar tags se fornecidas
      if (updateData.tags) {
        updateData.tags = updateData.tags
          .map(tag => tag.toLowerCase().trim())
          .filter(Boolean);
      }

      // Atualizar auditoria
      const updatedPost = await Blog.findByIdAndUpdate(
        postId,
        updateData,
        { new: true, runValidators: true }
      )
      .populate('author', 'name email profileImage')
      .populate('relatedPosts', 'title slug excerpt featuredImage category');

      // Log de auditoria
      // await logAudit(
      //   'blog_update',
      //   'Blog',
      //   postId,
      //   userId,
      //   { updatedFields: Object.keys(updateData) }
      // );

      return updatedPost!;

    } catch (error: any) {
      if (error.code === 11000) {
        throw new AppError('Slug já está em uso', 400);
      }
      throw error;
    }
  }

  /**
   * 🗑️ Remover post
   */
  async deletePost(postId: string, userId: string): Promise<void> {
    try {
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new AppError('ID do post inválido', 400);
      }

      const post = await Blog.findById(postId);
      if (!post) {
        throw new AppError('Post não encontrado', 404);
      }

      // Verificar se usuário pode remover
      if (post.author.toString() !== userId) {
        throw new AppError('Apenas o autor pode remover este post', 403);
      }

      await Blog.findByIdAndDelete(postId);

    } catch (error) {
      throw error;
    }
  }

  /**
   * 📅 Posts publicados recentes
   */
  async getRecentPublishedPosts(limit = 10): Promise<IBlog[]> {
    try {
      return await Blog.findPublished()
        .populate('author', 'name email profileImage')
        .limit(limit)
        .exec();

    } catch (error) {
      throw new AppError('Erro ao buscar posts recentes', 500);
    }
  }

  /**
   * ⭐ Posts em destaque
   */
  async getFeaturedPosts(limit = 5): Promise<IBlog[]> {
    try {
      return await Blog.findHighlighted(limit)
        .populate('author', 'name email profileImage')
        .exec();

    } catch (error) {
      throw new AppError('Erro ao buscar posts em destaque', 500);
    }
  }

  /**
   * 📂 Posts por categoria
   */
  async getPostsByCategory(category: BlogCategory, limit = 10): Promise<IBlog[]> {
    try {
      return await Blog.findByCategory(category, limit)
        .populate('author', 'name email profileImage')
        .exec();

    } catch (error) {
      throw new AppError('Erro ao buscar posts por categoria', 500);
    }
  }

  /**
   * 🔍 Buscar posts relacionados
   */
  async getRelatedPosts(postId: string, limit = 5): Promise<IBlog[]> {
    try {
      const post = await Blog.findById(postId);
      if (!post) {
        return [];
      }

      // Buscar posts com tags ou categoria similar
      const relatedPosts = await Blog.find({
        _id: { $ne: postId },
        status: BlogStatus.PUBLISHED,
        $or: [
          { category: post.category },
          { tags: { $in: post.tags } }
        ]
      })
      .populate('author', 'name email profileImage')
      .sort({ publishedAt: -1 })
      .limit(limit);

      return relatedPosts;

    } catch (error) {
      throw new AppError('Erro ao buscar posts relacionados', 500);
    }
  }



  /**
   * 📊 Estatísticas do blog
   */
  async getBlogStatistics(authorId?: string): Promise<BlogStatistics> {
    try {
      const matchStage: any = authorId ? { author: new mongoose.Types.ObjectId(authorId) } : {};

      const [
        totalStats,
        categoryStats,
        mostViewedPosts,
        mostLikedPosts,
        recentPosts,
        monthlyStats
      ] = await Promise.all([
        // Estatísticas gerais
        Blog.aggregate([
          { $match: matchStage },
          {
            $group: {
              _id: null,
              totalPosts: { $sum: 1 },
              publishedPosts: {
                $sum: {
                  $cond: [{ $eq: ['$status', BlogStatus.PUBLISHED] }, 1, 0]
                }
              },
              draftPosts: {
                $sum: {
                  $cond: [{ $eq: ['$status', BlogStatus.DRAFT] }, 1, 0]
                }
              },
              totalViews: { $sum: '$views' },
              totalLikes: { $sum: '$likes' }
            }
          }
        ]),

        // Posts por categoria
        Blog.aggregate([
          { $match: matchStage },
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 }
            }
          },
          {
            $project: {
              _id: 0,
              category: '$_id',
              count: 1
            }
          },
          { $sort: { count: -1 } }
        ]),

        // Posts mais visualizados
        Blog.find(matchStage)
          .sort({ views: -1 })
          .limit(5)
          .populate('author', 'name email')
          .select('title slug views category publishedAt'),

        // Posts mais curtidos
        Blog.find(matchStage)
          .sort({ likes: -1 })
          .limit(5)
          .populate('author', 'name email')
          .select('title slug likes category publishedAt'),

        // Posts recentes
        Blog.find({ ...matchStage, status: BlogStatus.PUBLISHED })
          .sort({ publishedAt: -1 })
          .limit(10)
          .populate('author', 'name email')
          .select('title slug publishedAt category views likes'),

        // Estatísticas mensais
        Blog.aggregate([
          { $match: matchStage },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              posts: { $sum: 1 },
              views: { $sum: '$views' }
            }
          },
          {
            $project: {
              _id: 0,
              month: {
                $concat: [
                  { $toString: '$_id.year' },
                  '-',
                  { $toString: '$_id.month' }
                ]
              },
              posts: 1,
              views: 1
            }
          },
          { $sort: { month: -1 } },
          { $limit: 12 }
        ])
      ]);

      const stats = totalStats[0] || {
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
        totalViews: 0,
        totalLikes: 0
      };

      return {
        ...stats,
        postsByCategory: categoryStats,
        mostViewedPosts: mostViewedPosts as IBlog[],
        mostLikedPosts: mostLikedPosts as IBlog[],
        recentPosts: recentPosts as IBlog[],
        monthlyStats
      };

    } catch (error) {
      throw new AppError('Erro ao gerar estatísticas', 500);
    }
  }

  /**
   * 🏷️ Buscar todas as tags
   */
  async getAllTags(): Promise<{ tag: string; count: number }[]> {
    try {
      const tags = await Blog.aggregate([
        { $match: { status: BlogStatus.PUBLISHED } },
        { $unwind: '$tags' },
        {
          $group: {
            _id: '$tags',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            tag: '$_id',
            count: 1
          }
        },
        { $sort: { count: -1 } },
        { $limit: 50 }
      ]);

      return tags;

    } catch (error) {
      throw new AppError('Erro ao buscar tags', 500);
    }
  }
}

export default new BlogService();