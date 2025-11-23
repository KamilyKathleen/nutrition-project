import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

/**
 * 🔥 FIREBASE CONFIGURATION
 * =========================
 * Configuração do Firebase para autenticação e banco
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Inicializar Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Configurar provider do Google
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * 🔐 AUTHENTICATION SERVICES
 * ==========================
 */

export class FirebaseAuthService {
  
  /**
   * 🟢 Login com Google
   */
  static async loginWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      await this.createUserProfile(user);
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          photo: user.photoURL
        }
      };
    } catch (error_: unknown) {
      console.error('Erro no login Google:', error_);
      return {
        success: false,
        error: (error_ as any)?.message || 'Erro desconhecido'
      };
    }
  }

  /**
   * 📧 Login com email/senha
   */
  static async loginWithEmail(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        user: {
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName
        }
      };
    } catch (error_: unknown) {
      console.error('Erro no login email:', error_);
      return {
        success: false,
        error: this.getErrorMessage((error_ as any)?.code)
      };
    }
  }


  static async registerWithEmail(email: string, password: string, name: string, role = 'patient') {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Atualizar perfil com nome
      await updateProfile(result.user, {
        displayName: name
      });

      // Criar documento do usuário
      await this.createUserProfile(result.user, { role, name });

      return {
        success: true,
        user: {
          uid: result.user.uid,
          email: result.user.email,
          name: name
        }
      };
    } catch (error_: unknown) {
      console.error('Erro no registro:', error_);
      return {
        success: false,
        error: this.getErrorMessage((error_ as any)?.code)
      };
    }
  }

  /**
   * 🔄 Recuperar senha
   */
  static async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: 'Email de recuperação enviado com sucesso!'
      };
    } catch (error_: unknown) {
      console.error('Erro ao recuperar senha:', error_);
      return {
        success: false,
        error: this.getErrorMessage((error_ as any)?.code)
      };
    }
  }

  /**
   * 🚪 Logout
   */
  static async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error_: unknown) {
      console.error('Erro no logout:', error_);
      return {
        success: false,
        error: (error_ as any)?.message || 'Erro desconhecido'
      };
    }
  }

  /**
   * 👤 Criar perfil do usuário
   */
  static async createUserProfile(user: any, additionalData: any = {}) {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        const userData = {
          uid: user.uid,
          email: user.email,
          name: user.displayName || additionalData?.name,
          role: additionalData?.role || 'patient',
          photo: user.photoURL || null,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        };

        await setDoc(userRef, userData);
        return userData;
      }

      return userSnapshot.data();
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      throw error;
    }
  }

  /**
   * 📖 Buscar perfil do usuário
   */
  static async getUserProfile(uid: string) {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnapshot = await getDoc(userRef);
      
      if (userSnapshot.exists()) {
        return {
          success: true,
          user: userSnapshot.data()
        };
      }
      
      return {
        success: false,
        error: 'Usuário não encontrado'
      };
    } catch (error_: unknown) {
      console.error('Erro ao buscar perfil:', error_);
      return {
        success: false,
        error: (error_ as any)?.message || 'Erro desconhecido'
      };
    }
  }

  /**
   * 🔧 Traduzir erros do Firebase
   */
  static getErrorMessage(errorCode: string) {
    const errorMessages = {
      'auth/user-not-found': 'Usuário não encontrado',
      'auth/wrong-password': 'Senha incorreta',
      'auth/email-already-in-use': 'Email já está em uso',
      'auth/weak-password': 'Senha muito fraca',
      'auth/invalid-email': 'Email inválido',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
      'auth/user-disabled': 'Usuário desabilitado',
      'auth/requires-recent-login': 'Requer login recente'
    };

    return (errorMessages as any)[errorCode] || 'Erro desconhecido';
  }
}

export default FirebaseAuthService;