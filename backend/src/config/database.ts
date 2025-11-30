import mongoose from 'mongoose';
import { config } from './environment';

// Conexão singleton para Vercel Serverless
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectToDatabase = async (): Promise<mongoose.Mongoose> => {
  // Se já tem conexão ativa, retorna ela
  if (cached.conn) {
    return cached.conn;
  }

  // Se não tem promise de conexão, cria uma
  if (!cached.promise) {
    const mongoUri = config.NODE_ENV === 'test' ? config.MONGODB_TEST_URI : config.MONGODB_URI;
    
    const opts = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(mongoUri, opts).then((mongooseInstance) => {
      console.log('✅ MongoDB conectado com sucesso');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    throw error;
  }

  return cached.conn;
};

export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('🔌 MongoDB desconectado');
  } catch (error) {
    console.error('❌ Erro ao desconectar do MongoDB:', error);
  }
};

export { mongoose };