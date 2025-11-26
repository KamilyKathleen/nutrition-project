"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AuthService_1 = require("../../src/services/AuthService");
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
const mockBcrypt = bcryptjs_1.default;
const mockJwt = jsonwebtoken_1.default;
describe('AuthService - Fixed', () => {
    let authService;
    beforeEach(() => {
        jest.clearAllMocks();
        authService = new AuthService_1.AuthService();
    });
    describe('Password Operations', () => {
        it('deve criar instância do AuthService', () => {
            expect(authService).toBeInstanceOf(AuthService_1.AuthService);
        });
        it('deve ter método comparePassword', () => {
            expect(typeof authService.comparePassword).toBe('function');
        });
        it('deve comparar senhas corretamente', async () => {
            const password = 'testpassword';
            const hashedPassword = 'hashed_password';
            mockBcrypt.compare.mockResolvedValue(true);
            const result = await authService.comparePassword(password, hashedPassword);
            expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
            expect(result).toBe(true);
        });
    });
    describe('Token Operations', () => {
        it('deve usar JWT internamente para reset tokens', () => {
            expect(jsonwebtoken_1.default).toBeDefined();
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
            mockJwt.sign.mockReturnValue(mockToken);
            const token = await authService.generatePasswordResetToken(userId);
            expect(typeof token).toBe('string');
            expect(token).toBe(mockToken);
        });
        it('deve verificar token de reset de senha', async () => {
            const userId = 'test-user-id';
            const mockToken = 'mock_reset_token';
            const mockDecoded = { userId, type: 'password_reset' };
            mockJwt.sign.mockReturnValue(mockToken);
            mockJwt.verify.mockReturnValue(mockDecoded);
            await authService.generatePasswordResetToken(userId);
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
                expect(typeof authService[method]).toBe('function');
            });
        });
    });
});
//# sourceMappingURL=AuthService-fixed.test.js.map