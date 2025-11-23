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

    // Hash da senha
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Criar usuário
    const user = await this.userService.create({
      ...userData,
      password: hashedPassword
    });

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
      throw new AppError('Credenciais inválidas', 401);
    }

    // Verificar senha
    const isPasswordValid = await this.authService.comparePassword(password, user.password);
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
}