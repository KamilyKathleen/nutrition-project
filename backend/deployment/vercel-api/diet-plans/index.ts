import { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth, AuthenticatedRequest } from '../_lib/handler';
import { DietPlanService } from '../../src/services/DietPlanService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withAuth(req as AuthenticatedRequest, res, async (req, res) => {
    const dietPlanService = new DietPlanService();

    if (req.method === 'GET') {
      // Listar planos alimentares
      try {
        if (req.user?.role === 'nutricionista') {
          // Nutricionista vê todos os planos que criou
          const plans = await dietPlanService.findByNutritionist(req.user.userId);
          
          res.status(200).json({
            success: true,
            data: plans
          });
        } else if (req.user?.role === 'paciente') {
          // Paciente vê apenas seus próprios planos
          const plans = await dietPlanService.findByPatient(req.user.userId);
          
          res.status(200).json({
            success: true,
            data: plans
          });
        } else {
          res.status(403).json({
            success: false,
            message: 'Acesso negado'
          });
        }
      } catch (error: any) {
        res.status(500).json({
          success: false,
          message: 'Erro ao listar planos alimentares'
        });
      }
    } else if (req.method === 'POST') {
      // Criar novo plano alimentar (apenas nutricionista)
      try {
        if (req.user?.role !== 'nutricionista') {
          return res.status(403).json({
            success: false,
            message: 'Apenas nutricionistas podem criar planos alimentares'
          });
        }

        const planData = {
          ...req.body,
          nutritionistId: req.user.userId,
          createdBy: req.user.userId
        };

        const plan = await dietPlanService.create(planData);
        
        res.status(201).json({
          success: true,
          message: 'Plano alimentar criado com sucesso',
          data: plan
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