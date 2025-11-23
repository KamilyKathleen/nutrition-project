/**
 * 🧪 TESTES UNITÁRIOS - AuthController
 * ===================================
 * Testes para o controlador de autenticação
 */

import { Request, Response, NextFunction } from 'express';
import { AuthController } from '../../src/controllers/AuthController';
import { AuthService } from '../../src/services/AuthService';
import { UserService } from '../../src/services/UserService';
import { AppError } from '../../src/middlewares/errorHandler';

// Mocks
jest.mock('../../src/services/AuthService');
jest.mock('../../src/services/UserService');

describe('AuthController', () => {
  let authController: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockUserService: jest.Mocked<UserService>;
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    // Limpar mocks
    jest.clearAllMocks();

    // Setup mocks
    mockAuthService = new AuthService() as jest.Mocked<AuthService>;
    mockUserService = new UserService() as jest.Mocked<UserService>;
    
    authController = new AuthController();
    (authController as any).authService = mockAuthService;
    (authController as any).userService = mockUserService;

    // Mock request/response
    mockReq = {
      body: {},
      params: {},
      query: {},
      headers: {}
    };

    mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(() => mockRes),
      send: jest.fn(() => mockRes)
    };

    mockNext = jest.fn();
  });

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    beforeEach(() => {
      mockReq.body = loginData;
    });

    it('deve fazer login com credenciais válidas', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed-password',
        role: 'patient',
        isActive: true
      };

      mockUserService.findByEmail = jest.fn().mockResolvedValue(mockUser);
      mockAuthService.comparePassword = jest.fn().mockResolvedValue(true);
      mockUserService.updateLastLogin = jest.fn().mockResolvedValue(undefined);

      // Act
      await authController.login(mockReq, mockRes, mockNext);

      // Assert
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(mockAuthService.comparePassword).toHaveBeenCalledWith(loginData.password, mockUser.password);
      expect(mockUserService.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user: {
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            role: mockUser.role
          },
          token: expect.any(String)
        }
      });
    });

    it('deve rejeitar login com email inexistente', async () => {
      // Arrange
      mockUserService.findByEmail = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(authController.login(mockReq, mockRes))
        .rejects.toThrow(new AppError('Credenciais inválidas', 401));

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(mockAuthService.comparePassword).not.toHaveBeenCalled();
    });

    it('deve rejeitar login com senha incorreta', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed-password',
        isActive: true
      };

      mockUserService.findByEmail = jest.fn().mockResolvedValue(mockUser);
      mockAuthService.comparePassword = jest.fn().mockResolvedValue(false);

      // Act & Assert
      await expect(authController.login(mockReq, mockRes))
        .rejects.toThrow(new AppError('Credenciais inválidas', 401));

      expect(mockAuthService.comparePassword).toHaveBeenCalledWith(loginData.password, mockUser.password);
    });

    it('deve rejeitar login para usuário inativo', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed-password',
        isActive: false
      };

      mockUserService.findByEmail = jest.fn().mockResolvedValue(mockUser);
      mockAuthService.comparePassword = jest.fn().mockResolvedValue(true);

      // Act & Assert
      await expect(authController.login(mockReq, mockRes))
        .rejects.toThrow(new AppError('Conta desativada', 401));
    });
  });

  describe('register', () => {
    const registerData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      cpf: '12345678900',
      phone: '11999999999',
      role: 'patient'
    };

    beforeEach(() => {
      mockReq.body = registerData;
    });

    it('deve registrar novo usuário com sucesso', async () => {
      // Arrange
      mockUserService.findByEmail = jest.fn().mockResolvedValue(null);
      mockUserService.create = jest.fn().mockResolvedValue({
        id: 'new-user-id',
        name: registerData.name,
        email: registerData.email,
        role: registerData.role
      });

      // Act
      await authController.register(mockReq, mockRes);

      // Assert
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(registerData.email);
      expect(mockUserService.create).toHaveBeenCalledWith({
        ...registerData,
        password: expect.any(String) // Hash da senha
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Usuário criado com sucesso',
        data: {
          user: expect.objectContaining({
            id: 'new-user-id',
            name: registerData.name,
            email: registerData.email,
            role: registerData.role
          }),
          token: expect.any(String)
        }
      });
    });

    it('deve rejeitar registro com email já existente', async () => {
      // Arrange
      mockUserService.findByEmail = jest.fn().mockResolvedValue({
        id: 'existing-user',
        email: registerData.email
      });

      // Act & Assert
      await expect(authController.register(mockReq, mockRes))
        .rejects.toThrow(new AppError('Email já cadastrado', 400));

      expect(mockUserService.create).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('deve fazer logout com sucesso', async () => {
      // Act
      await authController.logout(mockReq, mockRes);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    });
  });
});