import { Response } from 'express';
import { PatientService } from '../services/PatientService';
import { asyncHandler } from '../middlewares/errorHandler';
import { AuthenticatedRequest } from '../types';

/**
 * 🏥 PATIENT CONTROLLER
 */
export class PatientController {
  private readonly patientService: PatientService;

  constructor() {
    this.patientService = new PatientService();
  }

  /**
   * 📝 CRIAR PACIENTE
   */
  create = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const createData = req.body;
    const nutritionistId = req.user!.userId;

    const patient = await this.patientService.create(createData, nutritionistId);

    res.status(201).json({
      success: true,
      message: 'Paciente criado com sucesso',
      data: patient
    });
  });

  /**
   * 📋 LISTAR PACIENTES
   */
  list = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { page = 1, limit = 20 } = req.query;
    const nutritionistId = req.user!.userId;

    const result = await this.patientService.findByNutritionistId(
      nutritionistId,
      Number(page),
      Number(limit)
    );

    res.json({
      success: true,
      message: 'Pacientes listados com sucesso',
      data: result.patients,
      pagination: {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: Number(page) < result.totalPages,
        hasPrev: Number(page) > 1
      }
    });
  });

  /**
   * 🔍 BUSCAR POR ID
   */
  findById = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const nutritionistId = req.user!.userId;

    const patient = await this.patientService.findById(id);

    if (!patient) {
      res.status(404).json({
        success: false,
        message: 'Paciente não encontrado'
      });
      return;
    }

    // 🛡️ Verificar propriedade
    if (patient.nutritionistId !== nutritionistId) {
      res.status(403).json({
        success: false,
        message: 'Acesso não autorizado'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Paciente encontrado',
      data: patient
    });
  });

  /**
   * ✏️ ATUALIZAR PACIENTE
   */
  update = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData = req.body;
    const nutritionistId = req.user!.userId;

    // Primeiro verificar se existe e pertence ao usuário
    const existingPatient = await this.patientService.findById(id);
    if (!existingPatient || existingPatient.nutritionistId !== nutritionistId) {
      res.status(404).json({
        success: false,
        message: 'Paciente não encontrado'
      });
      return;
    }

    const patient = await this.patientService.update(id, updateData);

    res.json({
      success: true,
      message: 'Paciente atualizado com sucesso',
      data: patient
    });
  });

  /**
   * 🗑️ DELETAR PACIENTE
   */
  delete = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const nutritionistId = req.user!.userId;

    // Primeiro verificar se existe e pertence ao usuário
    const existingPatient = await this.patientService.findById(id);
    if (!existingPatient || existingPatient.nutritionistId !== nutritionistId) {
      res.status(404).json({
        success: false,
        message: 'Paciente não encontrado'
      });
      return;
    }

    await this.patientService.delete(id);

    res.json({
      success: true,
      message: 'Paciente removido com sucesso'
    });
  });
}