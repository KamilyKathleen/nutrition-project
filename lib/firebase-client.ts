import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';

/**
 * 🔥 FIREBASE CLIENT CONFIGURATION
 * ================================
 * Configuração do Firebase para frontend/cliente
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAntjb33qcT3npeTn0nytftfJhv5ONbyQs",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "nutriplan-cce27.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "nutriplan-cce27",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "nutriplan-cce27.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "80744976918",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:80744976918:web:cf5aa2f33d1492a7491b37"
};

// Inicializar Firebase apenas uma vez
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Configurar providers
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

/**
 * 🔐 AUTHENTICATION SERVICES
 * ==========================
 */

export class FirebaseClientAuth {
  
  /**
   * Login com Google
   */
  static async loginWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      
      return {
        success: true,
        user: result.user,
        token,
        isNewUser: result.providerId === 'firebase'
      };
    } catch (error: any) {
      console.error('Erro no login Google:', error);
      return {
        success: false,
        error: error.message || 'Erro no login com Google'
      };
    }
  }

  /**
   * Login com email e senha
   */
  static async loginWithEmail(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const token = await result.user.getIdToken();
      
      return {
        success: true,
        user: result.user,
        token
      };
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      let errorMessage = 'Erro no login';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuário não encontrado';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Senha incorreta';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Registrar com email e senha
   */
  static async registerWithEmail(email: string, password: string, displayName?: string) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Atualizar nome se fornecido
      if (displayName && result.user) {
        await (result.user as any).updateProfile({ displayName });
      }
      
      const token = await result.user.getIdToken();
      
      return {
        success: true,
        user: result.user,
        token
      };
    } catch (error: any) {
      console.error('Erro no registro:', error);
      
      let errorMessage = 'Erro no registro';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está em uso';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Recuperar senha
   */
  static async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: 'Email de recuperação enviado'
      };
    } catch (error: any) {
      console.error('Erro ao enviar email de recuperação:', error);
      
      let errorMessage = 'Erro ao enviar email de recuperação';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuário não encontrado';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Logout
   */
  static async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      console.error('Erro no logout:', error);
      return {
        success: false,
        error: 'Erro ao fazer logout'
      };
    }
  }

  /**
   * Obter token atual
   */
  static async getCurrentToken(): Promise<string | null> {
    try {
      const user = auth.currentUser;
      if (!user) return null;
      
      return await user.getIdToken();
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  }

  /**
   * Obter usuário atual
   */
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Escutar mudanças de autenticação
   */
  static onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
}

/**
 * 🔧 HELPER FUNCTIONS
 * ===================
 */

/**
 * Verificar se usuário está logado
 */
export function isAuthenticated(): boolean {
  return !!auth.currentUser;
}

/**
 * Aguardar carregamento da autenticação
 */
export function waitForAuth(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export { auth };
export default FirebaseClientAuth;