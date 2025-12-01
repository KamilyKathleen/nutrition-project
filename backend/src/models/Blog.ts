/**
 * 📚 MODELO DE BLOG
 * =================
 * Sistema de conteúdo educativo sobre nutrição
 */

import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

/**
 * 🏷️ TIPOS DE CATEGORIA DE CONTEÚDO
 */
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

/**
 * 🏷️ STATUS DE PUBLICAÇÃO
 */
export enum BlogStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

/**
 * 🏷️ INTERFACE DA POSTAGEM DO BLOG
 */
export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  featuredImage?: string;
  category: BlogCategory;
  status: BlogStatus;
  author: mongoose.Types.ObjectId | IUser;
  views: number;
  publishedAt?: Date;
  seoTitle?: string;
  seoDescription?: string;
  readingTime?: number; // em minutos
  
  createdAt: Date;
  updatedAt: Date;

  // Métodos
  incrementViews(): Promise<IBlog>;
  isPublished(): boolean;
}

/**
 * 🏷️ INTERFACE DO MODELO DO BLOG COM MÉTODOS ESTÁTICOS
 */
interface IBlogModel extends mongoose.Model<IBlog> {
  findPublished(filter?: any): mongoose.Query<IBlog[], IBlog>;
  findHighlighted(limit?: number): mongoose.Query<IBlog[], IBlog>;
  findByCategory(category: BlogCategory, limit?: number): mongoose.Query<IBlog[], IBlog>;
  searchByText(searchText: string, limit?: number): mongoose.Query<IBlog[], IBlog>;
}

/**
 * 🏷️ SCHEMA DA POSTAGEM DO BLOG
 */
const blogSchema = new Schema<IBlog>({
  title: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true,
    minLength: [10, 'Título deve ter pelo menos 10 caracteres'],
    maxLength: [200, 'Título não pode exceder 200 caracteres']
  },
  
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens']
  },
  
  content: {
    type: String,
    required: [true, 'Conteúdo é obrigatório'],
    minLength: [50, 'Conteúdo deve ter pelo menos 50 caracteres'],
    maxLength: [50000, 'Conteúdo não pode exceder 50.000 caracteres']
  },
  
  featuredImage: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'URL da imagem inválida']
  },
  
  category: {
    type: String,
    enum: Object.values(BlogCategory),
    required: [true, 'Categoria é obrigatória']
  },
  
  status: {
    type: String,
    enum: Object.values(BlogStatus),
    default: BlogStatus.DRAFT
  },
  
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Autor é obrigatório']
  },
  
  views: {
    type: Number,
    default: 0,
    min: [0, 'Visualizações não podem ser negativas']
  },
  
  publishedAt: {
    type: Date
  },
  
  seoTitle: {
    type: String,
    trim: true,
    maxLength: [60, 'Título SEO não pode exceder 60 caracteres']
  },
  
  seoDescription: {
    type: String,
    trim: true,
    maxLength: [160, 'Descrição SEO não pode exceder 160 caracteres']
  },
  
  readingTime: {
    type: Number,
    min: [1, 'Tempo de leitura deve ser pelo menos 1 minuto'],
    max: [60, 'Tempo de leitura não pode exceder 60 minutos']
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      if ('__v' in ret) {
        delete (ret as any).__v;
      }
      return ret;
    }
  }
});

// ================================
// 🎯 ÍNDICES PARA PERFORMANCE
// ================================

blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ author: 1, status: 1 });
blogSchema.index({ 
  title: 'text', 
  content: 'text'
}, {
  weights: {
    title: 10,
    content: 1
  }
});

// ================================
// 🎯 MIDDLEWARE PRE-SAVE
// ================================

/**
 * 📝 Gerar slug automaticamente
 */
blogSchema.pre('save', function(next) {
  if (!this.slug || this.isModified('title')) {
    let baseSlug = this.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    // Se for um novo documento, adiciona timestamp para garantir unicidade
    if (this.isNew) {
      baseSlug = `${baseSlug}-${Date.now()}`;
    }
    
    this.slug = baseSlug;
  }
  next();
});

/**
 * 📝 Calcular tempo de leitura automaticamente
 */
blogSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }
  next();
});

/**
 * 📝 Definir data de publicação
 */
blogSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === BlogStatus.PUBLISHED && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

/**
 * 📝 Validar SEO automaticamente
 */
blogSchema.pre('save', function(next) {
  if (this.status === BlogStatus.PUBLISHED) {
    if (!this.seoTitle) {
      this.seoTitle = this.title.substring(0, 60);
    }
    if (!this.seoDescription) {
      this.seoDescription = this.content.substring(0, 160);
    }
  }
  next();
});

// ================================
// 🎯 MÉTODOS DO SCHEMA
// ================================

/**
 * 📊 Incrementar visualizações
 */
blogSchema.methods.incrementViews = async function() {
  this.views += 1;
  return await this.save({ validateBeforeSave: false });
};



/**
 * 📅 Verificar se está publicado
 */
blogSchema.methods.isPublished = function(): boolean {
  return this.status === BlogStatus.PUBLISHED && this.publishedAt && this.publishedAt <= new Date();
};

// ================================
// 🎯 MÉTODOS ESTÁTICOS
// ================================

/**
 * 🔍 Buscar posts publicados
 */
blogSchema.statics.findPublished = function(filter = {}) {
  return this.find({
    ...filter,
    status: BlogStatus.PUBLISHED,
    publishedAt: { $lte: new Date() }
  }).sort({ publishedAt: -1 });
};



/**
 * 🔍 Buscar por categoria
 */
blogSchema.statics.findByCategory = function(category: BlogCategory, limit = 10) {
  return this.find({
    status: BlogStatus.PUBLISHED,
    category,
    publishedAt: { $lte: new Date() }
  })
  .sort({ publishedAt: -1 })
  .limit(limit);
};

/**
 * 🔍 Busca por texto
 */
blogSchema.statics.searchByText = function(searchText: string, limit = 20) {
  return this.find({
    $text: { $search: searchText },
    status: BlogStatus.PUBLISHED,
    publishedAt: { $lte: new Date() }
  }, {
    score: { $meta: 'textScore' }
  })
  .sort({ score: { $meta: 'textScore' }, publishedAt: -1 })
  .limit(limit);
};

export const Blog = mongoose.model<IBlog, IBlogModel>('Blog', blogSchema);
export default Blog;