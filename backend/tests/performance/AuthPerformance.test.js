"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const perf_hooks_1 = require("perf_hooks");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const AuthService_1 = require("../../src/services/AuthService");
describe('Performance Tests', () => {
    let authService;
    beforeAll(() => {
        authService = new AuthService_1.AuthService();
    });
    describe('Password Hashing Performance', () => {
        it('deve fazer hash de senha em menos de 500ms', async () => {
            const password = 'testpassword123';
            const start = perf_hooks_1.performance.now();
            await bcryptjs_1.default.hash(password, 12);
            const end = perf_hooks_1.performance.now();
            const duration = end - start;
            expect(duration).toBeLessThan(500);
        });
        it('deve comparar senhas em menos de 100ms', async () => {
            const password = 'testpassword123';
            const hashedPassword = await bcryptjs_1.default.hash(password, 12);
            const start = perf_hooks_1.performance.now();
            const result = await authService.comparePassword(password, hashedPassword);
            const end = perf_hooks_1.performance.now();
            const duration = end - start;
            expect(result).toBe(true);
            expect(duration).toBeLessThan(100);
        });
    });
    describe('Bulk Operations Performance', () => {
        it('deve processar 100 comparações de senha em menos de 5 segundos', async () => {
            const password = 'testpassword123';
            const hashedPassword = await bcryptjs_1.default.hash(password, 12);
            const iterations = 100;
            const start = perf_hooks_1.performance.now();
            const promises = Array(iterations).fill(null).map(() => authService.comparePassword(password, hashedPassword));
            const results = await Promise.all(promises);
            const end = perf_hooks_1.performance.now();
            const duration = end - start;
            expect(results.every(r => r === true)).toBe(true);
            expect(duration).toBeLessThan(5000);
            console.log(`✅ ${iterations} comparações em ${duration.toFixed(2)}ms`);
            console.log(`⚡ Média: ${(duration / iterations).toFixed(2)}ms por comparação`);
        });
        it('deve gerar 1000 tokens em menos de 1 segundo', async () => {
            const userId = 'test-user-id';
            const iterations = 1000;
            const start = perf_hooks_1.performance.now();
            const promises = Array(iterations).fill(null).map(() => authService.generatePasswordResetToken(userId));
            const results = await Promise.all(promises);
            const end = perf_hooks_1.performance.now();
            const duration = end - start;
            expect(results).toHaveLength(iterations);
            expect(results.every(token => typeof token === 'string' && token.length > 0)).toBe(true);
            expect(duration).toBeLessThan(1000);
            const uniqueTokens = new Set(results);
            expect(uniqueTokens.size).toBe(iterations);
            console.log(`✅ ${iterations} tokens gerados em ${duration.toFixed(2)}ms`);
            console.log(`⚡ Média: ${(duration / iterations).toFixed(2)}ms por token`);
        });
    });
    describe('Memory Usage Performance', () => {
        it('deve usar memória eficientemente durante operações intensivas', async () => {
            const iterations = 500;
            const initialMemory = process.memoryUsage();
            const results = [];
            for (let i = 0; i < iterations; i++) {
                const token = await authService.generatePasswordResetToken(`user-${i}`);
                results.push(token);
                if (i % 100 === 0) {
                    results.splice(0, 50);
                }
            }
            const finalMemory = process.memoryUsage();
            const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
            const memoryIncreaseMB = memoryIncrease / (1024 * 1024);
            expect(memoryIncreaseMB).toBeLessThan(50);
            console.log(`📊 Aumento de memória: ${memoryIncreaseMB.toFixed(2)}MB`);
            console.log(`📊 Heap usado: ${(finalMemory.heapUsed / (1024 * 1024)).toFixed(2)}MB`);
        });
    });
    describe('Concurrent Operations Performance', () => {
        it('deve lidar com operações concorrentes eficientemente', async () => {
            const concurrentUsers = 50;
            const operationsPerUser = 10;
            const start = perf_hooks_1.performance.now();
            const userPromises = Array(concurrentUsers).fill(null).map(async (_, userIndex) => {
                const userId = `user-${userIndex}`;
                const operations = Array(operationsPerUser).fill(null).map(() => authService.generatePasswordResetToken(userId));
                return Promise.all(operations);
            });
            const allResults = await Promise.all(userPromises);
            const end = perf_hooks_1.performance.now();
            const duration = end - start;
            const totalOperations = concurrentUsers * operationsPerUser;
            expect(allResults).toHaveLength(concurrentUsers);
            expect(allResults.flat()).toHaveLength(totalOperations);
            expect(duration).toBeLessThan(2000);
            console.log(`✅ ${totalOperations} operações concorrentes em ${duration.toFixed(2)}ms`);
            console.log(`⚡ Throughput: ${(totalOperations / (duration / 1000)).toFixed(0)} ops/sec`);
        });
    });
    describe('Load Testing Simulation', () => {
        it('deve simular carga de autenticação realista', async () => {
            const scenarios = [
                { users: 10, operations: 5, description: 'Carga baixa' },
                { users: 50, operations: 10, description: 'Carga média' },
                { users: 100, operations: 3, description: 'Carga alta' }
            ];
            for (const scenario of scenarios) {
                console.log(`\n🧪 Testando: ${scenario.description}`);
                const start = perf_hooks_1.performance.now();
                const userPromises = Array(scenario.users).fill(null).map(async (_, userIndex) => {
                    const results = [];
                    for (let i = 0; i < scenario.operations; i++) {
                        const token = await authService.generatePasswordResetToken(`user-${userIndex}`);
                        const verification = await authService.verifyPasswordResetToken(token);
                        results.push({ token, verification });
                    }
                    return results;
                });
                const results = await Promise.all(userPromises);
                const end = perf_hooks_1.performance.now();
                const duration = end - start;
                const totalOps = scenario.users * scenario.operations * 2;
                expect(results.flat()).toHaveLength(scenario.users * scenario.operations);
                expect(duration).toBeLessThan(5000);
                console.log(`   ⏱️  Tempo: ${duration.toFixed(2)}ms`);
                console.log(`   🔄 Throughput: ${(totalOps / (duration / 1000)).toFixed(0)} ops/sec`);
                console.log(`   👥 ${scenario.users} usuários × ${scenario.operations} ops = ${totalOps} ops totais`);
            }
        });
    });
});
//# sourceMappingURL=AuthPerformance.test.js.map