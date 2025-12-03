import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthService } from '../services/AuthService';
import { UserService } from '../services/UserService';
import { config } from '../config/environment';
import { AppError, asyncHandler } from '../middlewares/errorHandler';
import { ApiResponse, LoginRequest, CreateUserRequest, JwtPayload } from '../types';

export class AuthController {
  private readonly authService: AuthService;
  private readonly userService: UserService;

  constructor() {
    this.authService = new AuthService();
    this.userService = new UserService();
  }

  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userData: CreateUserRequest = req.body;

    // Verificar se usuário já existe
    const existingUser = await this.userService.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError('Email já cadastrado', 400);
    }

    // 🔥 TENTAR CRIAR NO FIREBASE + MONGODB
    let user: any;
    
    try {
      // Importar Firebase Admin dinamicamente
      const { adminAuth } = await import('../lib/firebase-admin');
      
      console.log(`🔍 Debug: adminAuth disponível: ${!!adminAuth}`);
      
      if (adminAuth) {
        console.log(`🔥 Firebase configurado - tentando criar usuário: ${userData.email}`);
        
        // 1. Validar senha antes de tentar criar no Firebase
        const passwordValidation = this.validateFirebasePassword(userData.password);
        if (!passwordValidation.isValid) {
          throw new AppError(`Senha não atende aos requisitos: ${passwordValidation.errors.join(', ')}`, 400);
        }

        // 2. Criar no Firebase
        console.log('� Criando usuário no Firebase...');
        const firebaseUser = await adminAuth.createUser({
          email: userData.email,
          password: userData.password,
          displayName: userData.name,
          emailVerified: false
        });
        
        console.log(`✅ Usuário criado no Firebase com sucesso: ${firebaseUser.uid}`);

        // 2. Criar no MongoDB com Firebase UID
        console.log('📝 Criando usuário no MongoDB com Firebase UID...');
        user = await this.userService.createFirebaseUser({
          name: userData.name,
          email: userData.email,
          password: userData.password, // 🔥 Passar senha real para login local também
          role: userData.role,
          firebaseUid: firebaseUser.uid,
          emailVerified: false
        });
        
        console.log(`✅ Usuário vinculado no MongoDB com Firebase UID: ${firebaseUser.uid}`);
      } else {
        console.log('⚠️ Firebase adminAuth não disponível - criando apenas no MongoDB');
        // Fallback: Criar apenas no MongoDB (modo atual)
        user = await this.userService.create(userData);
      }
    } catch (firebaseError: any) {
      console.log(`❌ Erro no Firebase (${firebaseError.code}): ${firebaseError.message}`);
      console.log('🔄 Fazendo fallback para criação apenas no MongoDB...');
      // Fallback: Criar apenas no MongoDB se Firebase falhar
      user = await this.userService.create(userData);
    }

    // Gerar token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    const response: ApiResponse = {
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    };

    res.status(201).json(response);
  });

  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password }: LoginRequest = req.body;

    // Buscar usuário
    const user = await this.userService.findByEmail(email);
    if (!user) {
      console.log(`🔍 Login: Usuário não encontrado para email: ${email}`);
      throw new AppError('Credenciais inválidas', 401);
    }

    console.log(`🔍 Login: Usuário encontrado: ${user.name} (${user.email})`);
    console.log(`🔍 Login: Senha hash: ${user.password ? user.password.substring(0, 10) + '...' : 'undefined'}`);
    console.log(`🔍 Login: Senha informada: ${password}`);
    console.log(`🔍 Login: Tipo da senha hash: ${typeof user.password}`);

    // Verificar senha
    const isPasswordValid = await this.authService.comparePassword(password, user.password);
    console.log(`🔍 Login: Senha válida: ${isPasswordValid}`);
    
    if (!isPasswordValid) {
      throw new AppError('Credenciais inválidas', 401);
    }

    // Verificar se usuário está ativo
    if (!user.isActive) {
      throw new AppError('Conta desativada', 401);
    }

    // Atualizar último login
    await this.userService.updateLastLogin(user.id);

    // Gerar token
    const token = this.generateToken({
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
        token
      }
    };

    res.json(response);
  });

  logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Em um sistema com blacklist de tokens, adicionaríamos o token aqui
    const response: ApiResponse = {
      success: true,
      message: 'Logout realizado com sucesso'
    };

    res.json(response);
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Gerar token de reset
    const resetToken = await this.authService.generatePasswordResetToken(user.id);

    // Enviar email (implementar serviço de email)
    // await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    const response: ApiResponse = {
      success: true,
      message: 'Email de recuperação enviado',
      data: { resetToken } // Remove em produção
    };

    res.json(response);
  });

  resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { token, newPassword } = req.body;

    // Verificar token
    const userId = await this.authService.verifyPasswordResetToken(token);
    
    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Atualizar senha
    await this.userService.updatePassword(userId, hashedPassword);

    const response: ApiResponse = {
      success: true,
      message: 'Senha alterada com sucesso'
    };

    res.json(response);
  });

  // @ts-ignore - JWT library type conflict
  private generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
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
   * 🔒 VALIDAR SENHA CONFORME REQUISITOS DO FIREBASE
   * Firebase exige: 6-12 caracteres + maiúscula + minúscula + número + caractere especial
   * 
   * @param password - Senha a ser validada
   * @returns Objeto com resultado da validação e lista de erros
   */
  private validateFirebasePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Verificar tamanho mínimo e máximo (Firebase limitation!)
    if (password.length < 6) {
      errors.push('A senha deve ter pelo menos 6 caracteres');
    }
    if (password.length > 12) {
      errors.push('A senha deve ter no máximo 12 caracteres (limitação do Firebase)');
    }

    // Verificar letra maiúscula
    if (!/[A-Z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra maiúscula');
    }

    // Verificar letra minúscula
    if (!/[a-z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra minúscula');
    }

    // Verificar número
    if (!/\d/.test(password)) {
      errors.push('A senha deve conter pelo menos um número');
    }

    // Verificar caractere especial
    if (!/[!@#$%^&*(),.?":{}|<>\-_=+[\]\\;'/`~]/.test(password)) {
      errors.push('A senha deve conter pelo menos um caractere especial (!@#$%^&*(),.?":{}|<>-_=+[]\\/;\'\`~)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}