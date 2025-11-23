// FirebaseAuthController.ts
import { Request, Response } from 'express';
import { adminAuth } from '../lib/firebase-admin';
import { UserService } from '../services/UserService';
import { AppError, asyncHandler } from '../middlewares/errorHandler';
import { ApiResponse } from '../types';

export class FirebaseAuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  loginWithFirebase = asyncHandler(async (req: Request, res: Response) => {
    const { name, email } = req.body;
    const authHeader = req.headers.authorization;

    // Verificar se Firebase Admin está configurado
    if (!adminAuth) {
      throw new AppError('Firebase Admin SDK não configurado. Configure as variáveis de ambiente.', 500);
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token Firebase obrigatório', 401);
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new AppError('Token não fornecido', 401);
    }
    
    const decodedToken = await adminAuth!.verifyIdToken(token);
    const { uid: firebaseUid, email: firebaseEmail, email_verified } = decodedToken;

    if (!firebaseEmail) {
      throw new AppError('Email é obrigatório no token Firebase', 400);
    }

    let user = await this.userService.findByFirebaseUid(firebaseUid);

    if (!user) {
      const existingUser = await this.userService.findByEmail(firebaseEmail);
      
      if (existingUser) {
        const linkedUser = await this.userService.linkFirebaseUid(existingUser.id, firebaseUid);
        user = { ...linkedUser, password: 'firebase_auth' };
      } else {
        const newUser = await this.userService.createFirebaseUser({
          name: name || firebaseEmail.split('@')[0],
          email: firebaseEmail,
          firebaseUid,
          emailVerified: email_verified || false
        });
        user = { ...newUser, password: 'firebase_auth' };
      }
    }

    if (!user) {
      throw new AppError('Erro ao criar ou encontrar usuário', 500);
    }

    const response: ApiResponse<{ user: any; token: string }> = {
      success: true,
      message: 'Login Firebase realizado com sucesso',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          firebaseUid: user.firebaseUid,
          emailVerified: user.emailVerified,
          isActive: user.isActive,
          createdAt: user.createdAt
        },
        token
      }
    };

    res.status(200).json(response);
  });

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;

    // Verificar se Firebase Admin está configurado
    if (!adminAuth) {
      throw new AppError('Firebase Admin SDK não configurado. Configure as variáveis de ambiente.', 500);
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token Firebase obrigatório', 401);
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new AppError('Token não fornecido', 401);
    }
    
    const decodedToken = await adminAuth!.verifyIdToken(token);
    const user = await this.userService.findByFirebaseUid(decodedToken.uid);

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const response: ApiResponse<{ user: any }> = {
      success: true,
      message: 'Perfil obtido com sucesso',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          firebaseUid: user.firebaseUid,
          emailVerified: user.emailVerified,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    };

    res.status(200).json(response);
  });
}