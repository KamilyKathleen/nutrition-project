import { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth, AuthenticatedRequest } from '../_lib/handler';
import { PatientService } from '../../src/services/PatientService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withAuth(req as AuthenticatedRequest, res, async (req, res) => {
    const patientService = new PatientService();

    if (req.method === 'GET') {
      // Listar pacientes do nutricionista
      try {
        if (req.user?.role !== 'nutricionista') {
          return res.status(403).json({
            success: false,
            message: 'Apenas nutricionistas podem acessar pacientes'
          });
        }

        // Em uma implementação real, filtraria por nutricionista
        const patients = await patientService.findByNutritionist(req.user.userId);
        
        res.status(200).json({
          success: true,
          data: patients
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          message: 'Erro ao listar pacientes'
        });
      }
    } else if (req.method === 'POST') {
      // Criar novo paciente
      try {
        if (req.user?.role !== 'nutricionista') {
          return res.status(403).json({
            success: false,
            message: 'Apenas nutricionistas podem criar pacientes'
          });
        }

        const patientData = {
          ...req.body,
          nutritionistId: req.user.userId
        };

        const patient = await patientService.create(patientData);
        
        res.status(201).json({
          success: true,
          message: 'Paciente criado com sucesso',
          data: patient
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