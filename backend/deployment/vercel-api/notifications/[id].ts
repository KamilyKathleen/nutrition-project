import { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth, AuthenticatedRequest } from '../_lib/handler';
import { NotificationModel } from '../../src/models/Notification';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withAuth(req as AuthenticatedRequest, res, async (req, res) => {
    const { id } = req.query;

    if (req.method === 'PUT') {
      // Marcar notificação como lida
      try {
        if (!id || typeof id !== 'string') {
          return res.status(400).json({
            success: false,
            message: 'ID da notificação é obrigatório'
          });
        }

        const notification = await NotificationModel.findOneAndUpdate(
          {
            _id: id,
            userId: req.user?.userId // Só pode marcar suas próprias notificações
          },
          {
            status: 'READ',
            readAt: new Date(),
            updatedAt: new Date()
          },
          { new: true }
        );

        if (!notification) {
          return res.status(404).json({
            success: false,
            message: 'Notificação não encontrada'
          });
        }

        res.status(200).json({
          success: true,
          message: 'Notificação marcada como lida',
          data: notification
        });

      } catch (error: any) {
        res.status(500).json({
          success: false,
          message: 'Erro ao atualizar notificação'
        });
      }
    } else if (req.method === 'DELETE') {
      // Deletar notificação
      try {
        if (!id || typeof id !== 'string') {
          return res.status(400).json({
            success: false,
            message: 'ID da notificação é obrigatório'
          });
        }

        const notification = await NotificationModel.findOneAndDelete({
          _id: id,
          userId: req.user?.userId
        });

        if (!notification) {
          return res.status(404).json({
            success: false,
            message: 'Notificação não encontrada'
          });
        }

        res.status(200).json({
          success: true,
          message: 'Notificação deletada com sucesso'
        });

      } catch (error: any) {
        res.status(500).json({
          success: false,
          message: 'Erro ao deletar notificação'
        });
      }
    } else {
      res.status(405).json({
        success: false,
        message: 'Método não permitido'
      });
    }
  });
}