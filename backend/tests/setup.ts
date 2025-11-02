// Setup para testes
// Configurar ambiente de teste
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/nutrition-project-test';

// Mock do MongoDB para testes
jest.mock('@/config/database', () => ({
  connectToDatabase: jest.fn(),
  disconnectFromDatabase: jest.fn(),
  mongoose: {
    connection: {
      close: jest.fn()
    }
  }
}));

// Mock dos modelos Mongoose
jest.mock('@/models/User', () => ({
  UserModel: {
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn()
  }
}));

// Configurar timeout para testes
jest.setTimeout(30000);