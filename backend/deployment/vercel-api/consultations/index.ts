import { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth, AuthenticatedRequest } from '../_lib/handler';
import { ConsultationService } from '../../src/services/ConsultationService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withAuth(req as AuthenticatedRequest, res, async (req, res) => {
    const consultationService = new ConsultationService();

    if (req.method === 'GET') {
      // Listar consultas
      try {
        if (req.user?.role === 'nutricionista') {
          // Nutricionista vê suas consultas
          const consultations = await consultationService.findByNutritionistId(req.user.userId);
          
          res.status(200).json({
            success: true,
            data: consultations
          });
        } else if (req.user?.role === 'paciente') {
          // Paciente vê suas consultas
          const consultations = await consultationService.findByPatientId(req.user.userId);
          
          res.status(200).json({
            success: true,
            data: consultations
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
          message: 'Erro ao listar consultas'
        });
      }
    } else if (req.method === 'POST') {
      // Agendar nova consulta (apenas nutricionista)
      try {
        if (req.user?.role !== 'nutricionista') {
          return res.status(403).json({
            success: false,
            message: 'Apenas nutricionistas podem agendar consultas'
          });
        }

        const consultationData = {
          ...req.body,
          nutritionistId: req.user.userId,
          createdBy: req.user.userId
        };

        const consultation = await consultationService.create(consultationData, req.user.userId);
        
        res.status(201).json({
          success: true,
          message: 'Consulta agendada com sucesso',
          data: consultation
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