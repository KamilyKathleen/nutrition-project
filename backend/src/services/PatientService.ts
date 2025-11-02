import { PatientModel } from '@/models/Patient';
import { Patient, CreatePatientRequest, UpdatePatientRequest } from '@/types';
import { AppError } from '@/middlewares/errorHandler';
import mongoose from 'mongoose';

export class PatientService {
  /**
   * 🎯 CRIAR PACIENTE
   * Por que este método?
   * - Associa paciente ao usuário logado (student/nutritionist)
   * - Valida dados únicos (CPF) apenas se informado
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
      } as Patient;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error.code === 11000) {
        throw new AppError('Paciente com este CPF já existe', 400);
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
      } as Patient;
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

      return {
        patients: patients.map(patient => {
          const patientJson = patient.toJSON();
          return {
            ...patientJson,
            id: patient._id.toString(),
            nutritionistId: patient.nutritionistId.toString()
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

      // 🔍 Verificar se CPF já existe em outro paciente (apenas se foi informado)
      if (updateData.cpf) {
        const existingPatient = await PatientModel.findOne({ 
          cpf: updateData.cpf,
          _id: { $ne: id } // Excluir o próprio paciente
        });
        
        if (existingPatient) {
          throw new AppError('Já existe outro paciente com este CPF', 400);
        }
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
      ).populate('studentId', 'name email');

      if (!updatedPatient) {
        throw new AppError('Paciente não encontrado', 404);
      }

      const patientJson = updatedPatient.toJSON();
      return {
        ...patientJson,
        id: updatedPatient._id.toString(),
        nutritionistId: updatedPatient.nutritionistId.toString()
      } as Patient;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error.code === 11000) {
        throw new AppError('Já existe outro paciente com este CPF', 400);
      }
      throw new AppError('Erro ao atualizar paciente', 500);
    }
  }

  /**
   * 🗑️ DELETAR PACIENTE (SOFT DELETE)
   * Por que este método?
   * - Soft delete para manter histórico
   * - Valida se existe antes de deletar
   * - Retorna confirmação da operação
   */
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
   * 🔐 VERIFICAR PROPRIEDADE DO PACIENTE
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