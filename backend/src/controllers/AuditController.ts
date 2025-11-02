import { Response } from 'express';
import { AuthenticatedRequest } from '@/middlewares/auth';
import { AuditService } from '@/services/AuditService';

/**
 * 📋 CONTROLLER DE AUDITORIA E RELATÓRIOS DE SEGURANÇA
 */
export class AuditController {
  /**
   * 📊 RELATÓRIO DE ATIVIDADES GERAIS
   */
  getActivityReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { days = 30 } = req.query;
      
      const report = await AuditService.getActivityReport(Number(days));

      res.json({
        success: true,
        message: 'Relatório de atividades gerado com sucesso',
        data: report
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao gerar relatório de atividades'
      });
    }
  };

  /**
   * 🚨 RELATÓRIO DE ACESSOS A DADOS SENSÍVEIS
   */
  getSensitiveDataReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { days = 7 } = req.query;
      
      const sensitiveAccess = await AuditService.getSensitiveDataAccess(Number(days));

      res.json({
        success: true,
        message: 'Relatório de dados sensíveis gerado com sucesso',
        data: {
          period: { days: Number(days) },
          totalAccess: sensitiveAccess.length,
          accesses: sensitiveAccess
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao gerar relatório de dados sensíveis'
      });
    }
  };

  /**
   * 👤 LOGS DE USUÁRIO ESPECÍFICO
   */
  getUserLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { limit = 50 } = req.query;
      
      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'ID do usuário é obrigatório'
        });
        return;
      }
      
      const logs = await AuditService.getLogsByUser(userId, Number(limit));

      res.json({
        success: true,
        message: 'Logs do usuário recuperados com sucesso',
        data: logs
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao recuperar logs do usuário'
      });
    }
  };

  /**
   * 🏥 LOGS DE PACIENTE ESPECÍFICO
   */
  getPatientLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { patientId } = req.params;
      const { limit = 50 } = req.query;
      
      if (!patientId) {
        res.status(400).json({
          success: false,
          message: 'ID do paciente é obrigatório'
        });
        return;
      }
      
      const logs = await AuditService.getLogsByResource('PATIENT', patientId, Number(limit));

      res.json({
        success: true,
        message: 'Logs do paciente recuperados com sucesso',
        data: logs
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao recuperar logs do paciente'
      });
    }
  };

  /**
   * 📈 MÉTRICAS DE SEGURANÇA
   */
  getSecurityMetrics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { days = 30 } = req.query;
      
      const [activityReport, sensitiveAccess] = await Promise.all([
        AuditService.getActivityReport(Number(days)),
        AuditService.getSensitiveDataAccess(Number(days))
      ]);

      // Calcular métricas de segurança
      const metrics = {
        period: { days: Number(days) },
        totalActions: activityReport.totalActions,
        sensitiveDataAccess: sensitiveAccess.length,
        uniqueUsersAccessing: new Set(sensitiveAccess.map(log => log.userEmail)).size,
        topSensitiveActions: sensitiveAccess.reduce((acc: any, log: any) => {
          acc[log.action] = (acc[log.action] || 0) + 1;
          return acc;
        }, {}),
        riskScore: calculateRiskScore(sensitiveAccess, activityReport.totalActions),
        recommendations: generateSecurityRecommendations(sensitiveAccess, activityReport)
      };

      res.json({
        success: true,
        message: 'Métricas de segurança geradas com sucesso',
        data: metrics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao gerar métricas de segurança'
      });
    }
  };

  /**
   * 🔍 LOGS DE AUDITORIA PESSOAIS (LGPD)
   */
  getMyAuditLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { limit = 100 } = req.query;
      
      const logs = await AuditService.getLogsByUser(userId, Number(limit));

      res.json({
        success: true,
        message: 'Seus logs de auditoria (LGPD)',
        data: {
          totalLogs: logs.length,
          logs: logs.map(log => ({
            action: log.action,
            resourceType: log.resourceType,
            timestamp: log.timestamp,
            details: log.details
          }))
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao recuperar logs pessoais'
      });
    }
  };
}

/**
 * 🎯 CALCULAR SCORE DE RISCO
 */
function calculateRiskScore(sensitiveAccess: any[], totalActions: number): string {
  if (totalActions === 0) return 'LOW';
  
  const sensitiveRatio = sensitiveAccess.length / totalActions;
  
  if (sensitiveRatio > 0.5) return 'HIGH';
  if (sensitiveRatio > 0.2) return 'MEDIUM';
  return 'LOW';
}

/**
 * 💡 GERAR RECOMENDAÇÕES DE SEGURANÇA
 */
function generateSecurityRecommendations(sensitiveAccess: any[], activityReport: any): string[] {
  const recommendations: string[] = [];
  
  // Verificar acessos fora de horário
  const nightAccess = sensitiveAccess.filter(log => {
    const hour = new Date(log.timestamp).getHours();
    return hour < 6 || hour > 22;
  });
  
  if (nightAccess.length > 0) {
    recommendations.push('Detectados acessos fora do horário comercial. Revisar necessidade.');
  }
  
  // Verificar usuários com muitos acessos
  const userAccess = sensitiveAccess.reduce((acc: any, log: any) => {
    acc[log.userEmail] = (acc[log.userEmail] || 0) + 1;
    return acc;
  }, {});
  
  const highVolumeUsers = Object.entries(userAccess).filter(([_, count]) => (count as number) > 20);
  if (highVolumeUsers.length > 0) {
    recommendations.push('Alguns usuários têm alto volume de acessos. Verificar se é necessário.');
  }
  
  // Recomendações gerais
  if (sensitiveAccess.length > 100) {
    recommendations.push('Alto volume de acessos a dados sensíveis. Considerar implementar controles adicionais.');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Padrões de acesso normais. Continuar monitoramento.');
  }
  
  return recommendations;
}