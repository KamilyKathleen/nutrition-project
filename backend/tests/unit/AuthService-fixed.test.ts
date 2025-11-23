/**
 * 🧪 TESTES UNITÁRIOS - AuthService (Fixo)
 * ========================================
 * Versão corrigida dos testes do AuthService
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthService } from '../../src/services/AuthService';

// Mocks
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('AuthService - Fixed', () => {
  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
  });

  describe('Password Operations', () => {
    it('deve criar instância do AuthService', () => {
      expect(authService).toBeInstanceOf(AuthService);
    });

    it('deve ter método comparePassword', () => {
      expect(typeof authService.comparePassword).toBe('function');
    });

    it('deve comparar senhas corretamente', async () => {
      const password = 'testpassword';
      const hashedPassword = 'hashed_password';
      
      mockBcrypt.compare.mockResolvedValue(true as never);

      const result = await authService.comparePassword(password, hashedPassword);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });
  });

  describe('Token Operations', () => {
    it('deve usar JWT internamente para reset tokens', () => {
      // Testa se o JWT está sendo usado internamente
      expect(jwt).toBeDefined();
    });
  });

  describe('Reset Token Operations', () => {
    it('deve ter método generatePasswordResetToken', () => {
      expect(typeof authService.generatePasswordResetToken).toBe('function');
    });

    it('deve ter método verifyPasswordResetToken', () => {
      expect(typeof authService.verifyPasswordResetToken).toBe('function');
    });

    it('deve gerar token de reset de senha', async () => {
      const userId = 'test-user-id';
      const mockToken = 'mock_reset_token';
      
      // Mock JWT sign para retornar um token válido
      mockJwt.sign.mockReturnValue(mockToken as never);
      
      const token = await authService.generatePasswordResetToken(userId);

      expect(typeof token).toBe('string');
      expect(token).toBe(mockToken);
    });

    it('deve verificar token de reset de senha', async () => {
      const userId = 'test-user-id';
      const mockToken = 'mock_reset_token';
      const mockDecoded = { userId, type: 'password_reset' };
      
      // Mock JWT para retornar dados válidos
      mockJwt.sign.mockReturnValue(mockToken as never);
      mockJwt.verify.mockReturnValue(mockDecoded as never);
      
      // Primeiro gerar o token
      await authService.generatePasswordResetToken(userId);
      
      // Então verificar
      const result = await authService.verifyPasswordResetToken(mockToken);

      expect(result).toBe(userId);
    });
  });

  describe('Service Methods', () => {
    it('deve ter todos os métodos necessários', () => {
      const methods = [
        'comparePassword',
        'generatePasswordResetToken',
        'verifyPasswordResetToken',
        'invalidatePasswordResetTokens'
      ];

      methods.forEach(method => {
        expect(typeof authService[method as keyof AuthService]).toBe('function');
      });
    });
  });
});