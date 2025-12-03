import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/errorHandler';
import { AuthenticatedRequest } from '../types';
import { Response } from 'express';

const router = Router();

/**
 * 📋 LISTAR CONVITES PENDENTES PARA O PACIENTE
 * GET /api/invites/pending
 * Headers: Authorization: Bearer <token>
 */
router.get('/pending', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userEmail = req.user!.email;
  
  // Importar dinamicamente para evitar dependência circular
  const { PatientInviteService } = await import('../services/PatientInviteService');
  const inviteService = new PatientInviteService();
  
  const invites = await inviteService.getInvitesByEmail(userEmail);
  
  res.json({
    success: true,
    data: invites
  });
}));

/**
 * ✅ ACEITAR CONVITE
 * POST /api/invites/:inviteId/accept
 * Headers: Authorization: Bearer <token>
 */
router.post('/:inviteId/accept', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { inviteId } = req.params;
  
  // Importar dinamicamente para evitar dependência circular
  const { PatientInviteService } = await import('../services/PatientInviteService');
  const inviteService = new PatientInviteService();
  
  await inviteService.acceptInviteById(inviteId);
  
  res.json({
    success: true,
    message: 'Convite aceito com sucesso!'
  });
}));

/**
 * ❌ REJEITAR CONVITE
 * POST /api/invites/:inviteId/reject
 * Headers: Authorization: Bearer <token>
 */
router.post('/:inviteId/reject', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { inviteId } = req.params;
  
  // Importar dinamicamente para evitar dependência circular
  const { PatientInviteService } = await import('../services/PatientInviteService');
  const inviteService = new PatientInviteService();
  
  await inviteService.rejectInvite(inviteId);
  
  res.json({
    success: true,
    message: 'Convite rejeitado'
  });
}));

export { router as inviteRoutes };