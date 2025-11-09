/**
 * 🔍 UTILITÁRIOS DE AUDITORIA
 * ============================
 * Sistema de auditoria para rastreamento de ações sensíveis
 */

import mongoose, { Schema } from 'mongoose';

/**
 * 🏷️ SCHEMA DE AUDITORIA
 */
export const auditSchema = new Schema({
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  version: {
    type: Number,
    default: 1,
    required: true
  }
}, { _id: false });

/**
 * 🏷️ INTERFACE DE AUDITORIA
 */
export interface IAuditInfo {
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
  version: number;
}

/**
 * 📝 MODELO DE LOG DE AUDITORIA
 */
export interface IAuditLog extends mongoose.Document {
  action: string;
  resource: string;
  resourceId: string;
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  userRole: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
  action: {
    type: String,
    required: true,
    index: true
  },
  resource: {
    type: String,
    required: true,
    index: true
  },
  resourceId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    required: true
  },
  details: Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false,
  collection: 'audit_logs'
});

// Índices compostos para performance
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ action: 1, timestamp: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

/**
 * 📝 Função para registrar log de auditoria
 */
export const logAudit = async (
  action: string,
  resource: string,
  resourceId: string,
  userId: string,
  details?: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> => {
  try {
    // Buscar informações do usuário
    const User = mongoose.model('User');
    const user = await User.findById(userId).select('email role');
    
    if (!user) {
      console.warn(`[AUDIT] Usuário não encontrado: ${userId}`);
      return;
    }

    const auditLog = new AuditLog({
      action,
      resource,
      resourceId,
      userId,
      userEmail: user.email,
      userRole: user.role,
      details,
      ipAddress,
      userAgent
    });

    await auditLog.save();
    
    console.log(`[AUDIT] ${action} - ${resource}:${resourceId} by ${user.email}`);
  } catch (error) {
    console.error('[AUDIT] Erro ao registrar log:', error);
    // Não propagar o erro para não afetar a operação principal
  }
};

/**
 * 📊 Buscar logs de auditoria por usuário
 */
export const getAuditLogsByUser = async (
  userId: string,
  limit = 50,
  skip = 0
): Promise<IAuditLog[]> => {
  return await AuditLog
    .find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip)
    .exec();
};

/**
 * 📊 Buscar logs de auditoria por recurso
 */
export const getAuditLogsByResource = async (
  resource: string,
  resourceId: string,
  limit = 50,
  skip = 0
): Promise<IAuditLog[]> => {
  return await AuditLog
    .find({ resource, resourceId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip)
    .populate('userId', 'name email role')
    .exec();
};

/**
 * 📊 Buscar logs de auditoria por ação
 */
export const getAuditLogsByAction = async (
  action: string,
  startDate?: Date,
  endDate?: Date,
  limit = 100,
  skip = 0
): Promise<IAuditLog[]> => {
  const query: any = { action };
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = startDate;
    if (endDate) query.timestamp.$lte = endDate;
  }

  return await AuditLog
    .find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip)
    .populate('userId', 'name email role')
    .exec();
};

/**
 * 🧹 Limpar logs antigos (para manutenção)
 */
export const cleanOldAuditLogs = async (daysToKeep = 365): Promise<number> => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await AuditLog.deleteMany({
    timestamp: { $lt: cutoffDate }
  });

  return result.deletedCount || 0;
};