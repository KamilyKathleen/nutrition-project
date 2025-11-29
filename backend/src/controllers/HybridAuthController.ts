import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppError, asyncHandler } from '../middlewares/errorHandler';
import { UserService } from '../services/UserService';
import { adminAuth } from '../lib/firebase-admin';
import { config } from '../config/environment';

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * 🔥🎫 HYBRID AUTH CONTROLLER
 * ===========================
 * Firebase Authentication + JWT Authorization
 * 
 * Fluxo:
 * 1. Frontend faz login via Firebase
 * 2. Backend valida token Firebase
 * 3. Backend gera JWT customizado com dados do MongoDB
 * 4. Frontend usa JWT customizado nas próximas requisições
 */
export class HybridAuthController {
  private userService = new UserService();

  /**
   * 🔥 STEP 1: REGISTER WITH FIREBASE
   * ================================
   * Registra usuário no Firebase + MongoDB
   */
  registerWithFirebase = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { firebaseToken, userData } = req.body;

    try {
      // 1. Validar token Firebase
      if (!adminAuth) {
        throw new AppError('Firebase não configurado', 500);
      }
      const decodedFirebaseToken = await adminAuth.verifyIdToken(firebaseToken);
      
      if (!decodedFirebaseToken.email) {
        throw new AppError('Email não encontrado no token Firebase', 400);
      }

      // 2. Verificar se usuário já existe no MongoDB
      const existingUser = await this.userService.findByEmail(decodedFirebaseToken.email);
      if (existingUser) {
        throw new AppError('Usuário já cadastrado', 400);
      }

      // 3. Criar usuário no MongoDB (sem senha - Firebase cuida da autenticação)
      const user = await this.userService.createFirebaseUser({
        name: userData.name || decodedFirebaseToken.name || 'Usuário',
        email: decodedFirebaseToken.email,
        role: userData.role || 'patient',
        firebaseUid: decodedFirebaseToken.uid
      });

      // 4. Gerar JWT customizado
      const customJWT = this.generateCustomJWT({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      const response: ApiResponse = {
        success: true,
        message: 'Usuário registrado com sucesso',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          token: customJWT
        }
      };

      res.status(201).json(response);

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Erro no registro Firebase:', error);
      throw new AppError('Erro interno do servidor', 500);
    }
  });

  /**
   * 🔥 STEP 2: LOGIN WITH FIREBASE
   * ==============================
   * Login via Firebase + geração de JWT customizado
   */
  loginWithFirebase = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { firebaseToken } = req.body;

    try {
      // 1. Validar token Firebase
      if (!adminAuth) {
        throw new AppError('Firebase não configurado', 500);
      }
      const decodedFirebaseToken = await adminAuth.verifyIdToken(firebaseToken);
      
      if (!decodedFirebaseToken.email) {
        throw new AppError('Email não encontrado no token Firebase', 400);
      }

      // 2. Buscar usuário no MongoDB
      const user = await this.userService.findByEmail(decodedFirebaseToken.email);
      if (!user) {
        throw new AppError('Usuário não encontrado. Faça o registro primeiro.', 404);
      }

      // 3. Atualizar firebaseUid se necessário (implementar se needed)
      // TODO: Implementar updateFirebaseUid no UserService se necessário

      // 4. Gerar JWT customizado
      const customJWT = this.generateCustomJWT({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      const response: ApiResponse = {
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          token: customJWT
        }
      };

      res.json(response);

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Erro no login Firebase:', error);
      throw new AppError('Erro interno do servidor', 500);
    }
  });

  /**
   * 🎫 JWT GENERATION
   * =================
   * Gera JWT customizado com dados do MongoDB
   */
  private generateCustomJWT(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    const secret = config.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET não configurado');
    }
    
    // @ts-ignore - JWT library type conflict
    return jwt.sign(
      payload,
      secret,
      { expiresIn: config.JWT_EXPIRES_IN }
    );
  }

  /**
   * 🔄 REFRESH TOKEN
   * ================
   * Renova JWT usando token Firebase (para sessões longas)
   */
  refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { firebaseToken } = req.body;

    try {
      // Validar token Firebase
      if (!adminAuth) {
        throw new AppError('Firebase não configurado', 500);
      }
      const decodedFirebaseToken = await adminAuth.verifyIdToken(firebaseToken);
      
      // Buscar usuário no MongoDB
      const user = await this.userService.findByEmail(decodedFirebaseToken.email!);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      // Gerar novo JWT customizado
      const customJWT = this.generateCustomJWT({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      const response: ApiResponse = {
        success: true,
        message: 'Token renovado com sucesso',
        data: { token: customJWT }
      };

      res.json(response);

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Erro ao renovar token:', error);
      throw new AppError('Erro interno do servidor', 500);
    }
  });
}