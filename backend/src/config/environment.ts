import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 8000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',

  // 🍃 MongoDB Configuration
  // Por que duas URIs?
  // - MONGODB_URI: Para desenvolvimento e produção
  // - MONGODB_TEST_URI: Para testes automatizados (banco separado)
  
  // 🐳 Usando variáveis de ambiente (.env)
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/nutrition_db',
  
  // 🧪 Banco de Testes (Isolado)
  MONGODB_TEST_URI: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/nutrition_db_test',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  RATE_LIMIT_MAX: Number.parseInt(process.env.RATE_LIMIT_MAX || '100'), // 100 requests per window

  // File Upload
  MAX_FILE_SIZE: Number.parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],

  // Pagination
  DEFAULT_PAGE_SIZE: Number.parseInt(process.env.DEFAULT_PAGE_SIZE || '20'),
  MAX_PAGE_SIZE: Number.parseInt(process.env.MAX_PAGE_SIZE || '100'),

  // Validation
  MIN_PASSWORD_LENGTH: Number.parseInt(process.env.MIN_PASSWORD_LENGTH || '8'),
  MAX_PASSWORD_LENGTH: Number.parseInt(process.env.MAX_PASSWORD_LENGTH || '128'),
};

// Validate required environment variables in production
if (process.env.NODE_ENV === 'production') {
  const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`❌ Variável de ambiente obrigatória não encontrada: ${envVar}`);
      process.exit(1);
    }
  }
}