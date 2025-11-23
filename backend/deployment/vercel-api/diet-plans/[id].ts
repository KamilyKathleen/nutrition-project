import { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth, AuthenticatedRequest } from '../_lib/handler';
import { DietPlanService } from '../../src/services/DietPlanService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withAuth(req as AuthenticatedRequest, res, async (req, res) => {
    const { id } = req.query;
    const dietPlanService = new DietPlanService();

    if (req.method === 'GET') {
      // Obter plano específico
      try {
        if (!id || typeof id !== 'string') {
          return res.status(400).json({
            success: false,
            message: 'ID do plano é obrigatório'
          });
        }

        const plan = await dietPlanService.findById(id);
        
        if (!plan) {
          return res.status(404).json({
            success: false,
            message: 'Plano alimentar não encontrado'
          });
        }

        // Verificar permissão
        if (req.user?.role === 'paciente' && plan.patientId !== req.user.userId) {
          return res.status(403).json({
            success: false,
            message: 'Acesso negado'
          });
        }

        res.status(200).json({
          success: true,
          data: plan
        });

      } catch (error: any) {
        res.status(500).json({
          success: false,
          message: 'Erro ao buscar plano alimentar'
        });
      }
    } else if (req.method === 'PUT') {
      // Atualizar plano (apenas nutricionista)
      try {
        if (req.user?.role !== 'nutricionista') {
          return res.status(403).json({
            success: false,
            message: 'Apenas nutricionistas podem atualizar planos'
          });
        }

        if (!id || typeof id !== 'string') {
          return res.status(400).json({
            success: false,
            message: 'ID do plano é obrigatório'
          });
        }

        const updateData = {
          ...req.body,
          updatedBy: req.user.userId,
          updatedAt: new Date()
        };

        const plan = await dietPlanService.update(id, updateData);

        res.status(200).json({
          success: true,
          message: 'Plano alimentar atualizado com sucesso',
          data: plan
        });

      } catch (error: any) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      }
    } else if (req.method === 'DELETE') {
      // Deletar plano (apenas nutricionista)
      try {
        if (req.user?.role !== 'nutricionista') {
          return res.status(403).json({
            success: false,
            message: 'Apenas nutricionistas podem deletar planos'
          });
        }

        if (!id || typeof id !== 'string') {
          return res.status(400).json({
            success: false,
            message: 'ID do plano é obrigatório'
          });
        }

        await dietPlanService.delete(id);

        res.status(200).json({
          success: true,
          message: 'Plano alimentar deletado com sucesso'
        });

      } catch (error: any) {
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