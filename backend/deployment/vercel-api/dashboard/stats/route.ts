import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { PatientModel } from '@/models/Patient';
import { ConsultationModel } from '@/models/Consultation';
import { NutritionalAssessmentModel } from '@/models/NutritionalAssessment';
import { DietPlanModel } from '@/models/DietPlan';
import { authMiddleware } from '@/middlewares/auth';

/**
 * 📊 DASHBOARD STATISTICS
 * =======================
 * Estatísticas para dashboard do nutricionista e paciente
 */

// GET /api/dashboard/stats
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verificar autenticação
    const authResult = await authMiddleware(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));

    let stats = {};

    if (user.role === 'nutritionist') {
      // Estatísticas do Nutricionista
      const [
        totalPatients,
        activePatients,
        consultationsToday,
        consultationsThisWeek,
        consultationsThisMonth,
        assessmentsThisMonth,
        activeDietPlans
      ] = await Promise.all([
        PatientModel.countDocuments({ 
          nutritionistId: user.id,
          isActive: true 
        }),
        PatientModel.countDocuments({ 
          nutritionistId: user.id,
          isActive: true,
          updatedAt: { $gte: startOfMonth }
        }),
        ConsultationModel.countDocuments({
          nutritionistId: user.id,
          scheduledDate: {
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999))
          },
          status: { $in: ['scheduled', 'confirmed'] }
        }),
        ConsultationModel.countDocuments({
          nutritionistId: user.id,
          scheduledDate: { $gte: startOfWeek },
          status: { $in: ['scheduled', 'confirmed', 'completed'] }
        }),
        ConsultationModel.countDocuments({
          nutritionistId: user.id,
          scheduledDate: { $gte: startOfMonth },
          status: { $in: ['scheduled', 'confirmed', 'completed'] }
        }),
        NutritionalAssessmentModel.countDocuments({
          nutritionistId: user.id,
          createdAt: { $gte: startOfMonth }
        }),
        DietPlanModel.countDocuments({
          nutritionistId: user.id,
          status: 'active'
        })
      ]);

      // Próximas consultas
      const upcomingConsultations = await ConsultationModel
        .find({
          nutritionistId: user.id,
          scheduledDate: { $gte: new Date() },
          status: { $in: ['scheduled', 'confirmed'] }
        })
        .populate('patientId', 'name email')
        .sort({ scheduledDate: 1 })
        .limit(5);

      // Pacientes recentemente adicionados
      const recentPatients = await PatientModel
        .find({ 
          nutritionistId: user.id,
          isActive: true 
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email createdAt');

      stats = {
        overview: {
          totalPatients,
          activePatients,
          consultationsToday,
          activeDietPlans
        },
        consultations: {
          today: consultationsToday,
          thisWeek: consultationsThisWeek,
          thisMonth: consultationsThisMonth
        },
        assessments: {
          thisMonth: assessmentsThisMonth
        },
        upcomingConsultations,
        recentPatients
      };

    } else if (user.role === 'patient') {
      // Estatísticas do Paciente
      const patient = await PatientModel.findOne({ 
        email: user.email,
        isActive: true 
      });

      if (!patient) {
        return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });
      }

      const [
        nextConsultation,
        activeDietPlan,
        totalAssessments,
        lastAssessment,
        consultationsThisMonth
      ] = await Promise.all([
        ConsultationModel
          .findOne({
            patientId: patient._id,
            scheduledDate: { $gte: new Date() },
            status: { $in: ['scheduled', 'confirmed'] }
          })
          .populate('nutritionistId', 'name crn')
          .sort({ scheduledDate: 1 }),
        
        DietPlanModel
          .findOne({
            patientId: patient._id,
            status: 'active'
          })
          .sort({ createdAt: -1 }),
        
        NutritionalAssessmentModel.countDocuments({
          patientId: patient._id
        }),
        
        NutritionalAssessmentModel
          .findOne({ patientId: patient._id })
          .sort({ createdAt: -1 })
          .select('weight bmi assessmentDate objectives'),
        
        ConsultationModel.countDocuments({
          patientId: patient._id,
          scheduledDate: { $gte: startOfMonth },
          status: { $in: ['scheduled', 'confirmed', 'completed'] }
        })
      ]);

      // Progresso de peso (últimas 6 avaliações)
      const weightProgress = await NutritionalAssessmentModel
        .find({ patientId: patient._id })
        .sort({ assessmentDate: -1 })
        .limit(6)
        .select('weight bmi assessmentDate')
        .lean();

      stats = {
        overview: {
          nextConsultation,
          activeDietPlan: activeDietPlan ? {
            id: activeDietPlan._id,
            name: activeDietPlan.name,
            startDate: activeDietPlan.startDate,
            totalDays: activeDietPlan.duration
          } : null,
          totalAssessments,
          consultationsThisMonth
        },
        progress: {
          lastAssessment: lastAssessment ? {
            weight: lastAssessment.weight,
            bmi: lastAssessment.bmi,
            date: lastAssessment.assessmentDate,
            objectives: lastAssessment.objectives
          } : null,
          weightHistory: weightProgress.reverse()
        },
        patient: {
          id: patient._id,
          name: patient.name,
          email: patient.email
        }
      };
    }

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}