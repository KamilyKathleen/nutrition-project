"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const AuthService_1 = require("../../src/services/AuthService");
describe('Performance Analysis - 2s Criteria', () => {
    let authService;
    beforeAll(() => {
        authService = new AuthService_1.AuthService();
    });
    describe('Critério: Operações < 2000ms', () => {
        it('🔐 Hash de senha deve ser < 2s', async () => {
            const password = 'testpassword123';
            const start = performance.now();
            await bcryptjs_1.default.hash(password, 12);
            const end = performance.now();
            const duration = end - start;
            console.log(`🔐 Hash de senha: ${duration.toFixed(2)}ms`);
            expect(duration).toBeLessThan(2000);
            if (duration < 500) {
                console.log('✅ EXCELENTE: Muito abaixo do limite');
            }
            else if (duration < 1000) {
                console.log('✅ BOM: Dentro da faixa aceitável');
            }
            else if (duration < 2000) {
                console.log('⚠️ ACEITÁVEL: Próximo ao limite');
            }
            else {
                console.log('❌ CRÍTICO: Acima do limite!');
            }
        });
        it('🔍 Comparação de senha deve ser < 2s', async () => {
            const password = 'testpassword123';
            const hashedPassword = await bcryptjs_1.default.hash(password, 12);
            const start = performance.now();
            const result = await authService.comparePassword(password, hashedPassword);
            const end = performance.now();
            const duration = end - start;
            console.log(`🔍 Comparação de senha: ${duration.toFixed(2)}ms`);
            expect(result).toBe(true);
            expect(duration).toBeLessThan(2000);
            if (duration < 100) {
                console.log('✅ EXCELENTE: Muito rápido');
            }
            else if (duration < 500) {
                console.log('✅ BOM: Tempo aceitável');
            }
            else if (duration < 1000) {
                console.log('⚠️ MODERADO: Pode melhorar');
            }
            else {
                console.log('❌ LENTO: Precisa otimização');
            }
        });
        it('🎲 Geração de token deve ser < 2s', async () => {
            const userId = 'test-user-id';
            const start = performance.now();
            const token = await authService.generatePasswordResetToken(userId);
            const end = performance.now();
            const duration = end - start;
            console.log(`🎲 Geração de token: ${duration.toFixed(2)}ms`);
            expect(token).toBeTruthy();
            expect(duration).toBeLessThan(2000);
            if (duration < 10) {
                console.log('✅ EXCELENTE: Instantâneo');
            }
            else if (duration < 100) {
                console.log('✅ MUITO BOM: Muito rápido');
            }
            else if (duration < 500) {
                console.log('✅ BOM: Rápido');
            }
            else {
                console.log('⚠️ LENTO: Precisa verificar');
            }
        });
        it('🔄 Operação completa de autenticação deve ser < 2s', async () => {
            const userId = 'test-user-id';
            const password = 'testpassword123';
            const start = performance.now();
            const hashedPassword = await bcryptjs_1.default.hash(password, 12);
            const isValid = await authService.comparePassword(password, hashedPassword);
            const token = await authService.generatePasswordResetToken(userId);
            const verifiedUserId = await authService.verifyPasswordResetToken(token);
            const end = performance.now();
            const duration = end - start;
            console.log(`🔄 Fluxo completo de auth: ${duration.toFixed(2)}ms`);
            expect(isValid).toBe(true);
            expect(verifiedUserId).toBe(userId);
            expect(duration).toBeLessThan(2000);
            if (duration < 500) {
                console.log('🚀 PERFORMANCE EXCELENTE: Sistema muito otimizado');
            }
            else if (duration < 1000) {
                console.log('✅ PERFORMANCE BOA: Sistema bem otimizado');
            }
            else if (duration < 1500) {
                console.log('⚠️ PERFORMANCE MODERADA: Pode melhorar');
            }
            else if (duration < 2000) {
                console.log('🟡 PERFORMANCE LIMITE: Atenção necessária');
            }
            else {
                console.log('❌ PERFORMANCE CRÍTICA: Otimização urgente!');
            }
        });
        it('📊 Teste de carga com múltiplas operações < 2s', async () => {
            const iterations = 50;
            const password = 'testpassword123';
            const start = performance.now();
            const promises = Array(iterations).fill(null).map(async (_, i) => {
                const userId = `user-${i}`;
                const token = await authService.generatePasswordResetToken(userId);
                const verified = await authService.verifyPasswordResetToken(token);
                return verified === userId;
            });
            const results = await Promise.all(promises);
            const end = performance.now();
            const duration = end - start;
            console.log(`📊 ${iterations} operações em paralelo: ${duration.toFixed(2)}ms`);
            expect(results.every(r => r === true)).toBe(true);
            expect(duration).toBeLessThan(2000);
            const avgPerOperation = duration / iterations;
            console.log(`⚡ Média por operação: ${avgPerOperation.toFixed(2)}ms`);
            if (avgPerOperation < 10) {
                console.log('🚀 THROUGHPUT EXCELENTE: Alta capacidade');
            }
            else if (avgPerOperation < 50) {
                console.log('✅ THROUGHPUT BOM: Boa capacidade');
            }
            else if (avgPerOperation < 100) {
                console.log('⚠️ THROUGHPUT MODERADO: Capacidade limitada');
            }
            else {
                console.log('❌ THROUGHPUT BAIXO: Gargalo identificado');
            }
        });
    });
    describe('Resumo de Performance', () => {
        it('📈 Deve exibir relatório de performance geral', async () => {
            console.log('\n📈 RELATÓRIO DE PERFORMANCE - CRITÉRIO 2s');
            console.log('===========================================');
            const hashStart = performance.now();
            await bcryptjs_1.default.hash('test', 12);
            const hashTime = performance.now() - hashStart;
            const hashedPwd = await bcryptjs_1.default.hash('test', 12);
            const compareStart = performance.now();
            await bcryptjs_1.default.compare('test', hashedPwd);
            const compareTime = performance.now() - compareStart;
            const tokenStart = performance.now();
            await authService.generatePasswordResetToken('test');
            const tokenTime = performance.now() - tokenStart;
            console.log(`🔐 Hash de senha:       ${hashTime.toFixed(2)}ms    (limite: 2000ms) ${hashTime < 2000 ? '✅' : '❌'}`);
            console.log(`🔍 Comparação:          ${compareTime.toFixed(2)}ms    (limite: 2000ms) ${compareTime < 2000 ? '✅' : '❌'}`);
            console.log(`🎲 Token:               ${tokenTime.toFixed(2)}ms     (limite: 2000ms) ${tokenTime < 2000 ? '✅' : '❌'}`);
            const allWithinLimit = hashTime < 2000 && compareTime < 2000 && tokenTime < 2000;
            console.log('\n🎯 VEREDICTO FINAL:');
            if (allWithinLimit) {
                console.log('✅ SISTEMA ATENDE AO CRITÉRIO DE < 2s');
                console.log('🚀 Performance aprovada para produção');
            }
            else {
                console.log('❌ SISTEMA NÃO ATENDE AO CRITÉRIO DE < 2s');
                console.log('⚠️ Otimização necessária antes da produção');
            }
            expect(allWithinLimit).toBe(true);
        });
    });
});
//# sourceMappingURL=performance-2s-criteria.test.js.map