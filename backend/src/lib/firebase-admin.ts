import admin from 'firebase-admin';

/**
 * 🔥 FIREBASE ADMIN CONFIGURATION
 * ===============================
 * Configuração do Firebase Admin SDK para backend/servidor
 */

// Verificar se já foi inicializado
if (!admin.apps.length) {
  // 🔧 DESENVOLVIMENTO: Verificar se todas as variáveis estão configuradas
  const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName] || process.env[varName]?.includes('your-') || process.env[varName]?.includes('YOUR-'));

  if (missingVars.length > 0) {
    console.log('⚠️ Firebase Admin SDK não configurado - variáveis de ambiente faltando:', missingVars);
    console.log('🔧 Para produção, configure as variáveis de ambiente do Firebase Service Account');
    // Não inicializar Firebase Admin em desenvolvimento sem configuração
  } else {
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
    };

    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
      });

      console.log('🔥 Firebase Admin (Authentication) inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar Firebase Admin:', error);
    }
  }
}

// Exportar apenas Auth (sem DB/Storage) - Com verificação de segurança
export const adminAuth = admin.apps.length > 0 ? admin.auth() : null;

/**
 * Definir role personalizada para um usuário
 */
export async function setUserRole(uid: string, role: 'patient' | 'nutritionist' | 'admin') {
  if (!adminAuth) {
    throw new Error('Firebase Admin não inicializado');
  }
  
  try {
    await adminAuth.setCustomUserClaims(uid, { role });
    console.log(`✅ Role '${role}' definida para usuário ${uid}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao definir role:', error);
    return { success: false, error };
  }
}

/**
 * Buscar role do usuário
 */
export async function getUserRole(uid: string): Promise<string | null> {
  if (!adminAuth) {
    throw new Error('Firebase Admin não inicializado');
  }
  
  try {
    const user = await adminAuth!.getUser(uid);
    const customClaims = user.customClaims || {};
    return (customClaims.role as string) || null;
  } catch (error) {
    console.error('❌ Erro ao buscar role:', error);
    return null;
  }
}

/**
 * Criar usuário com role específica
 */
export async function createUserWithRole(
  email: string, 
  password: string, 
  displayName: string,
  role: 'patient' | 'nutritionist' | 'admin'
): Promise<{ success: boolean; user?: any; uid?: string; error?: any }> {
  if (!adminAuth) {
    throw new Error('Firebase Admin não inicializado');
  }
  
  try {
    // Criar usuário
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName,
      emailVerified: false
    });

    // Definir role
    await setUserRole(userRecord.uid, role);

    return { 
      success: true, 
      user: userRecord,
      uid: userRecord.uid 
    };
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    return { success: false, error };
  }
}

/**
 * Verificar se usuário existe pelo email
 */
export async function userExistsByEmail(email: string): Promise<boolean> {
  if (!adminAuth) {
    throw new Error('Firebase Admin não inicializado');
  }
  
  try {
    await adminAuth!.getUserByEmail(email);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Deletar usuário
 */
export async function deleteUser(uid: string) {
  if (!adminAuth) {
    throw new Error('Firebase Admin não inicializado');
  }
  
  try {
    await adminAuth.deleteUser(uid);
    console.log(`✅ Usuário ${uid} deletado com sucesso`);
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao deletar usuário:', error);
    return { success: false, error };
  }
}

// admin já está disponível através de firebase-admin package se necessário