import { jest } from '@jest/globals';

import mongoose from 'mongoose';

jest.setTimeout(10000);



process.env.NODE_ENV = 'test';jest.setTimeout(10000); * Configuracao Global dos Testes

process.env.JWT_SECRET = 'test-jwt-secret';



beforeEach(() => {

  jest.clearAllMocks();jest.mock('bull', () => { * Setup inicial para todos os testes Jest * 🧪 CONFIGURAÇÃO GLOBAL DOS TESTES

});

  return jest.fn().mockImplementation(() => ({

console.log('Setup carregado!');
    add: jest.fn().mockResolvedValue({ id: 'mock-job-id' }), */

    process: jest.fn(),

    on: jest.fn(), * ==================================

    close: jest.fn().mockResolvedValue(undefined)

  }));import { jest } from '@jest/globals';

});

 * Setup inicial para todos os testes Jest

jest.mock('redis', () => ({

  createClient: jest.fn(() => ({// Configuracoes globais

    connect: jest.fn().mockResolvedValue(undefined),

    disconnect: jest.fn().mockResolvedValue(undefined),jest.setTimeout(10000); */process.env.JWT_SECRET = 'test-jwt-secret-super-secure-for-testing-only';import mongoose from 'mongoose';

    on: jest.fn(),

    get: jest.fn(),

    set: jest.fn(),

    del: jest.fn(),// Mocks globais

    exists: jest.fn()

  }))jest.mock('bull', () => {

}));

  return jest.fn().mockImplementation(() => ({import { jest } from '@jest/globals';process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-super-secure';

jest.mock('nodemailer', () => ({

  createTransporter: jest.fn(() => ({    add: jest.fn().mockResolvedValue({ id: 'mock-job-id' }),

    sendMail: jest.fn().mockResolvedValue({

      messageId: 'mock-message-id',    process: jest.fn(),

      accepted: ['test@example.com'],

      rejected: []    on: jest.fn(),

    })

  }))    close: jest.fn().mockResolvedValue(undefined)// ================================process.env.ENCRYPTION_KEY = 'test-encryption-key-32-chars-long!'; * 🧪 SETUP DE TESTES * 🧪 SETUP DE TESTES

}));

  }));

jest.mock('exceljs', () => ({

  Workbook: jest.fn().mockImplementation(() => ({});// 🎯 CONFIGURAÇÕES GLOBAIS

    creator: 'Test',

    created: new Date(),

    addWorksheet: jest.fn(() => ({

      name: 'Test Sheet',jest.mock('redis', () => ({// ================================

      columns: [],

      addRow: jest.fn(),  createClient: jest.fn(() => ({

      getRow: jest.fn(() => ({

        getCell: jest.fn(() => ({ value: 'test' }))    connect: jest.fn().mockResolvedValue(undefined),

      })),

      eachRow: jest.fn(),    disconnect: jest.fn().mockResolvedValue(undefined),

      pageSetup: {},

      views: [],    on: jest.fn(),// Aumentar timeout global para testes que envolvem databaseexport {};// Configurar variáveis de ambiente para testes

      conditionalFormattings: []

    })),    get: jest.fn(),

    getWorksheet: jest.fn(),

    xlsx: {    set: jest.fn(),jest.setTimeout(10000);

      writeBuffer: jest.fn().mockResolvedValue(Buffer.from('test excel data')),

      load: jest.fn().mockResolvedValue(undefined)    del: jest.fn(),

    }

  }))    exists: jest.fn()process.env.JWT_SECRET = 'test-jwt-secret-super-secure-for-testing-only'; * ================== * ==================

}));

  }))

process.env.NODE_ENV = 'test';

process.env.JWT_SECRET = 'test-jwt-secret';}));// ================================

process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/nutrition-test';

process.env.REDIS_URL = 'redis://localhost:6379';



beforeEach(() => {jest.mock('nodemailer', () => ({// 🔧 MOCKS GLOBAISprocess.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-super-secure';

  jest.clearAllMocks();

});  createTransporter: jest.fn(() => ({



console.log('Configuracao de testes carregada!');    sendMail: jest.fn().mockResolvedValue({// ================================

      messageId: 'mock-message-id',

      accepted: ['test@example.com'],process.env.ENCRYPTION_KEY = 'test-encryption-key-32-chars-long!'; * Configuração executada antes de cada arquivo de teste * Configuração executada antes de cada arquivo de teste

      rejected: []

    })// Mock do Bull Queue para testes

  }))

}));jest.mock('bull', () => {



jest.mock('exceljs', () => ({  return jest.fn().mockImplementation(() => ({

  Workbook: jest.fn().mockImplementation(() => ({

    creator: 'Test',    add: jest.fn().mockResolvedValue({ id: 'mock-job-id' }),export {}; */ */

    created: new Date(),

    addWorksheet: jest.fn(() => ({    process: jest.fn(),

      name: 'Test Sheet',

      columns: [],    on: jest.fn(),

      addRow: jest.fn(),

      getRow: jest.fn(() => ({    close: jest.fn().mockResolvedValue(undefined)

        getCell: jest.fn(() => ({ value: 'test' }))

      })),  }));import mongoose from 'mongoose';import mongoose from 'mongoose';

      eachRow: jest.fn(),

      pageSetup: {},});

      views: [],

      conditionalFormattings: []

    })),

    getWorksheet: jest.fn(),// Mock do Redis para testes

    xlsx: {

      writeBuffer: jest.fn().mockResolvedValue(Buffer.from('test excel data')),jest.mock('redis', () => ({// Configurar variáveis de ambiente para testes// Configurar variáveis de ambiente para testes

      load: jest.fn().mockResolvedValue(undefined)

    }  createClient: jest.fn(() => ({

  }))

}));    connect: jest.fn().mockResolvedValue(undefined),(process.env as any).NODE_ENV = 'test';process.env.NODE_ENV = 'test';



// Variaveis de ambiente para testes    disconnect: jest.fn().mockResolvedValue(undefined),

process.env.NODE_ENV = 'test';

process.env.JWT_SECRET = 'test-jwt-secret';    on: jest.fn(),process.env.JWT_SECRET = 'test-jwt-secret-super-secure-for-testing-only';process.env.JWT_SECRET = 'test-jwt-secret-super-secure-for-testing-only';

process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/nutrition-test';

process.env.REDIS_URL = 'redis://localhost:6379';    get: jest.fn(),



// Limpeza global    set: jest.fn(),process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-super-secure';process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-super-secure';

beforeEach(() => {

  jest.clearAllMocks();    del: jest.fn(),

});

    exists: jest.fn()process.env.ENCRYPTION_KEY = 'test-encryption-key-32-chars-long!';process.env.ENCRYPTION_KEY = 'test-encryption-key-32-chars-long!';

console.log('Configuracao de testes carregada!');

  }))

export {};
}));



// Mock do Nodemailer para testesexport {};export {};

jest.mock('nodemailer', () => ({

  createTransporter: jest.fn(() => ({/**

    sendMail: jest.fn().mockResolvedValue({ * 🧹 Limpeza após cada suite de testes

      messageId: 'mock-message-id', */

      accepted: ['test@example.com'],afterAll(async () => {

      rejected: []  // Limpar todas as collections

    })  if (mongoose.connection.readyState === 1) {

  }))    const collections = await mongoose.connection.db.collections();

}));    

    for (const collection of collections) {

// Mock do ExcelJS para testes      await collection.deleteMany({});

jest.mock('exceljs', () => ({    }

  Workbook: jest.fn().mockImplementation(() => ({    

    creator: 'Test',    // Fechar conexão

    created: new Date(),    await mongoose.connection.close();

    addWorksheet: jest.fn(() => ({    console.log('✅ Conexão com MongoDB de teste fechada');

      name: 'Test Sheet',  }

      columns: [],});

      addRow: jest.fn(),

      getRow: jest.fn(() => ({/**

        getCell: jest.fn(() => ({ value: 'test' })) * 🧹 Limpeza após cada teste individual

      })), */

      eachRow: jest.fn(),afterEach(async () => {

      pageSetup: {},  // Limpar todas as collections após cada teste para isolamento

      views: [],  if (mongoose.connection.readyState === 1) {

      conditionalFormattings: []    const collections = await mongoose.connection.db.collections();

    })),    

    getWorksheet: jest.fn(),    for (const collection of collections) {

    xlsx: {      await collection.deleteMany({});

      writeBuffer: jest.fn().mockResolvedValue(Buffer.from('test excel data')),    }

      load: jest.fn().mockResolvedValue(undefined)  }

    }  

  }))  // Limpar todos os mocks

}));  jest.clearAllMocks();

});

// ================================    connection: {

// 🌐 VARIÁVEIS DE AMBIENTE PARA TESTES      close: jest.fn()

// ================================    }

  }

process.env.NODE_ENV = 'test';}));

process.env.JWT_SECRET = 'test-jwt-secret';

process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/nutrition-test';// Mock dos modelos Mongoose

process.env.REDIS_URL = 'redis://localhost:6379';jest.mock('@/models/User', () => ({

  UserModel: {

// ================================    findOne: jest.fn(),

// 🧹 LIMPEZA GLOBAL    findById: jest.fn(),

// ================================    findByIdAndUpdate: jest.fn(),

    create: jest.fn(),

// Limpar console para testes mais limpos    find: jest.fn(),

beforeEach(() => {    countDocuments: jest.fn()

  jest.clearAllMocks();  }

});}));



// Suprimir logs durante os testes (opcional)// Configurar timeout para testes

if (process.env.SUPPRESS_TEST_LOGS === 'true') {jest.setTimeout(30000);
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
}

// ================================
// 🔧 UTILITÁRIOS GLOBAIS PARA TESTES
// ================================

declare global {
  namespace globalThis {
    var testUtils: {
      createMockObjectId: () => string;
      createMockDate: (offset?: number) => Date;
      createMockUser: () => any;
      createMockPatient: () => any;
      createMockAssessment: () => any;
      waitForAsync: (ms: number) => Promise<void>;
    };
  }
}

// Utilitários disponíveis em todos os testes
globalThis.testUtils = {
  createMockObjectId: () => {
    // Gerar ObjectId mock válido
    return '507f1f77bcf86cd799439011';
  },

  createMockDate: (offset: number = 0) => {
    return new Date(Date.now() + offset);
  },

  createMockUser: () => ({
    _id: globalThis.testUtils.createMockObjectId(),
    name: 'Usuário Teste',
    email: 'teste@example.com',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date()
  }),

  createMockPatient: () => ({
    _id: globalThis.testUtils.createMockObjectId(),
    name: 'Paciente Teste',
    email: 'paciente@example.com',
    phone: '(11) 99999-9999',
    birthDate: new Date('1990-01-01'),
    gender: 'masculino',
    createdAt: new Date(),
    updatedAt: new Date()
  }),

  createMockAssessment: () => ({
    _id: globalThis.testUtils.createMockObjectId(),
    patientId: globalThis.testUtils.createMockObjectId(),
    weight: 70.5,
    height: 175,
    bodyFat: 15.2,
    muscleMass: 35.8,
    bmi: 23.0,
    assessmentDate: new Date(),
    createdAt: new Date()
  }),

  waitForAsync: (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

// ================================
// 🔍 MATCHERS PERSONALIZADOS
// ================================

expect.extend({
  toBeValidObjectId(received: string) {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    const pass = objectIdRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid ObjectId`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid ObjectId`,
        pass: false
      };
    }
  },

  toBeRecentDate(received: Date | string, withinMs: number = 5000) {
    const receivedDate = new Date(received);
    const now = new Date();
    const diff = Math.abs(now.getTime() - receivedDate.getTime());
    const pass = diff <= withinMs;

    if (pass) {
      return {
        message: () => `expected ${received} not to be within ${withinMs}ms of now`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be within ${withinMs}ms of now (diff: ${diff}ms)`,
        pass: false
      };
    }
  },

  toHaveValidPagination(received: any) {
    const hasValidStructure = 
      received &&
      typeof received.page === 'number' &&
      typeof received.limit === 'number' &&
      typeof received.total === 'number' &&
      received.page > 0 &&
      received.limit > 0 &&
      received.total >= 0;

    if (hasValidStructure) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to have valid pagination structure`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to have valid pagination structure (page, limit, total as positive numbers)`,
        pass: false
      };
    }
  }
});

// ================================
// 📊 RELATÓRIOS DE COBERTURA
// ================================

// Configurar threshold de cobertura
const coverageThreshold = {
  global: {
    branches: 70,
    functions: 80,
    lines: 80,
    statements: 80
  }
};

// ================================
// 🚀 INICIALIZAÇÃO DOS TESTES
// ================================

console.log('🧪 Configuração de testes carregada!');
console.log('📊 Threshold de cobertura:', coverageThreshold);
console.log('🔧 Mocks globais configurados');
console.log('⚡ Utilitários disponíveis em globalThis.testUtils');

export {};

// ================================
// 📝 TIPOS PARA TYPESCRIPT
// ================================

declare module '@jest/expect' {
  interface Matchers<R> {
    toBeValidObjectId(): R;
    toBeRecentDate(withinMs?: number): R;
    toHaveValidPagination(): R;
  }
}