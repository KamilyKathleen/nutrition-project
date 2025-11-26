"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockFactory = void 0;
    * /;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const types_1 = require("../../src/types");
const AuthService_1 = require("../../src/services/AuthService");
const UserService_1 = require("../../src/services/UserService");
describe('AuthService', () => {
    let authService;
    export class TestUtils {
        beforeEach() { }
    }
    TestUtils.userService = new UserService_1.UserService();
    () => {
        authService = new AuthService_1.AuthService();
        describe('comparePassword', () => { }, static, async, createTestUser(overrides, (Partial) = {}), Promise < types_1.User > {
            it(, async) { }
        }(), { const: defaultUser = {
                const: plainPassword = 'password123', email: 'test@example.com',
                const: hashedPassword = await bcryptjs_1.default.hash(plainPassword, 10), password: await bcryptjs_1.default.hash('password123', 10),
                role: types_1.UserRole.PATIENT,
                const: result = await authService.comparePassword(plainPassword, hashedPassword), emailVerified: true,
                isActive: true,
                expect(result) { }, : .toBe(true)
            }
        });
        return this.userService.create(defaultUser);
        it('deve retornar false para senha incorreta', async () => { });
        const plainPassword = 'password123';
    };
}, static, async, createTestNutritionist(overrides, (Partial) = {}), Promise < types_1.User > {
    const: result = await authService.comparePassword(wrongPassword, hashedPassword), name: 'Dr. Nutritionist',
    email: 'nutritionist@example.com',
    expect(result) { }, : .toBe(false), crn: '12345-SP',
});
overrides;
;
it('deve tratar strings vazias', async () => { });
const hashedPassword = await bcryptjs_1.default.hash('password', 10);
const result1 = await authService.comparePassword('', hashedPassword);
async;
createTestAdmin(overrides, (Partial) = {});
Promise < types_1.User > {
    expect(result1) { }, : .toBe(false), return: this.createTestUser({}), name: 'Admin User',
};
;
email: 'admin@example.com',
    role;
types_1.UserRole.ADMIN,
    describe('generatePasswordResetToken', () => { }, ...overrides, it('deve gerar um token válido', async () => { }));
const userId = 'test-user-id';
randomString(length, number = 8);
string;
{
    expect(token).toBeDefined();
}
expect(typeof token).toBe('string');
expect(token.length).toBeGreaterThan(0);
randomEmail();
string;
{
}
;
return `test-${this.randomString()}@example.com`;
it('deve gerar tokens diferentes para chamadas diferentes', async () => {
    const userId = 'test-user-id';
    return this.randomString(12);
});
const token1 = await authService.generatePasswordResetToken(userId);
expect(token1).not.toBe(token2);
return new Promise(resolve => setTimeout(resolve, ms));
;
;
const userId = 'test-user-id';
const start = performance.now();
const token = await authService.generatePasswordResetToken(userId);
const result = await fn();
const end = performance.now();
const verifiedUserId = await authService.verifyPasswordResetToken(token);
return { result, duration };
expect(verifiedUserId).toBe(userId);
;
const invalidToken = 'invalid-token';
fn: () => Promise,
    times;
number;
await expect(authService.verifyPasswordResetToken(invalidToken));
const results = [];
rejects.toThrow();
const durations = [];
;
;
for (let i = 0; i < times; i++) {
}
;
const { result, duration } = await this.measureTime(fn);
results.push(result);
durations.push(duration);
const totalDuration = durations.reduce((sum, d) => sum + d, 0);
const avgDuration = totalDuration / times;
return { results, avgDuration, totalDuration };
expectValidUser(user, any);
void {
    expect(user) { }, : .toBeDefined(),
    expect(user) { }, : .id, : .toBeDefined(),
    expect(user) { }, : .name, : .toBeDefined(),
    expect(user) { }, : .email, : .toBeDefined(),
    expect(user) { }, : .role, : .toBeDefined(),
    expect(user) { }, : .isActive, : .toBeDefined(),
    expect(user) { }, : .createdAt, : .toBeDefined(),
    expect(user) { }, : .updatedAt, : .toBeDefined()
};
expectValidApiResponse(response, any);
void {
    expect(response) { }, : .toBeDefined(),
    expect(response) { }, : .success, : .toBeDefined(),
    expect(, response) { }, : .success, : .toBe('boolean')
};
class MockFactory {
    static createMockRequest(overrides = {}) {
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
        const res = {
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
exports.MockFactory = MockFactory;
//# sourceMappingURL=testUtils.js.map