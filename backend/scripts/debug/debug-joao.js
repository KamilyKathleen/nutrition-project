const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function testJoaoLogin() {
  try {
    // Conectar ao banco
    await mongoose.connect('mongodb://localhost:27017/nutrition_test');
    console.log('🔌 Conectado ao MongoDB');
    
    // Importar model
    const { UserModel } = require('./src/models/User');
    
    // Buscar João
    const user = await UserModel.findOne({ email: 'paciente.joao@test.com' }).lean();
    
    if (!user) {
      console.log('❌ João não encontrado');
      return;
    }
    
    console.log('👤 Usuário encontrado:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password,
      passwordStart: user.password ? user.password.substring(0, 15) + '...' : 'undefined'
    });
    
    // Testar comparação de senha
    const testPassword = 'Joao123!';
    console.log(`🔑 Testando senha: ${testPassword}`);
    
    const isValid = await bcrypt.compare(testPassword, user.password);
    console.log(`✅ Senha válida: ${isValid}`);
    
    // Testar hash da senha
    const newHash = await bcrypt.hash(testPassword, 12);
    console.log(`🔒 Novo hash: ${newHash.substring(0, 15)}...`);
    
    const testNewHash = await bcrypt.compare(testPassword, newHash);
    console.log(`✅ Novo hash válido: ${testNewHash}`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testJoaoLogin();