import { Router } from 'express';
import { UserModel } from '../models/User';

const router = Router();

// Endpoint temporário para debug
router.get('/debug/users', async (req, res) => {
  try {
    const users = await UserModel.find({}).limit(10);
    const emails = users.map(user => user.email);
    
    res.json({
      totalUsers: await UserModel.countDocuments(),
      emails: emails,
      users: users.map(user => ({
        id: user._id,
        email: user.email,
        name: user.name
      }))
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/debug/check/:email', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    const user = await UserModel.findOne({ email });
    
    res.json({
      email: email,
      exists: !!user,
      user: user ? { id: user._id, email: user.email, name: user.name } : null
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para limpar todos os usuários (CUIDADO: só usar em desenvolvimento!)
router.delete('/debug/clear-users', async (req, res) => {
  try {
    console.log('🧹 Limpando todos os usuários (MongoDB + Firebase)...');
    
    const { UserService } = await import('../services/UserService');
    const userService = new UserService();
    
    await userService.deleteAll();
    
    res.json({
      success: true,
      message: 'Todos os usuários foram removidos do MongoDB e Firebase'
    });
    
    console.log(`✅ Usuários removidos do MongoDB e Firebase`);
  } catch (error: any) {
    console.error('❌ Erro ao limpar usuários:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Endpoint para limpar convites (CUIDADO: só usar em desenvolvimento!)
router.delete('/debug/clear-invites', async (req, res) => {
  try {
    console.log('🧹 Limpando todos os convites...');
    
    const { PatientInviteModel } = await import('../models/PatientInvite');
    const deleteResult = await PatientInviteModel.deleteMany({});
    
    res.json({
      success: true,
      message: 'Todos os convites foram removidos',
      deletedCount: deleteResult.deletedCount
    });
    
    console.log(`✅ ${deleteResult.deletedCount} convites removidos do MongoDB`);
  } catch (error: any) {
    console.error('❌ Erro ao limpar convites:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Endpoint para ver todos os pacientes
router.get('/debug/patients', async (req, res) => {
  try {
    const { PatientModel } = await import('../models/Patient');
    const patients = await PatientModel.find({})
      .populate('nutritionistId', 'name email')
      .limit(20);
    
    res.json({
      success: true,
      totalPatients: await PatientModel.countDocuments(),
      patients: patients.map(patient => ({
        id: patient._id,
        name: patient.name,
        email: patient.email,
        nutritionist: patient.nutritionistId ? {
          id: (patient.nutritionistId as any)._id,
          name: (patient.nutritionistId as any).name,
          email: (patient.nutritionistId as any).email
        } : null,
        createdAt: patient.createdAt
      }))
    });
  } catch (error: any) {
    console.error('❌ Erro ao listar pacientes:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Endpoint para ver todos os convites
router.get('/debug/invites', async (req, res) => {
  try {
    const { PatientInviteModel } = await import('../models/PatientInvite');
    const invites = await PatientInviteModel.find({})
      .populate('nutritionistId', 'name email')
      .limit(20);
    
    res.json({
      success: true,
      totalInvites: await PatientInviteModel.countDocuments(),
      invites: invites.map(invite => ({
        id: invite._id,
        patientEmail: invite.patientEmail,
        patientName: invite.patientName,
        status: (invite as any).status,
        nutritionist: invite.nutritionistId ? {
          id: (invite.nutritionistId as any)._id,
          name: (invite.nutritionistId as any).name,
          email: (invite.nutritionistId as any).email
        } : null,
        createdAt: invite.createdAt,
        acceptedAt: invite.acceptedAt
      }))
    });
  } catch (error: any) {
    console.error('❌ Erro ao listar convites:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Endpoint para debug de busca por email específico
router.get('/debug/patient-email/:email', async (req, res) => {
  try {
    const { PatientModel } = await import('../models/Patient');
    const email = req.params.email;
    
    // Buscar exato
    const patientExact = await PatientModel.findOne({ email: email });
    // Buscar lowercase
    const patientLower = await PatientModel.findOne({ email: email.toLowerCase() });
    // Buscar todos com esse email (regex)
    const patientsRegex = await PatientModel.find({ email: { $regex: email, $options: 'i' } });
    
    res.json({
      success: true,
      searchEmail: email,
      exact: patientExact ? {
        id: patientExact._id,
        name: patientExact.name,
        email: patientExact.email,
        nutritionistId: patientExact.nutritionistId
      } : null,
      lowercase: patientLower ? {
        id: patientLower._id,
        name: patientLower.name,
        email: patientLower.email,
        nutritionistId: patientLower.nutritionistId
      } : null,
      allMatches: patientsRegex.map(p => ({
        id: p._id,
        name: p.name,
        email: p.email,
        nutritionistId: p.nutritionistId
      }))
    });
  } catch (error: any) {
    console.error('❌ Erro ao buscar paciente por email:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Endpoint para verificar status do Firebase
router.get('/debug/firebase-status', async (req, res) => {
  try {
    const { adminAuth } = await import('../lib/firebase-admin');
    
    // Verificar variáveis de ambiente
    const firebaseEnvVars = {
      FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
      FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
      FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY_ID: !!process.env.FIREBASE_PRIVATE_KEY_ID,
      FIREBASE_CLIENT_ID: !!process.env.FIREBASE_CLIENT_ID
    };

    let firebaseTestResult = null;
    
    if (adminAuth) {
      try {
        // Testar listando usuários (apenas os primeiros 5)
        const listUsersResult = await adminAuth.listUsers(5);
        firebaseTestResult = {
          success: true,
          totalUsers: listUsersResult.users.length,
          users: listUsersResult.users.map(u => ({
            uid: u.uid,
            email: u.email,
            displayName: u.displayName,
            emailVerified: u.emailVerified,
            disabled: u.disabled
          }))
        };
      } catch (testError: any) {
        firebaseTestResult = {
          success: false,
          error: testError.message
        };
      }
    }

    res.json({
      success: true,
      firebase: {
        adminAuthAvailable: !!adminAuth,
        environmentVariables: firebaseEnvVars,
        testResult: firebaseTestResult
      }
    });
  } catch (error: any) {
    console.error('❌ Erro ao verificar Firebase status:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Endpoint para debugar planos dietéticos
router.get('/diet-plans-debug', async (req, res) => {
  try {
    const { DietPlanModel } = await import('../models/DietPlan');
    
    console.log('🔍 DietPlanModel collection name:', DietPlanModel.collection.name);
    console.log('🔍 Testing connection...');
    
    // Teste 1: Count
    const totalPlans = await DietPlanModel.countDocuments({});
    console.log('🔍 Total count:', totalPlans);
    
    // Teste 2: Find simples
    const plans = await DietPlanModel.find({}).lean();
    console.log('🔍 Find result:', plans.length);
    console.log('🔍 First plan:', plans[0]);
    
    // Teste 3: Aggregate
    const aggResult = await DietPlanModel.aggregate([{ $match: {} }, { $limit: 5 }]);
    console.log('🔍 Aggregate result:', aggResult.length);
    
    res.json({
      success: true,
      totalPlans,
      findCount: plans.length,
      aggregateCount: aggResult.length,
      plans: plans.slice(0, 2),
      aggregate: aggResult.slice(0, 2)
    });
  } catch (error: any) {
    console.error('❌ Debug error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Endpoint para debugar pacientes
router.get('/patients-debug', async (req, res) => {
  try {
    const { PatientModel } = await import('../models/Patient');
    
    console.log('🔍 PatientModel collection name:', PatientModel.collection.name);
    
    // Contar pacientes
    const totalPatients = await PatientModel.countDocuments({});
    console.log('🔍 Total patients:', totalPatients);
    
    // Buscar todos os pacientes
    const patients = await PatientModel.find({}).lean();
    console.log('🔍 Patients found:', patients.length);
    
    // Buscar Carlos especificamente
    const carlosPatient = await PatientModel.findOne({ email: 'carlos.novo@gmail.com' });
    console.log('🔍 Carlos as patient:', carlosPatient);
    
    res.json({
      success: true,
      totalPatients,
      patients: patients.map(p => ({
        id: p._id,
        name: p.name,
        email: p.email,
        nutritionistId: p.nutritionistId
      })),
      carlosPatient
    });
  } catch (error: any) {
    console.error('❌ Debug error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Testar findByEmail do PatientService
router.get('/test-find-email/:email', async (req, res) => {
  try {
    const { PatientService } = await import('../services/PatientService');
    const patientService = new PatientService();
    const result = await patientService.findByEmail(req.params.email);
    
    res.json({
      success: true,
      email: req.params.email,
      found: !!result,
      patient: result
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

export { router as debugRoutes };