import mongoose, { Schema, Document } from 'mongoose';

/**
 * 📋 LOG DE AUDITORIA
 * Registra acessos a dados sensíveis de pacientes
 */
interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  action: string;
  resourceType: 'PATIENT' | 'USER' | 'ASSESSMENT';
  resourceId: mongoose.Types.ObjectId;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  sensitive: boolean; // Marca se envolve dados sensíveis
}

const auditLogSchema = new Schema<IAuditLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'PATIENT_CREATE',
      'PATIENT_READ',
      'PATIENT_UPDATE', 
      'PATIENT_DELETE',
      'PATIENT_LIST',
      'SENSITIVE_DATA_ACCESS',
      'LOGIN',
      'LOGOUT',
      'ASSESSMENT_CREATE',
      'ASSESSMENT_READ',
      'diet_plan_create',
      'diet_plan_read',
      'diet_plan_update',
      'diet_plan_delete',
      'CREATE',
      'READ',
      'UPDATE',
      'DELETE',
      'LIST'
    ]
  },
  resourceType: {
    type: String,
    required: true,
    enum: ['PATIENT', 'USER', 'ASSESSMENT', 'DIET_PLAN']
  },
  resourceId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  details: {
    type: Schema.Types.Mixed, // Dados adicionais específicos da ação
    default: {}
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  sensitive: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: false, // Usamos o campo timestamp customizado
  versionKey: false
});

// Indexes para performance e consultas
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ sensitive: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 }); // Para limpeza automática

// TTL para remover logs antigos automaticamente (90 dias)
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 dias

export const AuditLogModel = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

/**
 * 📝 SERVIÇO DE AUDITORIA
 */
export class AuditService {
  /**
   * 📋 REGISTRAR AÇÃO DE AUDITORIA
   */
  static async log(params: {
    userId: string;
    userEmail: string;
    action: string;
    resourceType: 'PATIENT' | 'USER' | 'ASSESSMENT';
    resourceId: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
    sensitive?: boolean;
  }) {
    try {
      // Validar se os IDs são ObjectIds válidos antes de criar
      const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);
      
      await AuditLogModel.create({
        userId: isValidObjectId(params.userId) ? new mongoose.Types.ObjectId(params.userId) : null,
        userEmail: params.userEmail,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId && isValidObjectId(params.resourceId) 
          ? new mongoose.Types.ObjectId(params.resourceId) 
          : null,
        details: params.details || {},
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        sensitive: params.sensitive || false,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Erro ao registrar log de auditoria:', error);
      console.error('Params recebidos:', {
        userId: params.userId,
        resourceId: params.resourceId,
        action: params.action
      });
      // Não falha a operação principal se auditoria falhar
    }
  }

  /**
   * 🔍 BUSCAR LOGS POR USUÁRIO
   */
  static async getLogsByUser(userId: string, limit: number = 50) {
    return AuditLogModel
      .find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * 🔍 BUSCAR LOGS POR RECURSO
   */
  static async getLogsByResource(resourceType: string, resourceId: string, limit: number = 50) {
    return AuditLogModel
      .find({ 
        resourceType, 
        resourceId: new mongoose.Types.ObjectId(resourceId) 
      })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('userId', 'name email')
      .lean();
  }

  /**
   * 🚨 BUSCAR ACESSOS A DADOS SENSÍVEIS
   */
  static async getSensitiveDataAccess(days: number = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return AuditLogModel
      .find({ 
        sensitive: true,
        timestamp: { $gte: since }
      })
      .sort({ timestamp: -1 })
      .populate('userId', 'name email role')
      .lean();
  }

  /**
   * 📊 RELATÓRIO DE ATIVIDADES
   */
  static async getActivityReport(days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [actionStats, userStats, sensitiveStats] = await Promise.all([
      // Estatísticas por ação
      AuditLogModel.aggregate([
        { $match: { timestamp: { $gte: since } } },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // Usuários mais ativos
      AuditLogModel.aggregate([
        { $match: { timestamp: { $gte: since } } },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        }
      ]),

      // Acessos a dados sensíveis
      AuditLogModel.aggregate([
        { 
          $match: { 
            sensitive: true,
            timestamp: { $gte: since } 
          } 
        },
        { $group: { _id: '$userEmail', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    return {
      period: { days, since },
      actionStats,
      userStats,
      sensitiveStats,
      totalActions: actionStats.reduce((sum, stat) => sum + stat.count, 0)
    };
  }
}