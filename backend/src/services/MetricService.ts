/**
 * 📊 SERVIÇO DE MÉTRICAS E ANALYTICS
 * ==================================
 * Sistema completo de coleta, processamento e análise de métricas
 */

import { 
  Metric, 
  IMetric, 
  MetricType, 
  MetricCategory, 
  MetricUnit 
} from '../models/Metric';
import { AppError } from '../middlewares/errorHandler';
import { Types } from 'mongoose';

// ================================
// 🎯 INTERFACES
// ================================

/**
 * 📊 Opções para registro de métricas
 */
export interface MetricOptions {
  userId?: string;
  patientId?: string;
  resourceId?: string;
  resourceType?: string;
  tags?: Record<string, string>;
  metadata?: Record<string, any>;
  unit?: MetricUnit;
  period?: string;
  source?: 'api' | 'system' | 'user' | 'cron';
  expiresAt?: Date;
}

/**
 * 📊 Filtros para consulta de métricas
 */
export interface MetricFilters {
  type?: MetricType | MetricType[];
  category?: MetricCategory | MetricCategory[];
  userId?: string;
  patientId?: string;
  resourceType?: string;
  period?: string;
  startDate?: Date;
  endDate?: Date;
  tags?: Record<string, string>;
}

/**
 * 📊 Opções de agregação
 */
export interface AggregationOptions {
  groupBy: 'hour' | 'day' | 'week' | 'month' | 'year';
  aggregationType: 'sum' | 'avg' | 'min' | 'max' | 'count';
  fillMissing?: boolean;
  timezone?: string;
}

/**
 * 📊 Resultado de agregação
 */
export interface AggregationResult {
  _id: any;
  value: number;
  count: number;
  date?: Date;
  period?: string;
}

/**
 * 📊 Relatório de métricas
 */
export interface MetricReport {
  period: {
    start: Date;
    end: Date;
    type: string;
  };
  summary: {
    totalMetrics: number;
    categories: Record<MetricCategory, number>;
    topTypes: Array<{ type: MetricType; count: number; value: number }>;
  };
  trends: {
    daily: AggregationResult[];
    weekly?: AggregationResult[];
    monthly?: AggregationResult[];
  };
  performance: {
    avgResponseTime?: number;
    systemHealth?: number;
    errorRate?: number;
  };
  userActivity: {
    activeUsers: number;
    newUsers: number;
    sessionsPerUser: number;
  };
}

// ================================
// 🎯 CLASSE PRINCIPAL
// ================================

export class MetricService {
  
  // ================================
  // 🎯 REGISTRO DE MÉTRICAS
  // ================================

  /**
   * 📊 Registrar métrica simples
   */
  static async record(
    type: MetricType,
    value: number = 1,
    options: MetricOptions = {}
  ): Promise<IMetric> {
    try {
      const metric = await Metric.create({
        type,
        category: this.getCategoryForType(type),
        name: options.resourceType || type.replace(/_/g, ' '),
        value,
        unit: options.unit || MetricUnit.COUNT,
        userId: options.userId ? new Types.ObjectId(options.userId) : undefined,
        patientId: options.patientId ? new Types.ObjectId(options.patientId) : undefined,
        resourceId: options.resourceId,
        resourceType: options.resourceType,
        tags: options.tags ? new Map(Object.entries(options.tags)) : new Map(),
        metadata: options.metadata || {},
        period: options.period,
        source: options.source || 'api',
        expiresAt: options.expiresAt,
        timestamp: new Date()
      });

      return metric;
    } catch (error) {
      throw new AppError(
        `Erro ao registrar métrica: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        500
      );
    }
  }

  /**
   * 📊 Registrar múltiplas métricas em lote
   */
  static async recordBatch(
    metrics: Array<{
      type: MetricType;
      value: number;
      options?: MetricOptions;
    }>
  ): Promise<IMetric[]> {
    try {
      const metricDocuments = metrics.map(({ type, value, options = {} }) => ({
        type,
        category: this.getCategoryForType(type),
        name: options.resourceType || type.replace(/_/g, ' '),
        value,
        unit: options.unit || MetricUnit.COUNT,
        userId: options.userId ? new Types.ObjectId(options.userId) : undefined,
        patientId: options.patientId ? new Types.ObjectId(options.patientId) : undefined,
        resourceId: options.resourceId,
        resourceType: options.resourceType,
        tags: options.tags ? new Map(Object.entries(options.tags)) : new Map(),
        metadata: options.metadata || {},
        period: options.period,
        source: options.source || 'api',
        timestamp: new Date()
      }));

      const result = await Metric.insertMany(metricDocuments);
      return result as any;
    } catch (error) {
      throw new AppError(
        `Erro ao registrar métricas em lote: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        500
      );
    }
  }

  // ================================
  // 🎯 CONSULTA DE MÉTRICAS
  // ================================

  /**
   * 📊 Buscar métricas com filtros
   */
  static async find(
    filters: MetricFilters = {},
    options: { 
      limit?: number; 
      skip?: number; 
      sort?: Record<string, 1 | -1> 
    } = {}
  ): Promise<IMetric[]> {
    try {
      const query: any = {};

      // Aplicar filtros
      if (filters.type) {
        query.type = Array.isArray(filters.type) 
          ? { $in: filters.type } 
          : filters.type;
      }

      if (filters.category) {
        query.category = Array.isArray(filters.category) 
          ? { $in: filters.category } 
          : filters.category;
      }

      if (filters.userId) {
        query.userId = new Types.ObjectId(filters.userId);
      }

      if (filters.patientId) {
        query.patientId = new Types.ObjectId(filters.patientId);
      }

      if (filters.resourceType) {
        query.resourceType = filters.resourceType;
      }

      if (filters.period) {
        query.period = filters.period;
      }

      // Filtro de data
      if (filters.startDate || filters.endDate) {
        query.timestamp = {};
        if (filters.startDate) {
          query.timestamp.$gte = filters.startDate;
        }
        if (filters.endDate) {
          query.timestamp.$lte = filters.endDate;
        }
      }

      // Filtro por tags
      if (filters.tags) {
        for (const [key, value] of Object.entries(filters.tags)) {
          query[`tags.${key}`] = value;
        }
      }

      const result = await Metric.find(query)
        .limit(options.limit || 1000)
        .skip(options.skip || 0)
        .sort(options.sort || { timestamp: -1 })
        .lean();
      return result as any;
    } catch (error) {
      throw new AppError(
        `Erro ao buscar métricas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        500
      );
    }
  }

  /**
   * 📊 Agregar métricas
   */
  static async aggregate(
    filters: MetricFilters = {},
    aggregation: AggregationOptions
  ): Promise<AggregationResult[]> {
    try {
      const pipeline: any[] = [];

      // Match stage
      const matchStage: any = {};
      
      if (filters.type) {
        matchStage.type = Array.isArray(filters.type) 
          ? { $in: filters.type } 
          : filters.type;
      }

      if (filters.category) {
        matchStage.category = Array.isArray(filters.category) 
          ? { $in: filters.category } 
          : filters.category;
      }

      if (filters.startDate || filters.endDate) {
        matchStage.timestamp = {};
        if (filters.startDate) {
          matchStage.timestamp.$gte = filters.startDate;
        }
        if (filters.endDate) {
          matchStage.timestamp.$lte = filters.endDate;
        }
      }

      if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
      }

      // Group stage
      const groupStage: any = {
        _id: this.getGroupExpression(aggregation.groupBy, aggregation.timezone),
        count: { $sum: 1 }
      };

      // Aplicar agregação
      switch (aggregation.aggregationType) {
        case 'sum':
          groupStage.value = { $sum: '$value' };
          break;
        case 'avg':
          groupStage.value = { $avg: '$value' };
          break;
        case 'min':
          groupStage.value = { $min: '$value' };
          break;
        case 'max':
          groupStage.value = { $max: '$value' };
          break;
        default:
          groupStage.value = { $sum: 1 };
      }

      pipeline.push({ $group: groupStage });

      // Sort por período
      pipeline.push({ $sort: { _id: 1 } });

      const results = await Metric.aggregate(pipeline);

      // Preencher períodos ausentes se solicitado
      if (aggregation.fillMissing && filters.startDate && filters.endDate) {
        return this.fillMissingPeriods(
          results,
          filters.startDate,
          filters.endDate,
          aggregation.groupBy
        );
      }

      return results;
    } catch (error) {
      throw new AppError(
        `Erro ao agregar métricas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        500
      );
    }
  }

  // ================================
  // 🎯 RELATÓRIOS
  // ================================

  /**
   * 📊 Gerar relatório completo
   */
  static async generateReport(
    startDate: Date,
    endDate: Date,
    filters: Omit<MetricFilters, 'startDate' | 'endDate'> = {}
  ): Promise<MetricReport> {
    try {
      const baseFilters: MetricFilters = {
        ...filters,
        startDate,
        endDate
      };

      // Summary
      const totalMetrics = await Metric.countDocuments({
        timestamp: { $gte: startDate, $lte: endDate }
      });

      const categoryCounts = await Metric.aggregate([
        { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);

      const categories: Record<MetricCategory, number> = {} as any;
      categoryCounts.forEach((item: any) => {
        categories[item._id as MetricCategory] = item.count;
      });

      const topTypes = await Metric.aggregate([
        { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
        { 
          $group: { 
            _id: '$type', 
            count: { $sum: 1 }, 
            value: { $sum: '$value' } 
          } 
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).then(results => 
        results.map(item => ({
          type: item._id,
          count: item.count,
          value: item.value
        }))
      );

      // Trends
      const daily = await this.aggregate(baseFilters, {
        groupBy: 'day',
        aggregationType: 'sum',
        fillMissing: true
      });

      // Performance metrics
      const avgResponseTime = await this.getAverageResponseTime(startDate, endDate);
      const errorRate = await this.getErrorRate(startDate, endDate);

      // User activity
      const userActivity = await this.getUserActivityStats(startDate, endDate);

      return {
        period: {
          start: startDate,
          end: endDate,
          type: this.getPeriodType(startDate, endDate)
        },
        summary: {
          totalMetrics,
          categories,
          topTypes
        },
        trends: {
          daily
        },
        performance: {
          avgResponseTime,
          errorRate
        },
        userActivity
      };
    } catch (error) {
      throw new AppError(
        `Erro ao gerar relatório: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        500
      );
    }
  }

  // ================================
  // 🎯 MÉTODOS AUXILIARES
  // ================================

  /**
   * 📊 Obter categoria para tipo de métrica
   */
  private static getCategoryForType(type: MetricType): MetricCategory {
    const categoryMap: Record<string, MetricCategory> = {
      'USER_': MetricCategory.USER_ACTIVITY,
      'PATIENT_': MetricCategory.PATIENT_MANAGEMENT,
      'ASSESSMENT_': MetricCategory.CLINICAL_DATA,
      'DIET_PLAN_': MetricCategory.CLINICAL_DATA,
      'CONSULTATION_': MetricCategory.CONSULTATION,
      'NOTIFICATION_': MetricCategory.NOTIFICATION,
      'BLOG_': MetricCategory.CONTENT,
      'SYSTEM_': MetricCategory.SYSTEM_HEALTH,
      'API_': MetricCategory.SYSTEM_HEALTH,
      'DATABASE_': MetricCategory.PERFORMANCE,
      'RESPONSE_TIME': MetricCategory.PERFORMANCE,
      'MEMORY_': MetricCategory.PERFORMANCE,
      'CPU_': MetricCategory.PERFORMANCE
    };

    for (const [prefix, category] of Object.entries(categoryMap)) {
      if (type.startsWith(prefix)) {
        return category;
      }
    }

    return MetricCategory.SYSTEM_HEALTH;
  }

  /**
   * 📊 Obter expressão de agrupamento
   */
  private static getGroupExpression(groupBy: string, timezone = 'UTC') {
    const baseDate = {
      $dateToString: {
        format: '',
        date: '$timestamp',
        timezone
      }
    };

    switch (groupBy) {
      case 'hour':
        baseDate.$dateToString.format = '%Y-%m-%d-%H';
        break;
      case 'day':
        baseDate.$dateToString.format = '%Y-%m-%d';
        break;
      case 'week':
        return {
          $dateToString: {
            format: '%Y-%U',
            date: '$timestamp',
            timezone
          }
        };
      case 'month':
        baseDate.$dateToString.format = '%Y-%m';
        break;
      case 'year':
        baseDate.$dateToString.format = '%Y';
        break;
      default:
        baseDate.$dateToString.format = '%Y-%m-%d';
    }

    return baseDate;
  }

  /**
   * 📊 Preencher períodos ausentes
   */
  private static fillMissingPeriods(
    results: AggregationResult[],
    startDate: Date,
    endDate: Date,
    groupBy: string
  ): AggregationResult[] {
    // Implementação simplificada - pode ser expandida
    return results;
  }

  /**
   * 📊 Obter tempo médio de resposta
   */
  private static async getAverageResponseTime(
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const result = await Metric.aggregate([
      {
        $match: {
          type: MetricType.RESPONSE_TIME,
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$value' }
        }
      }
    ]);

    return result[0]?.avgResponseTime || 0;
  }

  /**
   * 📊 Obter taxa de erro
   */
  private static async getErrorRate(
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const totalRequests = await Metric.countDocuments({
      type: MetricType.API_REQUEST,
      timestamp: { $gte: startDate, $lte: endDate }
    });

    const errorRequests = await Metric.countDocuments({
      type: MetricType.API_ERROR,
      timestamp: { $gte: startDate, $lte: endDate }
    });

    return totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0;
  }

  /**
   * 📊 Obter estatísticas de atividade do usuário
   */
  private static async getUserActivityStats(
    startDate: Date,
    endDate: Date
  ) {
    const activeUsers = await Metric.distinct('userId', {
      type: { $in: [MetricType.USER_LOGIN, MetricType.API_REQUEST] },
      timestamp: { $gte: startDate, $lte: endDate }
    }).then(users => users.length);

    const newUsers = await Metric.countDocuments({
      type: MetricType.USER_REGISTRATION,
      timestamp: { $gte: startDate, $lte: endDate }
    });

    const totalSessions = await Metric.countDocuments({
      type: MetricType.USER_LOGIN,
      timestamp: { $gte: startDate, $lte: endDate }
    });

    return {
      activeUsers,
      newUsers,
      sessionsPerUser: activeUsers > 0 ? totalSessions / activeUsers : 0
    };
  }

  /**
   * 📊 Determinar tipo de período
   */
  private static getPeriodType(startDate: Date, endDate: Date): string {
    const diffInDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays <= 1) return 'daily';
    if (diffInDays <= 7) return 'weekly';
    if (diffInDays <= 31) return 'monthly';
    return 'yearly';
  }

  /**
   * 📊 Limpeza de métricas antigas
   */
  static async cleanup(daysToKeep: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await Metric.deleteMany({
        timestamp: { $lt: cutoffDate }
      });

      return result.deletedCount || 0;
    } catch (error) {
      throw new AppError(
        `Erro ao limpar métricas antigas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        500
      );
    }
  }

  /**
   * 📊 Método de conveniência - Obter relatório completo de métricas
   */
  static async getMetricsReport(
    startDate: Date,
    endDate: Date,
    options: { includeUserStats?: boolean; includeSystemStats?: boolean } = {}
  ) {
    try {
      const report = await this.generateReport(
        startDate,
        endDate,
        {}
      );

      return {
        success: true,
        report,
        generatedAt: new Date(),
        period: { startDate, endDate }
      };
    } catch (error) {
      throw new AppError(
        `Erro ao gerar relatório de métricas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        500
      );
    }
  }
}