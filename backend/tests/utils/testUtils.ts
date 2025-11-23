/**
 * 🛠️ UTILITÁRIOS PARA TESTES

 * ================================= * ==========================

 * Testes para o serviço de autenticação * Funções auxiliares para criação de dados de teste

 */ */



import bcrypt from 'bcryptjs';import { User, UserRole } from '../../src/types';

import { AuthService } from '../../src/services/AuthService';import { UserService } from '../../src/services/UserService';

import bcrypt from 'bcryptjs';

describe('AuthService', () => {

  let authService: AuthService;export class TestUtils {

  private static userService = new UserService();

  beforeEach(() => {

    authService = new AuthService();  /**

  });   * 👤 Criar usuário de teste

   */

  describe('comparePassword', () => {  static async createTestUser(overrides: Partial<User> = {}): Promise<User> {

    it('deve retornar true para senha correta', async () => {    const defaultUser = {

      // Arrange      name: 'Test User',

      const plainPassword = 'password123';      email: 'test@example.com',

      const hashedPassword = await bcrypt.hash(plainPassword, 10);      password: await bcrypt.hash('password123', 10),

      role: UserRole.PATIENT,

      // Act      firebaseUid: `test-uid-${Date.now()}`,

      const result = await authService.comparePassword(plainPassword, hashedPassword);      emailVerified: true,

      isActive: true,

      // Assert      ...overrides

      expect(result).toBe(true);    };

    });

    return this.userService.create(defaultUser);

    it('deve retornar false para senha incorreta', async () => {  }

      // Arrange

      const plainPassword = 'password123';  /**

      const wrongPassword = 'wrongpassword';   * 👩‍⚕️ Criar nutricionista de teste

      const hashedPassword = await bcrypt.hash(plainPassword, 10);   */

  static async createTestNutritionist(overrides: Partial<User> = {}): Promise<User> {

      // Act    return this.createTestUser({

      const result = await authService.comparePassword(wrongPassword, hashedPassword);      name: 'Dr. Nutritionist',

      email: 'nutritionist@example.com',

      // Assert      role: UserRole.NUTRITIONIST,

      expect(result).toBe(false);      crn: '12345-SP',

    });      ...overrides

    });

    it('deve tratar strings vazias', async () => {  }

      // Arrange

      const hashedPassword = await bcrypt.hash('password', 10);  /**

   * 👑 Criar admin de teste

      // Act & Assert   */

      const result1 = await authService.comparePassword('', hashedPassword);  static async createTestAdmin(overrides: Partial<User> = {}): Promise<User> {

      expect(result1).toBe(false);    return this.createTestUser({

    });      name: 'Admin User',

  });      email: 'admin@example.com',

      role: UserRole.ADMIN,

  describe('generatePasswordResetToken', () => {      ...overrides

    it('deve gerar um token válido', async () => {    });

      // Arrange  }

      const userId = 'test-user-id';

  /**

      // Act   * 🎯 Gerar dados aleatórios

      const token = await authService.generatePasswordResetToken(userId);   */

  static randomString(length: number = 8): string {

      // Assert    return Math.random().toString(36).substring(2, length + 2);

      expect(token).toBeDefined();  }

      expect(typeof token).toBe('string');

      expect(token.length).toBeGreaterThan(0);  static randomEmail(): string {

    });    return `test-${this.randomString()}@example.com`;

  }

    it('deve gerar tokens diferentes para chamadas diferentes', async () => {

      // Arrange  static randomPassword(): string {

      const userId = 'test-user-id';    return this.randomString(12);

  }

      // Act

      const token1 = await authService.generatePasswordResetToken(userId);  /**

      const token2 = await authService.generatePasswordResetToken(userId);   * ⏱️ Aguardar um tempo específico

   */

      // Assert  static async sleep(ms: number): Promise<void> {

      expect(token1).not.toBe(token2);    return new Promise(resolve => setTimeout(resolve, ms));

    });  }

  });

  /**

  describe('verifyPasswordResetToken', () => {   * 📊 Medir tempo de execução

    it('deve verificar token válido', async () => {   */

      // Arrange  static async measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {

      const userId = 'test-user-id';    const start = performance.now();

      const token = await authService.generatePasswordResetToken(userId);    const result = await fn();

    const end = performance.now();

      // Act    const duration = end - start;

      const verifiedUserId = await authService.verifyPasswordResetToken(token);    

    return { result, duration };

      // Assert  }

      expect(verifiedUserId).toBe(userId);

    });  /**

   * 🔄 Executar função múltiplas vezes

    it('deve rejeitar token inválido', async () => {   */

      // Arrange  static async executeMultiple<T>(

      const invalidToken = 'invalid-token';    fn: () => Promise<T>, 

    times: number

      // Act & Assert  ): Promise<{ results: T[]; avgDuration: number; totalDuration: number }> {

      await expect(authService.verifyPasswordResetToken(invalidToken))    const results: T[] = [];

        .rejects.toThrow();    const durations: number[] = [];

    });

  });    for (let i = 0; i < times; i++) {

});      const { result, duration } = await this.measureTime(fn);
      results.push(result);
      durations.push(duration);
    }

    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const avgDuration = totalDuration / times;

    return { results, avgDuration, totalDuration };
  }

  /**
   * 🧪 Assertions customizadas
   */
  static expectValidUser(user: any): void {
    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.name).toBeDefined();
    expect(user.email).toBeDefined();
    expect(user.role).toBeDefined();
    expect(user.isActive).toBeDefined();
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
  }

  static expectValidApiResponse(response: any): void {
    expect(response).toBeDefined();
    expect(response.success).toBeDefined();
    expect(typeof response.success).toBe('boolean');
  }
}

/**
 * 🎭 Mock Factory para objetos complexos
 */
export class MockFactory {
  static createMockRequest(overrides: any = {}) {
    return {
      body: {},
      params: {},
      query: {},
      headers: {},
      user: undefined,
      ...overrides
    };
  }

  static createMockResponse() {
    const res: any = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
      send: jest.fn(() => res),
      cookie: jest.fn(() => res),
      clearCookie: jest.fn(() => res),
    };
    return res;
  }

  static createMockNext() {
    return jest.fn();
  }
}