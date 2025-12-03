// Script para listar todos os pacientes e seus planos alimentares, destacando a paciente Ana Maria de Souza Costa
// Uso: node listPatientsAndPlans.js

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nutrition';

const PatientSchema = new mongoose.Schema({}, { strict: false, collection: 'patients' });
const DietPlanSchema = new mongoose.Schema({}, { strict: false, collection: 'dietplans' });
const Patient = mongoose.model('Patient', PatientSchema);
const DietPlan = mongoose.model('DietPlan', DietPlanSchema);

async function main() {
  await mongoose.connect(MONGO_URI);
  const patients = await Patient.find({});
  const plans = await DietPlan.find({});

  for (const patient of patients) {
    const patientPlans = plans.filter(p => String(p.patientId) === String(patient._id));
    const isAna = patient.name && patient.name.toLowerCase().includes('ana maria de souza costa');
    console.log(`Paciente: ${patient.name} (${patient._id})${isAna ? ' <-- ANA MARIA DE SOUZA COSTA' : ''}`);
    if (patientPlans.length === 0) {
      console.log('  Nenhum plano alimentar.');
    } else {
      patientPlans.forEach(plan => {
        console.log(`  Plano: ${plan._id} | Ativo: ${plan.isActive ? 'Sim' : 'Não'} | Título: ${plan.title || plan.name}`);
      });
    }
    console.log('---');
  }
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
