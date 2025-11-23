/**
 * 🧪 CONFIGURAÇÃO GLOBAL DE TESTES
 * =================================
 * Setup inicial para todos os testes
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { config } from '../src/config/environment';

let mongoServer: MongoMemoryServer;

// Setup global antes de todos os testes
beforeAll(async () => {
  // Criar instância MongoDB em memória
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Conectar ao MongoDB em memória
  await mongoose.connect(mongoUri);
  
  // Configurar variáveis de ambiente para testes
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
  process.env.JWT_EXPIRES_IN = '1h';
});

// Limpeza após todos os testes
afterAll(async () => {
  // Fechar conexões
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Limpeza após cada teste
afterEach(async () => {
  // Limpar todas as collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    if (collection) {
      await collection.deleteMany({});
    }
  }
});

// Configurações globais para Jest
jest.setTimeout(30000);

// Mock console para reduzir ruído nos testes
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};