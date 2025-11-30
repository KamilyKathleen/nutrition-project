// Script para identificar se o plano alimentar informado está associado a múltiplos pacientes
// Uso: node checkDietPlan.js

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nutrition';
const DIETPLAN_ID = '8153d875c3082381c0bb409722c0246e:d9e6c3350c76e90b930d07411672ed7d17ef5b33fd7544108a7157edfadc6c27ea51d976e2214b9f8866b2d76f112217cfd2fdaf392d7404aa774bed0f22adb2';

const DietPlanSchema = new mongoose.Schema({}, { strict: false, collection: 'dietplans' });
const DietPlan = mongoose.model('DietPlan', DietPlanSchema);

async function main() {
  await mongoose.connect(MONGO_URI);
  const all = await DietPlan.find({});
  let found = [];
  for (const plan of all) {
    const key = `${plan._id}:${plan.patientId}`;
    if (key === DIETPLAN_ID) {
      found.push({ _id: plan._id, patientId: plan.patientId });
    }
  }
  if (found.length === 0) {
    console.log('Nenhum plano encontrado com esse ID composto.');
  } else {
    console.log('Planos encontrados:');
    found.forEach(p => console.log(`Plano: ${p._id} | Paciente: ${p.patientId}`));
  }
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
