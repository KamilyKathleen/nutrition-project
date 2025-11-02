/**
 * 🔒 ROTAS DE AUDITORIA E SEGURANÇA - LGPD
 * ============================================
 * Sistema completo de auditoria para compliance LGPD
 */

import { Router } from 'express';
import { AuditController } from '../controllers/AuditController';
import { authenticate, authorize } from '../middlewares/auth';
import { UserRole } from '../types';

const router = Router();
const auditController = new AuditController();

/**
 * 🔐 TODAS AS ROTAS REQUEREM AUTENTICAÇÃO
 */
router.use(authenticate);

/**
 * 📊 RELATÓRIOS DE ATIVIDADE - Admin/Nutritionist
 */
router.get('/activity', 
  authorize(UserRole.ADMIN, UserRole.NUTRITIONIST),
  auditController.getActivityReport
);

/**
 * 🔍 ACESSO A DADOS SENSÍVEIS - Admin apenas
 */
router.get('/sensitive-access', 
  authorize(UserRole.ADMIN),
  auditController.getSensitiveDataReport
);

/**
 * 👤 LOGS POR USUÁRIO - Admin apenas
 */
router.get('/user/:userId', 
  authorize(UserRole.ADMIN),
  auditController.getUserLogs
);

/**
 * 📈 MÉTRICAS DE SEGURANÇA - Admin apenas
 */
router.get('/security-metrics', 
  authorize(UserRole.ADMIN),
  auditController.getSecurityMetrics
);

/**
 * 🔍 MEUS LOGS (LGPD) - Qualquer usuário autenticado
 */
router.get('/my-logs', 
  auditController.getMyAuditLogs
);

export default router;