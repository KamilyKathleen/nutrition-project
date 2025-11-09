import { jest, beforeEach, beforeAll, afterAll, expect } from '@jest/globals';
import mongoose from 'mongoose';

// ================================
// 🧪 CONFIGURAÇÃO GLOBAL DOS TESTES
// ================================

console.log('Setup carregado!');

// Configurações globais
jest.setTimeout(10000);
if (process.env.NODE_ENV !== 'test') {
  Object.defineProperty(process.env, 'NODE_ENV', { value: 'test' });
}
process.env.JWT_SECRET = 'test-jwt-secret-super-secure-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-super-secure';
process.env.ENCRYPTION_KEY = 'test-encryption-key-32-chars-long!';

// ================================
// 🎯 MOCKS GLOBAIS
// ================================

// Mock Bull Queue
jest.mock('bull', () => {
  const mockQueue = jest.fn().mockImplementation(() => ({
    add: jest.fn(() => Promise.resolve({ id: 'mock-job-id' })),
    process: jest.fn(),
    on: jest.fn(),
    close: jest.fn(() => Promise.resolve())
  }));
  return { default: mockQueue };
});

// Mock Redis
jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn(() => Promise.resolve()),
    disconnect: jest.fn(() => Promise.resolve()),
    on: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn()
  }))
}));

// Mock Nodemailer
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn(() => ({
    sendMail: jest.fn(() => Promise.resolve({
      messageId: 'mock-message-id',
      accepted: ['test@example.com'],
      rejected: []
    }))
  }))
}));

// Mock ExcelJS
jest.mock('exceljs', () => ({
  Workbook: jest.fn().mockImplementation(() => ({
    creator: 'Test',
    created: new Date(),
    addWorksheet: jest.fn(() => ({
      name: 'Test Sheet',
      columns: [],
      addRow: jest.fn(),
      getRow: jest.fn(() => ({
        font: {},
        fill: {},
        border: {},
        alignment: {}
      })),
      getCell: jest.fn(() => ({
        font: {},
        fill: {},
        border: {},
        alignment: {}
      })),
      mergeCells: jest.fn(),
      autoFilter: jest.fn()
    })),
    xlsx: {
      writeBuffer: jest.fn(() => Promise.resolve(Buffer.from('test excel data'))),
      load: jest.fn(() => Promise.resolve())
    }
  }))
}));

// ================================
// 🔧 UTILITÁRIOS DE TESTE
// ================================

// Configuração do Mongoose para testes
const mongooseConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  bufferCommands: false,
  bufferMaxEntries: 0
};

// Função para conectar ao banco de teste
export const connectTestDB = async () => {
  try {
    const mongoUri = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/nutrition-test';
    await mongoose.connect(mongoUri, mongooseConfig);
    console.log('✅ Conectado ao banco de teste');
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de teste:', error);
    throw error;
  }
};

// Função para desconectar do banco de teste
export const disconnectTestDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('✅ Desconectado do banco de teste');
  } catch (error) {
    console.error('❌ Erro ao desconectar do banco de teste:', error);
    throw error;
  }
};

// Função para limpar o banco de teste
export const clearTestDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        const collection = collections[key];
        if (collection) {
          await collection.deleteMany({});
        }
      }
      console.log('✅ Banco de teste limpo');
    }
  } catch (error) {
    console.error('❌ Erro ao limpar banco de teste:', error);
    throw error;
  }
};

// ================================
// 🎪 HOOKS GLOBAIS
// ================================

beforeEach(() => {
  jest.clearAllMocks();
});

beforeAll(async () => {
  // Setup inicial se necessário
});

afterAll(async () => {
  // Cleanup final se necessário
});

// ================================
// 🧪 CUSTOM MATCHERS
// ================================

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidObjectId(): R;
      toBeValidDate(): R;
      toHaveValidationError(path: string): R;
    }
  }
}

expect.extend({
  toBeValidObjectId(received: any) {
    const pass = mongoose.Types.ObjectId.isValid(received);
    return {
      message: () =>
        pass
          ? `expected ${received} not to be a valid ObjectId`
          : `expected ${received} to be a valid ObjectId`,
      pass,
    };
  },

  toBeValidDate(received: any) {
    const pass = received instanceof Date && !Number.isNaN(received.getTime());
    return {
      message: () =>
        pass
          ? `expected ${received} not to be a valid Date`
          : `expected ${received} to be a valid Date`,
      pass,
    };
  },

  toHaveValidationError(received: any, path: string) {
    const pass = received?.errors?.[path] !== undefined;
    return {
      message: () =>
        pass
          ? `expected error not to have validation error for path ${path}`
          : `expected error to have validation error for path ${path}`,
      pass,
    };
  }
});

// ================================
// 🎭 FACTORIES DE TESTE
// ================================

export const createMockUser = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  email: 'test@example.com',
  password: 'hashedpassword',
  name: 'Test User',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

export const createMockNotification = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  type: 'INFO',
  title: 'Test Notification',
  message: 'Test message',
  userId: new mongoose.Types.ObjectId(),
  status: 'UNREAD',
  channel: 'IN_APP',
  createdAt: new Date(),
  ...overrides
});

export const createMockMetric = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  type: 'USER_LOGIN',
  value: 1,
  userId: new mongoose.Types.ObjectId(),
  timestamp: new Date(),
  metadata: {},
  ...overrides
});

// ================================
// 🔬 HELPERS DE TESTE
// ================================

export const waitForPromises = () => new Promise(setImmediate);

export const mockRequest = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: null,
  ...overrides
});

export const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

export const mockNext = jest.fn();

export default {
  connectTestDB,
  disconnectTestDB,
  clearTestDB,
  createMockUser,
  createMockNotification,
  createMockMetric,
  waitForPromises,
  mockRequest,
  mockResponse,
  mockNext
};