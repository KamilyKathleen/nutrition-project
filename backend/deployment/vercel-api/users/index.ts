import { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth, AuthenticatedRequest } from '../_lib/handler';
import { UserService } from '../../src/services/UserService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withAuth(req as AuthenticatedRequest, res, async (req, res) => {
    const userService = new UserService();

    switch (req.method) {
      case 'GET':
        // Obter perfil do usuário atual
        try {
          const user = await userService.findById(req.user!.userId);
          
          if (!user) {
            return res.status(404).json({
              success: false,
              message: 'Usuário não encontrado'
            });
          }

          res.status(200).json({
            success: true,
            data: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              phone: user.phone,
              isActive: user.isActive
            }
          });
        } catch (error: any) {
          res.status(500).json({
            success: false,
            message: 'Erro ao buscar usuário'
          });
        }
        break;

      default:
        res.status(405).json({
          success: false,
          message: 'Método não permitido'
        });
    }
  });
}