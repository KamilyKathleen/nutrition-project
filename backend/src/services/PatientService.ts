
import mongoose from 'mongoose';
import { PatientModel } from '../models/Patient';
import { Patient, CreatePatientRequest, UpdatePatientRequest } from '../types';
import { AppError } from '../middlewares/errorHandler';

export class PatientService {
  /**
   * Vincula paciente a usuário por email, sem revelar existência do usuário
   * CORRIGIDO: Agora cria um convite ao invés de vincular automaticamente
   */
  async linkToUserByEmail(patientId: string, email: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      // Não revelar detalhes
      return;
    }
    const patient = await PatientModel.findById(patientId);
    if (!patient) {
      return;
    }

    // Buscar usuário pelo email
    const UserModel = require('../models/User').UserModel;
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user || user.role !== 'patient') {
      // Não revelar existência
      console.log(`📧 Usuário não encontrado ou não é paciente: ${email}`);
      return;
    }

    // 📤 CRIAR CONVITE ao invés de vincular automaticamente
    const { PatientInviteService } = await import('./PatientInviteService');
    const inviteService = new PatientInviteService();
    
    try {
      await inviteService.createInvite({
        patientEmail: email.toLowerCase(),
        patientName: user.name
      }, patient.nutritionistId.toString());
      
      console.log(`✅ Convite criado para ${email} - Aguardando aceitação do paciente`);
    } catch (error: any) {
      // Se já existe convite pendente, ignorar erro
      if (error.message?.includes('convite pendente')) {
        console.log(`ℹ️ Já existe convite pendente para ${email}`);
      } else {
        throw error;
      }
    }
  }
  /**
   * 🎯 CRIAR PACIENTE
   * Por que este método?
   * - Associa paciente ao usuário logado (student/nutritionist)
   * - Converte data de nascimento para Date
   */
    async create(createData: CreatePatientRequest, nutritionistId: string): Promise<Patient> {
    try {

      const patient = new PatientModel({
        ...createData,
        nutritionistId: new mongoose.Types.ObjectId(nutritionistId),
        isActive: true
      });

      const savedPatient = await patient.save();
      const patientJson = savedPatient.toJSON();
      return {
        ...patientJson,
        id: savedPatient._id.toString(),
        nutritionistId: savedPatient.nutritionistId.toString()
      } as any;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error.code === 11000) {
        throw new AppError('Erro de duplicação de dados', 400);
      }
      throw new AppError('Erro ao criar paciente', 500);
    }
  }

  /**
   * 🔍 BUSCAR PACIENTE POR ID
   * Por que este método?
   * - Valida ObjectId do MongoDB
   * - Retorna null se não encontrar (não erro)
   * - Usado para verificar existência
   */
  async findById(id: string): Promise<Patient | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      const patient = await PatientModel.findById(id)
        .populate('nutritionistId', 'name email') // 🔗 Incluir dados do responsável
        .exec();
      
      if (!patient) return null;
      
      const patientJson = patient.toJSON();
      return {
        ...patientJson,
        id: patient._id.toString(),
        nutritionistId: typeof patient.nutritionistId === 'object' && patient.nutritionistId._id 
          ? patient.nutritionistId._id.toString()
          : patient.nutritionistId.toString()
      } as any;
    } catch (error) {
      throw new AppError('Erro ao buscar paciente', 500);
    }
  }

  /**
   * 📋 LISTAR PACIENTES DO USUÁRIO
   * Por que este método?
   * - Lista apenas pacientes do usuário logado
   * - Paginação para performance
   * - Apenas pacientes ativos (soft delete)
   * - Enriquece com informações de convites pendentes
   */
  async findByNutritionistId(nutritionistId: string, page: number = 1, limit: number = 20): Promise<{
    patients: Patient[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      if (!mongoose.Types.ObjectId.isValid(nutritionistId)) {
        throw new AppError('ID do nutricionista inválido', 400);
      }

      const skip = (page - 1) * limit;
      
      const [patients, total] = await Promise.all([
        PatientModel.find({ nutritionistId: new mongoose.Types.ObjectId(nutritionistId), isActive: true })
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .exec(),
        PatientModel.countDocuments({ nutritionistId: new mongoose.Types.ObjectId(nutritionistId), isActive: true }).exec()
      ]);

      const totalPages = Math.ceil(total / limit);

      // 📧 Buscar convites pendentes para enriquecer dados
      const PatientInviteModel = require('../models/PatientInvite').PatientInviteModel;
      const patientEmails = patients
        .filter(p => p.email)
        .map(p => p.email!.toLowerCase());

      const pendingInvites = await PatientInviteModel.find({
        nutritionistId: new mongoose.Types.ObjectId(nutritionistId),
        patientEmail: { $in: patientEmails },
        status: 'pending'
      }).exec();

      // Criar mapa de convites por email
      const inviteMap = new Map();
      for (const invite of pendingInvites) {
        inviteMap.set(invite.patientEmail.toLowerCase(), {
          inviteId: invite._id.toString(),
          inviteDate: invite.sentAt.toISOString()
        });
      }

      return {
        patients: patients.map(patient => {
          const patientJson = patient.toJSON();
          const inviteInfo = patient.email ? inviteMap.get(patient.email.toLowerCase()) : null;
          
          return {
            ...patientJson,
            id: patient._id.toString(),
            nutritionistId: patient.nutritionistId.toString(),
            userId: patient.userId?.toString(), // Incluir userId se existir
            ...(inviteInfo && {
              inviteId: inviteInfo.inviteId,
              inviteDate: inviteInfo.inviteDate
            })
          } as Patient;
        }),
        total,
        page,
        totalPages
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao listar pacientes', 500);
    }
  }

  /**
   * ✏️ ATUALIZAR PACIENTE
   * Por que este método?
   * - Valida se existe antes de atualizar
   * - Converte data de nascimento se fornecida
   * - Retorna dados atualizados
   */
  async update(id: string, updateData: UpdatePatientRequest): Promise<Patient> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('ID de paciente inválido', 400);
      }



      const updateFields: any = { ...updateData };
      
      // 📅 Converter data de nascimento se fornecida
      if (updateData.birthDate) {
        updateFields.birthDate = new Date(updateData.birthDate);
      }

      const updatedPatient = await PatientModel.findByIdAndUpdate(
        id,
        updateFields,
        { new: true, runValidators: true }
      ).populate('nutritionistId', 'name email');

      if (!updatedPatient) {
        throw new AppError('Paciente não encontrado', 404);
      }

      const patientJson = updatedPatient.toJSON();
      return {
        ...patientJson,
        id: updatedPatient._id.toString(),
        nutritionistId: updatedPatient.nutritionistId.toString()
      } as any;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error.code === 11000) {
        throw new AppError('Erro de duplicação de dados', 400);
      }
      throw new AppError('Erro ao atualizar paciente', 500);
    }
  }

  /**
   * 🗑️ DELETAR PACIENTE
   * Por que este método?
   * - Soft delete para manter histórico
   * - Valida se existe antes de deletar
   * - Retorna confirmação da operação
   */

  /**
   * 🔗 VINCULAR PACIENTE A USUÁRIO
   * Por que este método?
   * - Permite vincular um paciente criado pelo nutricionista a uma conta de usuário existente
   * - Atualiza o status para 'linked' quando vinculado
   * - Valida se o usuário existe antes de vincular
   */
  async linkToUser(patientId: string, userId: string): Promise<Patient> {
    try {
      // Validar IDs
      if (!mongoose.Types.ObjectId.isValid(patientId)) {
        throw new AppError('ID de paciente inválido', 400);
      }
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError('ID de usuário inválido', 400);
      }

      // Buscar paciente
      const patient = await PatientModel.findById(patientId);
      if (!patient) {
        throw new AppError('Paciente não encontrado', 404);
      }

      // Verificar se o usuário existe (importar UserModel se necessário)
      const UserModel = require('../models/User').UserModel;
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      // Verificar se o usuário é um paciente (não nutricionista)
      if (user.role !== 'patient') {
        throw new AppError('Usuário não é um paciente', 400);
      }

      // Atualizar paciente com o userId e status
      const updatedPatient = await PatientModel.findByIdAndUpdate(
        patientId,
        { 
          userId: new mongoose.Types.ObjectId(userId),
          status: 'linked',
          email: user.email // Atualizar email com o do usuário
        },
        { new: true, runValidators: true }
      );

      if (!updatedPatient) {
        throw new AppError('Erro ao vincular paciente', 500);
      }

      const patientJson = updatedPatient.toJSON();
      return {
        ...patientJson,
        id: updatedPatient._id.toString(),
        nutritionistId: updatedPatient.nutritionistId.toString(),
        userId: updatedPatient.userId?.toString()
      } as Patient;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Erro ao vincular paciente:', error);
      throw new AppError('Erro ao vincular paciente', 500);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('ID de paciente inválido', 400);
      }

      const deletedPatient = await PatientModel.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );

      if (!deletedPatient) {
        throw new AppError('Paciente não encontrado', 404);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao deletar paciente', 500);
    }
  }

  /**
   * 🔍 BUSCAR PACIENTE POR USER ID
   * Por que este método?
   * - Busca pelo userId (mais preciso que email)
   * - Usado quando o usuário está logado e sabemos o ID dele
   */
  async findByUserId(userId: string): Promise<Patient | null> {
    try {
      console.log('🔍 Buscando paciente por userId:', userId);
      
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.log('❌ userId inválido');
        return null;
      }

      const patient = await PatientModel.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        isActive: true
      }).exec();

      if (!patient) {
        console.log('❌ Nenhum paciente encontrado com userId:', userId);
        return null;
      }

      console.log('✅ Paciente encontrado por userId:', patient.email);
      
      const patientJson = patient.toJSON();
      return {
        ...patientJson,
        id: patient._id.toString(),
        nutritionistId: patient.nutritionistId.toString()
      } as any;

    } catch (error: any) {
      console.error('❌ Erro ao buscar paciente por userId:', error);
      return null;
    }
  }

  /**
   * 📧 BUSCAR PACIENTE POR EMAIL
   * Por que este método?
   * - Permite ao paciente verificar se tem relacionamento
   * - Usado para verificar vínculos nutricionista-paciente
   */
  async findByEmail(email: string): Promise<Patient | null> {
    try {
      console.log('🔍 Buscando paciente por email:', email);
      console.log('🔍 Email normalizado:', email.toLowerCase());
      
      // Primeiro testar se existem pacientes
      const allPatients = await PatientModel.aggregate([{ $match: {} }]);
      console.log('🔍 Total de pacientes no banco:', allPatients.length);
      console.log('🔍 Emails dos pacientes:', allPatients.map(p => p.email));
      
      const patients = await PatientModel.aggregate([
        { 
          $match: { 
            email: email.toLowerCase(),
            isActive: true 
          }
        },
        { $limit: 1 }
      ]);
      
      console.log('🔍 Pacientes encontrados com filtro:', patients.length);
      if (patients.length > 0) {
        console.log('🔍 Paciente encontrado:', patients[0]);
      }
      
      const patient = patients[0];

      if (!patient) {
        return null;
      }

      return {
        ...patient,
        id: patient._id.toString(),
        nutritionistId: patient.nutritionistId.toString()
      } as Patient;
    } catch (error) {
      console.error('Erro ao buscar paciente por email:', error);
      return null;
    }
  }

  /**
   * �🔐 VERIFICAR PROPRIEDADE DO PACIENTE
   * Por que este método?
   * - Garante que apenas o dono pode modificar
   * - Evita vazamento de dados entre usuários
   * - Usado nos middlewares de autorização
   */
  async verifyOwnership(patientId: string, studentId: string): Promise<boolean> {
    try {
      if (!mongoose.Types.ObjectId.isValid(patientId) || !mongoose.Types.ObjectId.isValid(studentId)) {
        return false;
      }

      const patient = await PatientModel.findOne({
        _id: patientId,
        studentId: new mongoose.Types.ObjectId(studentId),
        isActive: true
      });

      return !!patient;
    } catch (error) {
      return false;
    }
  }
}
