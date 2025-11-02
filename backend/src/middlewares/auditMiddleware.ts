import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/middlewares/auth';
import { AuditService } from '@/services/AuditService';

/**
 * 📋 MIDDLEWARE DE AUDITORIA PARA DADOS SENSÍVEIS
 */
export const auditSensitiveAccess = (
  action: string,
  resourceType: 'PATIENT' | 'USER' | 'ASSESSMENT',
  extractResourceId: (req: Request) => string
) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Passar para o próximo middleware primeiro
      next();

      // Fazer auditoria de forma assíncrona (não bloquear response)
      setImmediate(async () => {
        try {
          const resourceId = extractResourceId(req);
          const user = req.user;

          if (user && resourceId) {
            const ipAddress = req.ip || req.connection.remoteAddress;
            const userAgent = req.get('User-Agent');
            
            await AuditService.log({
              userId: user.userId,
              userEmail: user.email,
              action,
              resourceType,
              resourceId,
              ...(ipAddress && { ipAddress }),
              ...(userAgent && { userAgent }),
              sensitive: isSensitiveAction(action),
              details: {
                method: req.method,
                path: req.path,
                query: req.query,
                timestamp: new Date().toISOString()
              }
            });
          }
        } catch (auditError) {
          console.error('Erro na auditoria:', auditError);
          // Não falhar a requisição por erro de auditoria
        }
      });
    } catch (error) {
      next(error);
    }
  };
};

/**
 * 🚨 IDENTIFICAR AÇÕES SENSÍVEIS
 */
const isSensitiveAction = (action: string): boolean => {
  const sensitiveActions = [
    'PATIENT_READ',
    'PATIENT_UPDATE',
    'PATIENT_DELETE',
    'SENSITIVE_DATA_ACCESS'
  ];
  return sensitiveActions.includes(action);
};

/**
 * 📋 AUDITORIA ESPECÍFICA PARA PACIENTES
 */
export const auditPatientAccess = (action: string) => 
  auditSensitiveAccess(action, 'PATIENT', (req) => req.params.id || '');

/**
 * 📋 AUDITORIA PARA LISTAGEM DE PACIENTES
 */
export const auditPatientList = () => 
  auditSensitiveAccess('PATIENT_LIST', 'PATIENT', (req) => (req as AuthenticatedRequest).user?.userId || '');

/**
 * 🔒 MIDDLEWARE PARA DADOS MÉDICOS ESPECÍFICOS
 */
export const auditMedicalDataAccess = () => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Interceptar response para verificar se contém dados médicos
    const originalSend = res.json;
    
    res.json = function(data: any) {
      // Verificar se response contém dados médicos sensíveis
      if (data && data.data) {
        const patient = data.data;
        const hasMedicalData = patient.medicalHistory || 
                              (patient.allergies && patient.allergies.length > 0) ||
                              (patient.medications && patient.medications.length > 0);

        if (hasMedicalData) {
          // Log assíncrono para dados médicos
          setImmediate(async () => {
            try {
              const ipAddress = req.ip;
              const userAgent = req.get('User-Agent');
              
              await AuditService.log({
                userId: req.user!.userId,
                userEmail: req.user!.email,
                action: 'SENSITIVE_DATA_ACCESS',
                resourceType: 'PATIENT',
                resourceId: patient.id || req.params.id,
                ...(ipAddress && { ipAddress }),
                ...(userAgent && { userAgent }),
                sensitive: true,
                details: {
                  dataTypes: {
                    medicalHistory: !!patient.medicalHistory,
                    allergies: patient.allergies?.length > 0,
                    medications: patient.medications?.length > 0
                  },
                  accessTime: new Date().toISOString()
                }
              });
            } catch (error) {
              console.error('Erro ao auditar acesso a dados médicos:', error);
            }
          });
        }
      }

      return originalSend.call(this, data);
    };

    next();
  };
};