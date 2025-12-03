/**
 * 📊 ROTAS DE DADOS DO PACIENTE
 * =============================
 * Endpoints para pacientes visualizarem seus próprios dados
 */

import { Router } from 'express';
import { NutritionalAssessmentController } from '../controllers/NutritionalAssessmentController';
import { DietPlanController } from '../controllers/DietPlanController';
import { authenticate, authorize } from '../middlewares/auth';
import { UserRole } from '../types';

const router = Router();
const nutritionalController = new NutritionalAssessmentController();
const dietPlanController = new DietPlanController();

/**
 * 🔐 APLICAR AUTENTICAÇÃO PARA PACIENTES
 */
router.use(authenticate);
router.use(authorize([UserRole.PATIENT, UserRole.NUTRITIONIST, UserRole.ADMIN]));

/**
 * 📊 BUSCAR AVALIAÇÕES NUTRICIONAIS DO PACIENTE LOGADO
 */
router.get('/assessments', async (req: any, res: any) => {
    try {
        // Obter email do usuário logado do token
        const userEmail = req.user.email;
        
        // Buscar paciente pelo email
        const { PatientModel } = await import('../models/Patient');
        const patient = await PatientModel.findOne({ email: userEmail });
        
        if (!patient) {
            return res.status(404).json({ 
                success: false, 
                message: 'Paciente não encontrado' 
            });
        }

        // Buscar avaliações do paciente
        req.params = { patientId: patient._id.toString() };
        return await nutritionalController.getAssessmentsByPatient(req, res);
        
    } catch (error) {
        console.error('Erro ao buscar avaliações do paciente:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

/**
 * 📈 BUSCAR EVOLUÇÃO DO PACIENTE LOGADO
 */
router.get('/evolution', async (req: any, res: any) => {
    try {
        // Obter email do usuário logado do token
        const userEmail = req.user.email;
        
        // Buscar paciente pelo email
        const { PatientModel } = await import('../models/Patient');
        const patient = await PatientModel.findOne({ email: userEmail });
        
        if (!patient) {
            return res.status(404).json({ 
                success: false, 
                message: 'Paciente não encontrado' 
            });
        }

        // Buscar evolução do paciente
        req.params = { patientId: patient._id.toString() };
        return await nutritionalController.getPatientEvolution(req, res);
        
    } catch (error) {
        console.error('Erro ao buscar evolução do paciente:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

/**
 * 🍽️ BUSCAR PLANOS ALIMENTARES DO PACIENTE LOGADO
 */
router.get('/diet-plans', async (req: any, res: any) => {
    try {
        // Obter email do usuário logado do token
        const userEmail = req.user.email;
        
        // Buscar paciente pelo email
        const { PatientModel } = await import('../models/Patient');
        const patient = await PatientModel.findOne({ email: userEmail });
        
        if (!patient) {
            return res.status(404).json({ 
                success: false, 
                message: 'Paciente não encontrado' 
            });
        }

        console.log('🔍 Paciente encontrado:', patient._id);
        console.log('🔍 Email do paciente:', patient.email);

        // Buscar planos alimentares do paciente
        const { DietPlanModel } = await import('../models/DietPlan');
        const allPlans = await DietPlanModel.find({}).lean();
        console.log('🔍 Todos os planos no banco:', allPlans.length);
        if (allPlans.length > 0) {
            console.log('🔍 Primeiro plano - patientId:', allPlans[0]?.patientId);
        }
        
        const plans = await DietPlanModel.aggregate([
            { $match: { patientId: patient._id } },
            { 
                $lookup: {
                    from: 'users',
                    localField: 'nutritionistId',
                    foreignField: '_id',
                    as: 'nutritionist'
                }
            },
            { $unwind: '$nutritionist' },
            { 
                $project: {
                    _id: 1,
                    patientId: 1,
                    nutritionistId: 1,
                    title: 1,
                    description: 1,
                    startDate: 1,
                    endDate: 1,
                    targetCalories: 1,
                    targetProteins: 1,
                    targetCarbohydrates: 1,
                    targetFats: 1,
                    meals: 1,
                    isActive: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    'nutritionist.name': 1,
                    'nutritionist.email': 1
                }
            },
            { $sort: { createdAt: -1 } }
        ]);
            
        console.log('🔍 Planos encontrados para o paciente:', plans.length);

        const formattedPlans = plans.map(plan => ({
            id: plan._id.toString(),
            title: plan.title,
            description: plan.description,
            startDate: plan.startDate,
            endDate: plan.endDate,
            targetCalories: plan.targetCalories,
            targetProteins: plan.targetProteins,
            targetCarbohydrates: plan.targetCarbohydrates,
            targetFats: plan.targetFats,
            meals: plan.meals,
            isActive: plan.isActive,
            nutritionist: plan.nutritionistId,
            createdAt: plan.createdAt,
            updatedAt: plan.updatedAt
        }));

        res.json({
            success: true,
            message: 'Planos do paciente listados com sucesso',
            data: formattedPlans,
            pagination: {
                currentPage: 1,
                totalPages: Math.ceil(plans.length / 10),
                totalItems: plans.length,
                itemsPerPage: 10
            }
        });
        
    } catch (error) {
        console.error('Erro ao buscar planos alimentares do paciente:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

/**
 * 🍽️ BUSCAR PLANO ALIMENTAR ATIVO DO PACIENTE LOGADO
 */
router.get('/diet-plans/active', async (req: any, res: any) => {
    try {
        // Obter email do usuário logado do token
        const userEmail = req.user.email;
        
        // Buscar paciente pelo email
        const { PatientModel } = await import('../models/Patient');
        const patient = await PatientModel.findOne({ email: userEmail });
        
        if (!patient) {
            return res.status(404).json({ 
                success: false, 
                message: 'Paciente não encontrado' 
            });
        }

        // Buscar plano ativo do paciente
        req.params = { patientId: patient._id.toString() };
        return await dietPlanController.getActiveDietPlan(req, res);
        
    } catch (error) {
        console.error('Erro ao buscar plano ativo do paciente:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

/**
 * 📊 BUSCAR DADOS BÁSICOS DO PACIENTE LOGADO
 */
router.get('/profile', async (req: any, res: any) => {
    try {
        // Obter email do usuário logado do token
        const userEmail = req.user.email;
        
        // Buscar paciente pelo email
        const { PatientModel } = await import('../models/Patient');
        const patient = await PatientModel.findOne({ email: userEmail }).populate('nutritionistId', 'name email crn');
        
        if (!patient) {
            return res.status(404).json({ 
                success: false, 
                message: 'Paciente não encontrado' 
            });
        }

        return res.json({
            success: true,
            data: {
                id: patient._id,
                name: patient.name,
                email: patient.email,
                birthDate: patient.birthDate,
                gender: patient.gender,
                nutritionist: patient.nutritionistId ? {
                    id: (patient.nutritionistId as any)._id,
                    name: (patient.nutritionistId as any).name,
                    email: (patient.nutritionistId as any).email,
                    crn: (patient.nutritionistId as any).crn
                } : null
            }
        });
        
    } catch (error) {
        console.error('Erro ao buscar perfil do paciente:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

export { router as patientDataRoutes };