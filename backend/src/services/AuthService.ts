import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';

interface PasswordResetToken {
  userId: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
  usedAt?: Date;
}

// In-memory store for password reset tokens (em produção usar Redis)
const passwordResetTokens = new Map<string, PasswordResetToken>();

export class AuthService {
  async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async generatePasswordResetToken(userId: string): Promise<string> {
    const token = jwt.sign(
      { userId, type: 'password_reset' },
      config.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Salvar token (em produção, usar banco de dados ou Redis)
    passwordResetTokens.set(userId, {
      userId,
      token,
      expiresAt: new Date(Date.now() + 3600000), // 1 hora
      used: false,
      createdAt: new Date()
    });

    return token;
  }

  async verifyPasswordResetToken(token: string): Promise<string> {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as any;
      
      if (decoded.type !== 'password_reset') {
        throw new Error('Token inválido');
      }

      // Verificar se token não foi usado
      const tokenData = passwordResetTokens.get(decoded.userId);
      
      if (!tokenData) {
        throw new Error('Token não encontrado');
      }

      if (tokenData.used || tokenData.token !== token) {
        throw new Error('Token já utilizado ou inválido');
      }

      if (tokenData.expiresAt < new Date()) {
        throw new Error('Token expirado');
      }

      // Marcar token como usado
      tokenData.used = true;
      tokenData.usedAt = new Date();
      passwordResetTokens.set(decoded.userId, tokenData);

      return decoded.userId;
    } catch (error) {
      throw new Error('Token de reset inválido ou expirado');
    }
  }

  async invalidatePasswordResetTokens(userId: string): Promise<void> {
    passwordResetTokens.delete(userId);
  }
}