"use strict";
describe('Test Environment', () => {
    it('deve executar um teste básico', () => {
        expect(true).toBe(true);
    });
    it('deve ter acesso às funções do Jest', () => {
        expect(typeof describe).toBe('function');
        expect(typeof it).toBe('function');
        expect(typeof expect).toBe('function');
    });
    it('deve suportar testes assíncronos', async () => {
        const promise = Promise.resolve('test');
        const result = await promise;
        expect(result).toBe('test');
    });
});
//# sourceMappingURL=basic.test.js.map