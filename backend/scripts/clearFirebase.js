// Usar o Firebase Admin já configurado
const { adminAuth } = require('../src/lib/firebase-admin.ts');

async function clearAllFirebaseUsers() {
  try {
    console.log('🔥 Iniciando limpeza do Firebase...');
    
    if (!adminAuth) {
      console.log('⚠️  Firebase Admin não configurado - pulando limpeza');
      return;
    }
    
    // Listar todos os usuários
    const listUsers = await adminAuth.listUsers();
    console.log(`📊 Encontrados ${listUsers.users.length} usuários no Firebase`);
    
    if (listUsers.users.length === 0) {
      console.log('✅ Firebase já está limpo');
      return;
    }
    
    // Deletar todos os usuários
    for (const user of listUsers.users) {
      try {
        await adminAuth.deleteUser(user.uid);
        console.log(`🗑️  Usuário deletado: ${user.email} (${user.uid})`);
      } catch (error) {
        console.error(`❌ Erro ao deletar usuário ${user.email}:`, error.message);
      }
    }
    
    console.log('✅ Limpeza do Firebase concluída!');
    
  } catch (error) {
    console.error('❌ Erro na limpeza do Firebase:', error.message);
  } finally {
    process.exit(0);
  }
}

clearAllFirebaseUsers();