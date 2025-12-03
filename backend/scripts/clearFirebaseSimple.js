const admin = require('firebase-admin');

// Configurar Firebase Admin apenas se as variáveis de ambiente existirem
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
  };

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
}

async function clearAllFirebaseUsers() {
  try {
    console.log('🔥 Iniciando limpeza do Firebase...');
    
    if (!admin.apps.length) {
      console.log('⚠️  Firebase Admin não configurado - pulando limpeza');
      return;
    }
    
    const auth = admin.auth();
    
    // Listar todos os usuários
    const listUsers = await auth.listUsers();
    console.log(`📊 Encontrados ${listUsers.users.length} usuários no Firebase`);
    
    if (listUsers.users.length === 0) {
      console.log('✅ Firebase já está limpo');
      return;
    }
    
    // Deletar todos os usuários
    for (const user of listUsers.users) {
      try {
        await auth.deleteUser(user.uid);
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