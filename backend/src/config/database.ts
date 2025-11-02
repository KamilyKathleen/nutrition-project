import mongoose from 'mongoose';
import { config } from './environment';

export const connectToDatabase = async (): Promise<void> => {
  try {
    const mongoUri = config.NODE_ENV === 'test' ? config.MONGODB_TEST_URI : config.MONGODB_URI;
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
    });

    console.log('✅ MongoDB conectado com sucesso');

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 MongoDB desconectado');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
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