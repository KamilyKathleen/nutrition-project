"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AuthController_1 = require("../../src/controllers/AuthController");
const AuthService_1 = require("../../src/services/AuthService");
const UserService_1 = require("../../src/services/UserService");
const errorHandler_1 = require("../../src/middlewares/errorHandler");
jest.mock('../../src/services/AuthService');
jest.mock('../../src/services/UserService');
describe('AuthController', () => {
    let authController;
    let mockAuthService;
    let mockUserService;
    let mockReq;
    let mockRes;
    let mockNext;
    beforeEach(() => {
        jest.clearAllMocks();
        mockAuthService = new AuthService_1.AuthService();
        mockUserService = new UserService_1.UserService();
        authController = new AuthController_1.AuthController();
        authController.authService = mockAuthService;
        authController.userService = mockUserService;
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
            await authController.login(mockReq, mockRes, mockNext);
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
            mockUserService.findByEmail = jest.fn().mockResolvedValue(null);
            await expect(authController.login(mockReq, mockRes, mockNext))
                .rejects.toThrow(new errorHandler_1.AppError('Credenciais inválidas', 401));
            expect(mockUserService.findByEmail).toHaveBeenCalledWith(loginData.email);
            expect(mockAuthService.comparePassword).not.toHaveBeenCalled();
        });
        it('deve rejeitar login com senha incorreta', async () => {
            const mockUser = {
                id: 'user-id',
                email: 'test@example.com',
                password: 'hashed-password',
                isActive: true
            };
            mockUserService.findByEmail = jest.fn().mockResolvedValue(mockUser);
            mockAuthService.comparePassword = jest.fn().mockResolvedValue(false);
            await expect(authController.login(mockReq, mockRes, mockNext))
                .rejects.toThrow(new errorHandler_1.AppError('Credenciais inválidas', 401));
            expect(mockAuthService.comparePassword).toHaveBeenCalledWith(loginData.password, mockUser.password);
        });
        it('deve rejeitar login para usuário inativo', async () => {
            const mockUser = {
                id: 'user-id',
                email: 'test@example.com',
                password: 'hashed-password',
                isActive: false
            };
            mockUserService.findByEmail = jest.fn().mockResolvedValue(mockUser);
            mockAuthService.comparePassword = jest.fn().mockResolvedValue(true);
            await expect(authController.login(mockReq, mockRes, mockNext))
                .rejects.toThrow(new errorHandler_1.AppError('Conta desativada', 401));
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
            mockUserService.findByEmail = jest.fn().mockResolvedValue(null);
            mockUserService.create = jest.fn().mockResolvedValue({
                id: 'new-user-id',
                name: registerData.name,
                email: registerData.email,
                role: registerData.role
            });
            await authController.register(mockReq, mockRes, mockNext);
            expect(mockUserService.findByEmail).toHaveBeenCalledWith(registerData.email);
            expect(mockUserService.create).toHaveBeenCalledWith({
                ...registerData,
                password: expect.any(String)
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
            mockUserService.findByEmail = jest.fn().mockResolvedValue({
                id: 'existing-user',
                email: registerData.email
            });
            await expect(authController.register(mockReq, mockRes, mockNext))
                .rejects.toThrow(new errorHandler_1.AppError('Email já cadastrado', 400));
            expect(mockUserService.create).not.toHaveBeenCalled();
        });
    });
    describe('logout', () => {
        it('deve fazer logout com sucesso', async () => {
            await authController.logout(mockReq, mockRes, mockNext);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Logout realizado com sucesso'
            });
        });
    });
});
//# sourceMappingURL=AuthController.test.js.map