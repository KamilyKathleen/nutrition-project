import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('Performance Tests', () => {
  const JWT_SECRET = 'test-secret';

  describe('Authentication Performance', () => {
    it('deve fazer hash de senhas rapidamente', async () => {
      const password = 'testPassword123!';
      const iterations = 10;
      
      const start = Date.now();
      
      for (let i = 0; i < iterations; i++) {
        await bcrypt.hash(password, 10);
      }
      
      const end = Date.now();
      const duration = end - start;
      
      expect(duration).toBeLessThan(2000); // 2s para 10 hashes
      console.log(`🔐 ${iterations} hashes de senha em ${duration}ms`);
    });

    it('deve comparar senhas rapidamente', async () => {
      const password = 'testPassword123!';
      const hashedPassword = await bcrypt.hash(password, 10);
      const iterations = 50;
      
      const start = Date.now();
      
      for (let i = 0; i < iterations; i++) {
        await bcrypt.compare(password, hashedPassword);
      }
      
      const end = Date.now();
      const duration = end - start;
      
      expect(duration).toBeLessThan(3000); // 3s para 50 comparações
      console.log(`🔍 ${iterations} comparações de senha em ${duration}ms`);
    });

    it('deve gerar tokens rapidamente', () => {
      const userId = '123456789012345678901234';
      const iterations = 1000;
      
      const start = Date.now();
      
      for (let i = 0; i < iterations; i++) {
        jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
      }
      
      const end = Date.now();
      const duration = end - start;
      
      expect(duration).toBeLessThan(1000); // 1s para 1000 tokens
      console.log(`🎫 ${iterations} tokens gerados em ${duration}ms`);
    });

    it('deve validar tokens rapidamente', () => {
      const userId = '123456789012345678901234';
      const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
      const iterations = 1000;
      
      const start = Date.now();
      
      for (let i = 0; i < iterations; i++) {
        jwt.verify(token, JWT_SECRET);
      }
      
      const end = Date.now();
      const duration = end - start;
      
      expect(duration).toBeLessThan(800); // 800ms para 1000 validações
      console.log(`✅ ${iterations} validações de token em ${duration}ms`);
    });
  });

  describe('String Processing Performance', () => {
    it('deve processar strings grandes rapidamente', () => {
      const largeString = 'x'.repeat(100000);
      const iterations = 1000;
      
      const start = Date.now();
      
      for (let i = 0; i < iterations; i++) {
        const processed = largeString.toLowerCase().trim();
        expect(processed.length).toBe(100000);
      }
      
      const end = Date.now();
      const duration = end - start;
      
      expect(duration).toBeLessThan(200); // 200ms para 1000 iterações
      console.log(`📝 ${iterations} processamentos de string em ${duration}ms`);
    });

    it('deve fazer validação de email rapidamente', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const validEmails = Array(1000).fill(0).map((_, i) => `user${i}@example.com`);
      const invalidEmails = Array(500).fill(0).map((_, i) => `invalid${i}`);
      const allEmails = [...validEmails, ...invalidEmails];
      
      const start = Date.now();
      
      const results = allEmails.map(email => emailRegex.test(email));
      
      const end = Date.now();
      const duration = end - start;
      
      expect(duration).toBeLessThan(50); // 50ms para 1500 validações
      expect(results.filter(Boolean).length).toBe(1000);
      console.log(`📧 ${allEmails.length} validações de email em ${duration}ms`);
    });
  });

  describe('Array Operations Performance', () => {
    it('deve processar arrays grandes rapidamente', () => {
      const largeArray = Array(100000).fill(0).map((_, i) => ({
        id: i,
        name: `User ${i}`,
        active: i % 2 === 0
      }));

      const start = Date.now();
      
      const activeUsers = largeArray.filter(user => user.active);
      const userNames = activeUsers.map(user => user.name);
      
      const end = Date.now();
      const duration = end - start;
      
      expect(duration).toBeLessThan(100); // 100ms para processar 100k itens
      expect(activeUsers.length).toBe(50000);
      expect(userNames.length).toBe(50000);
      console.log(`📋 Processamento de ${largeArray.length} itens em ${duration}ms`);
    });
  });
});