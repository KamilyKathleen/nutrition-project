import { NutritionalAssessmentModel } from '../models/NutritionalAssessment';
import { PatientModel } from '../models/Patient';
import { AppError } from '../middlewares/errorHandler';
import { NutritionalAssessment } from '../types';
import mongoose from 'mongoose';

export interface CreateAssessmentRequest {
  patientId: string;
  nutritionistId: string;
  anthropometricData: {
    height: number;
    weight: number;
    waistCircumference?: number;
    hipCircumference?: number;
    bodyFatPercentage?: number;
    muscleMass?: number;
    boneDensity?: number;
    skinfoldMeasurements?: Array<{
      location: string;
      measurement: number;
    }>;
  };
  foodRecord?: {
    date: Date;
    meals: Array<{
      type: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack';
      time: string;
      foods: Array<{
        name: string;
        quantity: number;
        unit: string;
        calories?: number;
        proteins?: number;
        carbohydrates?: number;
        fats?: number;
        fiber?: number;
      }>;
    }>;
    notes?: string;
  };
  physicalActivity?: {
    weeklyFrequency: number;
    activities: Array<{
      name: string;
      duration: number;
      intensity: 'low' | 'moderate' | 'high';
      frequency: number;
    }>;
    sedentaryTime: number;
  };
  observations?: string;
}

export interface UpdateAssessmentRequest extends Partial<CreateAssessmentRequest> {}

/**
 * 📊 SERVIÇO DE AVALIAÇÃO NUTRICIONAL
 */
export class NutritionalAssessmentService {
  
  /**
   * ➕ CRIAR NOVA AVALIAÇÃO NUTRICIONAL
   */
  async create(data: CreateAssessmentRequest): Promise<NutritionalAssessment> {
    try {
      // Verificar se o paciente existe e pertence ao nutricionista
      const patient = await PatientModel.findOne({
        _id: data.patientId,
        nutritionistId: data.nutritionistId,
        isActive: true
      });

      if (!patient) {
        throw new AppError('Paciente não encontrado ou não pertence a este nutricionista', 404);
      }

      const assessment = new NutritionalAssessmentModel({
        patientId: new mongoose.Types.ObjectId(data.patientId),
        nutritionistId: new mongoose.Types.ObjectId(data.nutritionistId),
        anthropometricData: data.anthropometricData,
        foodRecord: data.foodRecord,
        physicalActivity: data.physicalActivity,
        observations: data.observations
      });

      const savedAssessment = await assessment.save();
      
      return {
        id: savedAssessment._id.toString(),
        patientId: savedAssessment.patientId.toString(),
        nutritionistId: savedAssessment.nutritionistId.toString(),
        anthropometricData: savedAssessment.anthropometricData,
        foodRecord: savedAssessment.foodRecord,
        physicalActivity: savedAssessment.physicalActivity,
        observations: savedAssessment.observations,
        createdAt: savedAssessment.createdAt,
        updatedAt: savedAssessment.updatedAt
      } as NutritionalAssessment;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao criar avaliação nutricional', 500);
    }
  }

  /**
   * 📋 LISTAR AVALIAÇÕES POR NUTRICIONISTA
   */
  async findByNutritionistId(
    nutritionistId: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<{ assessments: NutritionalAssessment[]; total: number; pages: number }> {
    try {
      const skip = (page - 1) * limit;
      
      const [assessments, total] = await Promise.all([
        NutritionalAssessmentModel
          .find({ nutritionistId: new mongoose.Types.ObjectId(nutritionistId) })
          .populate('patientId', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        NutritionalAssessmentModel
          .countDocuments({ nutritionistId: new mongoose.Types.ObjectId(nutritionistId) })
      ]);

      return {
        assessments: assessments.map(assessment => ({
          id: assessment._id.toString(),
          patientId: assessment.patientId.toString(),
          nutritionistId: assessment.nutritionistId.toString(),
          anthropometricData: assessment.anthropometricData,
          foodRecord: assessment.foodRecord,
          physicalActivity: assessment.physicalActivity,
          observations: assessment.observations,
          createdAt: assessment.createdAt,
          updatedAt: assessment.updatedAt
        })) as NutritionalAssessment[],
        total,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new AppError('Erro ao listar avaliações nutricionais', 500);
    }
  }

  /**
   * 📋 LISTAR AVALIAÇÕES POR PACIENTE
   */
  async findByPatientId(
    patientId: string,
    nutritionistId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ assessments: NutritionalAssessment[]; total: number; pages: number }> {
    try {
      const skip = (page - 1) * limit;
      
      const [assessments, total] = await Promise.all([
        NutritionalAssessmentModel
          .find({ 
            patientId: new mongoose.Types.ObjectId(patientId),
            nutritionistId: new mongoose.Types.ObjectId(nutritionistId)
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        NutritionalAssessmentModel
          .countDocuments({ 
            patientId: new mongoose.Types.ObjectId(patientId),
            nutritionistId: new mongoose.Types.ObjectId(nutritionistId)
          })
      ]);

      return {
        assessments: assessments.map(assessment => ({
          id: assessment._id.toString(),
          patientId: assessment.patientId.toString(),
          nutritionistId: assessment.nutritionistId.toString(),
          anthropometricData: assessment.anthropometricData,
          foodRecord: assessment.foodRecord,
          physicalActivity: assessment.physicalActivity,
          observations: assessment.observations,
          createdAt: assessment.createdAt,
          updatedAt: assessment.updatedAt
        })) as NutritionalAssessment[],
        total,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new AppError('Erro ao listar avaliações do paciente', 500);
    }
  }

  /**
   * 🔍 BUSCAR AVALIAÇÃO POR ID
   */
  async findById(id: string, nutritionistId: string): Promise<NutritionalAssessment | null> {
    try {
      const assessment = await NutritionalAssessmentModel
        .findOne({ 
          _id: id,
          nutritionistId: new mongoose.Types.ObjectId(nutritionistId)
        })
        .populate('patientId', 'name email')
        .lean();

      if (!assessment) return null;

      return {
        id: assessment._id.toString(),
        patientId: assessment.patientId.toString(),
        nutritionistId: assessment.nutritionistId.toString(),
        anthropometricData: assessment.anthropometricData,
        foodRecord: assessment.foodRecord,
        physicalActivity: assessment.physicalActivity,
        observations: assessment.observations,
        createdAt: assessment.createdAt,
        updatedAt: assessment.updatedAt
      } as NutritionalAssessment;
    } catch (error) {
      throw new AppError('Erro ao buscar avaliação nutricional', 500);
    }
  }

  /**
   * ✏️ ATUALIZAR AVALIAÇÃO NUTRICIONAL
   */
  async update(id: string, nutritionistId: string, data: UpdateAssessmentRequest): Promise<NutritionalAssessment> {
    try {
      const assessment = await NutritionalAssessmentModel.findOne({
        _id: id,
        nutritionistId: new mongoose.Types.ObjectId(nutritionistId)
      });

      if (!assessment) {
        throw new AppError('Avaliação nutricional não encontrada', 404);
      }

      // Atualizar campos fornecidos
      Object.assign(assessment, data);
      
      const updatedAssessment = await assessment.save();

      return {
        id: updatedAssessment._id.toString(),
        patientId: updatedAssessment.patientId.toString(),
        nutritionistId: updatedAssessment.nutritionistId.toString(),
        anthropometricData: updatedAssessment.anthropometricData,
        foodRecord: updatedAssessment.foodRecord,
        physicalActivity: updatedAssessment.physicalActivity,
        observations: updatedAssessment.observations,
        createdAt: updatedAssessment.createdAt,
        updatedAt: updatedAssessment.updatedAt
      } as NutritionalAssessment;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao atualizar avaliação nutricional', 500);
    }
  }

  /**
   * 🗑️ EXCLUIR AVALIAÇÃO NUTRICIONAL
   */
  async delete(id: string, nutritionistId: string): Promise<void> {
    try {
      const result = await NutritionalAssessmentModel.deleteOne({
        _id: id,
        nutritionistId: new mongoose.Types.ObjectId(nutritionistId)
      });

      if (result.deletedCount === 0) {
        throw new AppError('Avaliação nutricional não encontrada', 404);
      }
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao excluir avaliação nutricional', 500);
    }
  }

  /**
   * 📊 ESTATÍSTICAS DE AVALIAÇÕES
   */
  async getStatistics(nutritionistId: string): Promise<{
    totalAssessments: number;
    assessmentsThisMonth: number;
    averageBMI: number;
    bmiDistribution: { underweight: number; normal: number; overweight: number; obese: number };
  }> {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [totalAssessments, assessmentsThisMonth, bmiStats] = await Promise.all([
        NutritionalAssessmentModel.countDocuments({
          nutritionistId: new mongoose.Types.ObjectId(nutritionistId)
        }),
        NutritionalAssessmentModel.countDocuments({
          nutritionistId: new mongoose.Types.ObjectId(nutritionistId),
          createdAt: { $gte: startOfMonth }
        }),
        NutritionalAssessmentModel.aggregate([
          { $match: { nutritionistId: new mongoose.Types.ObjectId(nutritionistId) } },
          {
            $group: {
              _id: null,
              avgBMI: { $avg: '$anthropometricData.bmi' },
              underweight: {
                $sum: { $cond: [{ $lt: ['$anthropometricData.bmi', 18.5] }, 1, 0] }
              },
              normal: {
                $sum: { $cond: [{ $and: [{ $gte: ['$anthropometricData.bmi', 18.5] }, { $lt: ['$anthropometricData.bmi', 25] }] }, 1, 0] }
              },
              overweight: {
                $sum: { $cond: [{ $and: [{ $gte: ['$anthropometricData.bmi', 25] }, { $lt: ['$anthropometricData.bmi', 30] }] }, 1, 0] }
              },
              obese: {
                $sum: { $cond: [{ $gte: ['$anthropometricData.bmi', 30] }, 1, 0] }
              }
            }
          }
        ])
      ]);

      const stats = bmiStats[0] || {
        avgBMI: 0,
        underweight: 0,
        normal: 0,
        overweight: 0,
        obese: 0
      };

      return {
        totalAssessments,
        assessmentsThisMonth,
        averageBMI: Number.parseFloat(stats.avgBMI?.toFixed(2)) || 0,
        bmiDistribution: {
          underweight: stats.underweight,
          normal: stats.normal,
          overweight: stats.overweight,
          obese: stats.obese
        }
      };
    } catch (error) {
      throw new AppError('Erro ao calcular estatísticas', 500);
    }
  }
}

export default new NutritionalAssessmentService();