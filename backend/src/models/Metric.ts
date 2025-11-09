/**
 * 📊 MODELO DE MÉTRICAS E ANALYTICS
 * =================================
 * Sistema completo de coleta e análise de métricas do sistema
 */

import mongoose, { Schema, Document } from 'mongoose';

// ================================
// 🎯 ENUMS E TIPOS
// ================================

/**
 * 📊 Tipos de métricas disponíveis
 */
export enum MetricType {
  // Métricas de usuários
  USER_REGISTRATION = 'user_registration',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_SESSION_DURATION = 'user_session_duration',
  USER_ACTIVE_DAILY = 'user_active_daily',
  USER_ACTIVE_WEEKLY = 'user_active_weekly',
  USER_ACTIVE_MONTHLY = 'user_active_monthly',

  // Métricas de pacientes
  PATIENT_CREATED = 'patient_created',
  PATIENT_UPDATED = 'patient_updated',
  PATIENT_DELETED = 'patient_deleted',
  PATIENT_ASSESSMENT_COMPLETED = 'patient_assessment_completed',

  // Métricas de avaliações nutricionais
  ASSESSMENT_CREATED = 'assessment_created',
  ASSESSMENT_COMPLETED = 'assessment_completed',
  ASSESSMENT_UPDATED = 'assessment_updated',
  ASSESSMENT_DELETED = 'assessment_deleted',

  // Métricas de planos alimentares
  DIET_PLAN_CREATED = 'diet_plan_created',
  DIET_PLAN_UPDATED = 'diet_plan_updated',
  DIET_PLAN_DELETED = 'diet_plan_deleted',
  DIET_PLAN_SHARED = 'diet_plan_shared',

  // Métricas de consultas
  CONSULTATION_SCHEDULED = 'consultation_scheduled',
  CONSULTATION_COMPLETED = 'consultation_completed',
  CONSULTATION_CANCELLED = 'consultation_cancelled',
  CONSULTATION_RESCHEDULED = 'consultation_rescheduled',

  // Métricas de notificações
  NOTIFICATION_SENT = 'notification_sent',
  NOTIFICATION_OPENED = 'notification_opened',
  NOTIFICATION_CLICKED = 'notification_clicked',
  NOTIFICATION_FAILED = 'notification_failed',

  // Métricas do blog
  BLOG_POST_CREATED = 'blog_post_created',
  BLOG_POST_VIEWED = 'blog_post_viewed',
  BLOG_POST_LIKED = 'blog_post_liked',
  BLOG_POST_COMMENTED = 'blog_post_commented',

  // Métricas do sistema
  SYSTEM_ERROR = 'system_error',
  SYSTEM_WARNING = 'system_warning',
  API_REQUEST = 'api_request',
  API_ERROR = 'api_error',
  DATABASE_QUERY = 'database_query',
  EXPORT_GENERATED = 'export_generated',

  // Métricas de performance
  RESPONSE_TIME = 'response_time',
  DATABASE_RESPONSE_TIME = 'database_response_time',
  MEMORY_USAGE = 'memory_usage',
  CPU_USAGE = 'cpu_usage'
}

/**
 * 📊 Categorias de métricas
 */
export enum MetricCategory {
  USER_ACTIVITY = 'user_activity',
  PATIENT_MANAGEMENT = 'patient_management',
  CLINICAL_DATA = 'clinical_data',
  CONSULTATION = 'consultation',
  NOTIFICATION = 'notification',
  CONTENT = 'content',
  SYSTEM_HEALTH = 'system_health',
  PERFORMANCE = 'performance',
  SECURITY = 'security'
}

/**
 * 📊 Unidades de medida
 */
export enum MetricUnit {
  COUNT = 'count',
  PERCENTAGE = 'percentage',
  BYTES = 'bytes',
  MILLISECONDS = 'milliseconds',
  SECONDS = 'seconds',
  MINUTES = 'minutes',
  HOURS = 'hours',
  DAYS = 'days'
}

// ================================
// 🎯 INTERFACES
// ================================

/**
 * 📊 Interface do documento de métrica
 */
export interface IMetric extends Document {
  // Identificação da métrica
  type: MetricType;
  category: MetricCategory;
  name: string;
  description?: string;

  // Valor da métrica
  value: number;
  unit: MetricUnit;

  // Contexto
  userId?: string;
  patientId?: string;
  resourceId?: string;
  resourceType?: string;

  // Metadados
  tags: Map<string, string>;
  metadata: Record<string, any>;

  // Localização temporal
  timestamp: Date;
  period?: string; // daily, weekly, monthly, yearly

  // Agrupamento
  aggregationType?: 'sum' | 'avg' | 'min' | 'max' | 'count';
  source?: string; // api, system, user, cron

  // Controle
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date; // TTL para métricas temporárias
}

// ================================
// 🎯 SCHEMA MONGOOSE
// ================================

const MetricSchema = new Schema<IMetric>(
  {
    // Identificação
    type: {
      type: String,
      enum: Object.values(MetricType),
      required: true,
      index: true
    },
    category: {
      type: String,
      enum: Object.values(MetricCategory),
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500
    },

    // Valor
    value: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      enum: Object.values(MetricUnit),
      required: true
    },

    // Contexto
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
      index: true
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      sparse: true,
      index: true
    },
    resourceId: {
      type: String,
      sparse: true,
      index: true
    },
    resourceType: {
      type: String,
      sparse: true,
      index: true
    },

    // Metadados
    tags: {
      type: Map,
      of: String,
      default: new Map()
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    },

    // Temporal
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
      index: true
    },
    period: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly'],
      sparse: true,
      index: true
    },

    // Agrupamento
    aggregationType: {
      type: String,
      enum: ['sum', 'avg', 'min', 'max', 'count'],
      default: 'count'
    },
    source: {
      type: String,
      enum: ['api', 'system', 'user', 'cron'],
      default: 'api'
    },

    // TTL para métricas temporárias
    expiresAt: {
      type: Date,
      sparse: true,
      index: { expireAfterSeconds: 0 }
    }
  },
  {
    timestamps: true,
    collection: 'metrics'
  }
);

// ================================
// 🎯 ÍNDICES COMPOSTOS
// ================================

// Índices para consultas frequentes
MetricSchema.index({ type: 1, timestamp: -1 });
MetricSchema.index({ category: 1, timestamp: -1 });
MetricSchema.index({ userId: 1, type: 1, timestamp: -1 });
MetricSchema.index({ patientId: 1, type: 1, timestamp: -1 });
MetricSchema.index({ period: 1, timestamp: -1 });

// Índice para agregações
MetricSchema.index({ 
  category: 1, 
  type: 1, 
  period: 1, 
  timestamp: -1 
});

// Índice para filtros por tags
MetricSchema.index({ 'tags.key': 1, 'tags.value': 1 });

// ================================
// 🎯 MÉTODOS DO SCHEMA
// ================================

/**
 * 📊 Formatação para JSON
 */
MetricSchema.methods.toJSON = function() {
  const metric = this.toObject();
  
  // Converte Map para Object
  if (metric.tags instanceof Map) {
    metric.tags = Object.fromEntries(metric.tags);
  }

  return {
    id: metric._id,
    type: metric.type,
    category: metric.category,
    name: metric.name,
    description: metric.description,
    value: metric.value,
    unit: metric.unit,
    userId: metric.userId,
    patientId: metric.patientId,
    resourceId: metric.resourceId,
    resourceType: metric.resourceType,
    tags: metric.tags,
    metadata: metric.metadata,
    timestamp: metric.timestamp,
    period: metric.period,
    aggregationType: metric.aggregationType,
    source: metric.source,
    createdAt: metric.createdAt,
    updatedAt: metric.updatedAt
  };
};

// ================================
// 🎯 MÉTODOS ESTÁTICOS
// ================================

/**
 * 📊 Registrar métrica simples
 */
MetricSchema.statics.record = async function(
  type: MetricType,
  value: number = 1,
  options: Partial<IMetric> = {}
) {
  const category = MetricCategory.USER_ACTIVITY; // Simplificado por enquanto
  
  return await this.create({
    type,
    category,
    name: options.name || type.replace(/_/g, ' ').toLowerCase(),
    value,
    unit: options.unit || MetricUnit.COUNT,
    ...options,
    timestamp: options.timestamp || new Date()
  });
};

/**
 * 📊 Obter categoria para tipo de métrica
 */
MetricSchema.statics.getCategoryForType = function(type: MetricType): MetricCategory {
  const categoryMap: Record<string, MetricCategory> = {
    user_: MetricCategory.USER_ACTIVITY,
    patient_: MetricCategory.PATIENT_MANAGEMENT,
    assessment_: MetricCategory.CLINICAL_DATA,
    diet_plan_: MetricCategory.CLINICAL_DATA,
    consultation_: MetricCategory.CONSULTATION,
    notification_: MetricCategory.NOTIFICATION,
    blog_: MetricCategory.CONTENT,
    system_: MetricCategory.SYSTEM_HEALTH,
    api_: MetricCategory.SYSTEM_HEALTH,
    database_: MetricCategory.PERFORMANCE,
    response_time: MetricCategory.PERFORMANCE,
    memory_: MetricCategory.PERFORMANCE,
    cpu_: MetricCategory.PERFORMANCE
  };

  for (const [prefix, category] of Object.entries(categoryMap)) {
    if (type.startsWith(prefix)) {
      return category;
    }
  }

  return MetricCategory.SYSTEM_HEALTH;
};

// ================================
// 🎯 EXPORT
// ================================

export const Metric = mongoose.model<IMetric>('Metric', MetricSchema);