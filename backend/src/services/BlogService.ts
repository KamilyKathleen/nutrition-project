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
 * 📝 TIPOS PARA CRIAÇÃO DE POST
 */
interface CreateBlogData {
  title: string;
  slug?: string;
  content: string;
  featuredImage?: string;
  category: BlogCategory;
  status?: BlogStatus;
  seoTitle?: string;
  seoDescription?: string;
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
      console.log('📝 [BlogService.createPost] Iniciando criação de post...');
      console.log('📝 [BlogService.createPost] postData:', JSON.stringify(postData, null, 2));
      console.log('📝 [BlogService.createPost] authorId:', authorId);
      
      // Se o status for 'published', setar publishedAt
      const postWithPublishedAt = {
        ...postData,
        publishedAt: postData.status === 'published' ? new Date() : undefined
      };
      
      // Criar post (slug será gerado automaticamente pelo middleware)
      const post = new Blog({
        ...postWithPublishedAt,
        author: authorId,
        auditInfo: {
          createdBy: authorId,
          createdAt: new Date(),
          updatedBy: authorId,
          updatedAt: new Date(),
          version: 1
        }
      });

      console.log('📝 [BlogService.createPost] Post object criado, salvando...');
      await post.save();
      console.log('✅ [BlogService.createPost] Post salvo com sucesso! ID:', post._id);
      console.log('📅 publishedAt:', post.publishedAt);


      // Log de auditoria (temporariamente comentado)
      // // await logAudit(
      //   'blog_create',
      //   'Blog',
      //   post.id,
      //   authorId,
      //   { title: post.title, category: post.category, status: post.status }
      // );

      console.log('📝 [BlogService.createPost] Buscando post populado...');
      const populatedPost = await Blog.findById(post._id)
        .populate('author', 'name email') as IBlog;
      
      console.log('✅ [BlogService.createPost] Post populado retornado!');
      return populatedPost;

    } catch (error: any) {
      console.error('❌ [BlogService.createPost] Erro:', error.message);
      console.error('❌ [BlogService.createPost] Stack:', error.stack);
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
        .populate('author', 'name email profileImage bio');

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
        .populate('author', 'name email profileImage bio');

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

      // Atualizar auditoria
      const updatedPost = await Blog.findByIdAndUpdate(
        postId,
        updateData,
        { new: true, runValidators: true }
      )
      .populate('author', 'name email profileImage');

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
      console.log('📚 [BlogService.getRecentPublishedPosts] Buscando posts recentes...');
      console.log('📊 Limit:', limit);
      
      const posts = await Blog.findPublished()
        .populate('author', 'name email profileImage')
        .limit(limit)
        .exec();

      console.log('✅ Posts encontrados:', posts.length);
      console.log('📋 Posts:', posts.map(p => ({ title: p.title, publishedAt: p.publishedAt, status: p.status })));

      return posts;
    } catch (error: any) {
      console.error('❌ [BlogService.getRecentPublishedPosts] Erro:', error);
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

      // Buscar posts com categoria similar
      const relatedPosts = await Blog.find({
        _id: { $ne: postId },
        status: BlogStatus.PUBLISHED,
        category: post.category
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
}

export default new BlogService();