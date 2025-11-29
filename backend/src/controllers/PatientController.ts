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

  /**
   * 📤 ENVIAR CONVITE PARA PACIENTE
   */
  sendInvite = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { patientEmail, message } = req.body;
    const nutritionistId = req.user!.userId;

    // Buscar se já existe um usuário com esse email
    const { UserService } = await import('../services/UserService');
    const userService = new UserService();
    
    let patientName = '';
    try {
      const existingUser = await userService.findByEmail(patientEmail);
      if (existingUser) {
        patientName = existingUser.name;
        console.log(`📧 Usuário encontrado: ${existingUser.name} (${patientEmail})`);
      } else {
        console.log(`📧 Usuário não encontrado para: ${patientEmail}`);
      }
    } catch (error) {
      // Se não encontrar usuário, continua sem nome
      console.log(`📧 Email ${patientEmail} não possui cadastro no sistema`);
    }

    // Importar dinamicamente para evitar dependência circular
    const { PatientInviteService } = await import('../services/PatientInviteService');
    const inviteService = new PatientInviteService();

    const invite = await inviteService.createInvite({
      patientEmail,
      patientName: patientName || undefined, // Só inclui se encontrou
      message
    }, nutritionistId);

    res.status(201).json({
      success: true,
      message: patientName 
        ? `Convite enviado para ${patientName} (${patientEmail})` 
        : `Convite enviado para ${patientEmail}`,
      data: invite
    });
  });

  /**
   * 📋 LISTAR CONVITES ENVIADOS
   */
  listInvites = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const nutritionistId = req.user!.userId;

    // Importar dinamicamente para evitar dependência circular
    const { PatientInviteService } = await import('../services/PatientInviteService');
    const inviteService = new PatientInviteService();

    const invites = await inviteService.getInvitesByNutritionist(nutritionistId);

    res.json({
      success: true,
      data: invites
    });
  });

  /**
   * 🗑️ CANCELAR CONVITE
   */
  cancelInvite = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { inviteId } = req.params;
    const nutritionistId = req.user!.userId;

    // Importar dinamicamente para evitar dependência circular
    const { PatientInviteService } = await import('../services/PatientInviteService');
    const inviteService = new PatientInviteService();

    await inviteService.cancelInvite(inviteId, nutritionistId);

    res.json({
      success: true,
      message: 'Convite cancelado com sucesso'
    });
  });

  /**
   * 🔗 VERIFICAR SE PACIENTE TEM RELACIONAMENTO (PARA FRONTEND)
   */
  getMyRelationship = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const userEmail = req.user!.email;

    // Buscar se o usuário tem relacionamento como paciente
    const patient = await this.patientService.findByEmail(userEmail);

    if (!patient) {
      res.status(404).json({
        success: false,
        message: 'Nenhum relacionamento encontrado'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Relacionamento encontrado',
      data: patient
    });
  });

  /**
   * 👨‍⚕️ BUSCAR DADOS DO NUTRICIONISTA VINCULADO
   */
  getMyNutritionist = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userEmail = req.user!.email;

    // Buscar o paciente pelo email
    const patient = await this.patientService.findByEmail(userEmail);

    if (!patient) {
      res.status(404).json({
        success: false,
        message: 'Nenhum relacionamento encontrado'
      });
      return;
    }

    // Buscar dados do nutricionista
    const { UserService } = await import('../services/UserService');
    const userService = new UserService();
    const nutritionist = await userService.findById(patient.nutritionistId);

    if (!nutritionist) {
      res.status(404).json({
        success: false,
        message: 'Nutricionista não encontrado'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Nutricionista encontrado',
      data: {
        id: nutritionist.id,
        name: nutritionist.name,
        email: nutritionist.email,
        crn: nutritionist.crn
      }
    });
  });
}