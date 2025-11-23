import { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth, AuthenticatedRequest } from '../_lib/handler';
import { NotificationModel } from '../../src/models/Notification';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withAuth(req as AuthenticatedRequest, res, async (req, res) => {
    
    if (req.method === 'GET') {
      // Listar notificações do usuário
      try {
        const { page = 1, limit = 20, status, type } = req.query;
        
        // Filtros
        const filters: any = {
          userId: req.user?.userId
        };

        if (status) {
          filters.status = status;
        }
        
        if (type) {
          filters.type = type;
        }

        // Paginação
        const skip = (Number(page) - 1) * Number(limit);

        const notifications = await NotificationModel
          .find(filters)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .select('type title message status channel createdAt sentAt scheduledFor');

        const total = await NotificationModel.countDocuments(filters);

        // Contadores por status
        const statusCounts = await NotificationModel.aggregate([
          { $match: { userId: req.user?.userId } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);

        res.status(200).json({
          success: true,
          data: {
            notifications,
            pagination: {
              page: Number(page),
              limit: Number(limit),
              total,
              pages: Math.ceil(total / Number(limit))
            },
            statusCounts: statusCounts.reduce((acc: any, item: any) => {
              acc[item._id] = item.count;
              return acc;
            }, {})
          }
        });

      } catch (error: any) {
        console.error('Erro ao listar notificações:', error);
        res.status(500).json({
          success: false,
          message: 'Erro ao listar notificações'
        });
      }
    } else if (req.method === 'POST') {
      // Criar nova notificação
      try {
        const notificationData = {
          ...req.body,
          userId: req.user?.userId,
          createdBy: req.user?.userId,
          status: 'PENDING'
        };

        const notification = await NotificationModel.create(notificationData);

        res.status(201).json({
          success: true,
          message: 'Notificação criada com sucesso',
          data: notification
        });

      } catch (error: any) {
        console.error('Erro ao criar notificação:', error);
        res.status(400).json({
          success: false,
          message: error.message
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