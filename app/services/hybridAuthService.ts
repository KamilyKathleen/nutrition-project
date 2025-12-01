import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { apiClient } from './api';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'patient' | 'nutritionist';
  crn?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    token: string;
  };
}

/**
 * 🔥🎫 HYBRID AUTH SERVICE
 * =======================
 * Integra Firebase Authentication com JWT customizado
 * 
 * Fluxo:
 * 1. Firebase faz autenticação (email/senha, recuperação, etc.)
 * 2. Backend valida token Firebase
 * 3. Backend gera JWT customizado
 * 4. Frontend usa JWT para API calls
 */
export class HybridAuthService {
  private readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const firebaseCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );

      const firebaseToken = await firebaseCredential.user.getIdToken();
      
      const response = await fetch(`${this.API_BASE_URL}/auth/hybrid/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseToken,
          userData: {
            name: userData.name,
            role: userData.role,
            crn: userData.crn
          }
        })
      });

      if (!response.ok) {
        await firebaseCredential.user.delete();
        const error = await response.json();
        throw new Error(error.message || 'Erro no registro');
      }

      const result = await response.json();
      
      return result;

    } catch (error: any) {
      console.error('Erro no registro híbrido:', error);
      throw new Error(error.message || 'Erro no registro');
    }
  }

  async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      // 1. Fazer login no Firebase
      const firebaseCredential = await signInWithEmailAndPassword(
        auth,
        loginData.email,
        loginData.password
      );

      // 2. Obter token do Firebase
      const firebaseToken = await firebaseCredential.user.getIdToken();

      // 3. Trocar por JWT customizado no backend
      const response = await fetch(`${this.API_BASE_URL}/auth/hybrid/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseToken
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro no login');
      }

      const result = await response.json();
      
      return result;

    } catch (error: any) {
      console.error('Erro no login híbrido:', error);
      throw new Error(error.message || 'Erro no login');
    }
  }

  async logout(): Promise<void> {
    try {
      // Fazer logout do Firebase
      await signOut(auth);
      
      // Limpar dados locais
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
    } catch (error: any) {
      console.error('Erro no logout:', error);
      throw new Error('Erro no logout');
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Erro na recuperação de senha:', error);
      throw new Error('Erro ao enviar email de recuperação');
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;

      // Obter token atualizado do Firebase
      const firebaseToken = await currentUser.getIdToken(true);

      // Trocar por JWT customizado
      const response = await fetch(`${this.API_BASE_URL}/auth/hybrid/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseToken
        })
      });

      if (!response.ok) return null;

      const result = await response.json();
      return result.data.token;

    } catch (error) {
      console.error('Erro ao renovar token:', error);
      return null;
    }
  }

  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }
}