import { apiClient } from './api';

/**
 * 📚 BLOG SERVICE
 * ===============
 * Service para gerenciamento de posts do blog
 */

// Enums do backend
export enum BlogCategory {
  NUTRITION = 'nutrition',
  RECIPES = 'recipes',
  TIPS = 'tips',
  DISEASES = 'diseases',
  SUPPLEMENTS = 'supplements',
  WEIGHT_LOSS = 'weight_loss',
  SPORTS_NUTRITION = 'sports_nutrition',
  CHILD_NUTRITION = 'child_nutrition',
  ELDERLY_NUTRITION = 'elderly_nutrition',
  VEGETARIAN = 'vegetarian',
  FUNCTIONAL_FOOD = 'functional_food',
  FOOD_SAFETY = 'food_safety'
}

export enum BlogStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

// Tipos
export interface BlogPost {
  _id?: string;
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  category: BlogCategory;
  tags: string[];
  status: BlogStatus;
  author?: {
    _id: string;
    name: string;
  };
  views?: number;
  publishedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  readingTime?: number;
  isHighlighted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBlogPostRequest {
  title: string;
  content: string;
  featuredImage?: string;
  category: BlogCategory;
  status?: BlogStatus;
}

export interface UpdateBlogPostRequest extends Partial<CreateBlogPostRequest> {}

export interface BlogFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  category?: BlogCategory;
  status?: BlogStatus;
  tags?: string[];
  searchText?: string;
}

export interface BlogListResponse {
  success: boolean;
  data: BlogPost[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface BlogResponse {
  success: boolean;
  message?: string;
  data: BlogPost;
}

/**
 * 🔧 BLOG SERVICE CLASS
 */
export class BlogService {
  private static readonly BASE_PATH = '/blog';

  /**
   * 📝 Criar novo post
   */
  static async createPost(data: CreateBlogPostRequest): Promise<BlogPost> {
    const response = await apiClient.post<BlogResponse>(this.BASE_PATH, data);
    return response.data;
  }

  /**
   * 📋 Listar meus posts (nutricionista autenticado)
   */
  static async getMyPosts(filters?: BlogFilters): Promise<BlogListResponse> {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.searchText) params.append('searchText', filters.searchText);
    if (filters?.tags) {
      filters.tags.forEach(tag => params.append('tags', tag));
    }

    return apiClient.get<BlogListResponse>(
      `${this.BASE_PATH}/my-posts?${params.toString()}`
    );
  }

  /**
   * 📋 Listar posts públicos (sem autenticação)
   */
  static async getPublicPosts(filters?: BlogFilters): Promise<BlogListResponse> {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.searchText) params.append('searchText', filters.searchText);
    if (filters?.tags) {
      filters.tags.forEach(tag => params.append('tags', tag));
    }

    return apiClient.get<BlogListResponse>(
      `${this.BASE_PATH}/public?${params.toString()}`
    );
  }

  /**
   * 🔍 Buscar post por ID
   */
  static async getPostById(id: string): Promise<BlogPost> {
    const response = await apiClient.get<BlogResponse>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  /**
   * 🔍 Buscar post público por slug
   */
  static async getPostBySlug(slug: string): Promise<BlogPost> {
    const response = await apiClient.get<BlogResponse>(`${this.BASE_PATH}/public/${slug}`);
    return response.data;
  }

  /**
   * ✏️ Atualizar post
   */
  static async updatePost(id: string, data: UpdateBlogPostRequest): Promise<BlogPost> {
    const response = await apiClient.put<BlogResponse>(`${this.BASE_PATH}/${id}`, data);
    return response.data;
  }

  /**
   * 🗑️ Deletar post
   */
  static async deletePost(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`);
  }

  /**
   * 📅 Posts recentes públicos
   */
  static async getRecentPosts(limit: number = 6): Promise<BlogPost[]> {
    const response = await apiClient.get<{ success: boolean; data: BlogPost[] }>(
      `${this.BASE_PATH}/public/recent/posts?limit=${limit}`
    );
    return response.data;
  }

  /**
   * ⭐ Posts em destaque públicos
   */
  static async getFeaturedPosts(limit: number = 3): Promise<BlogPost[]> {
    const response = await apiClient.get<{ success: boolean; data: BlogPost[] }>(
      `${this.BASE_PATH}/public/featured/posts?limit=${limit}`
    );
    return response.data;
  }

  /**
   * 📂 Posts por categoria
   */
  static async getPostsByCategory(category: BlogCategory, limit: number = 10): Promise<BlogPost[]> {
    const response = await apiClient.get<{ success: boolean; data: BlogPost[] }>(
      `${this.BASE_PATH}/public/category/${category}?limit=${limit}`
    );
    return response.data;
  }

  /**
   * 🏷️ Buscar todas as tags públicas
   */
  static async getAllTags(): Promise<string[]> {
    const response = await apiClient.get<{ success: boolean; data: string[] }>(
      `${this.BASE_PATH}/public/tags`
    );
    return response.data;
  }

  /**
   * 📂 Listar categorias disponíveis
   */
  static async getCategories(): Promise<{ value: string; label: string }[]> {
    const response = await apiClient.get<{ success: boolean; data: { value: string; label: string }[] }>(
      `${this.BASE_PATH}/public/categories`
    );
    return response.data;
  }

  /**
   * 📊 Estatísticas do blog
   */
  static async getBlogStatistics(): Promise<any> {
    const response = await apiClient.get<{ success: boolean; data: any }>(
      `${this.BASE_PATH}/stats/overview`
    );
    return response.data;
  }
}

export default BlogService;
