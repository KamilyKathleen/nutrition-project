import { app } from './app';
import { config } from '@/config/environment';

const PORT = config.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📖 Documentação da API: http://localhost:${PORT}/api/docs`);
  console.log(`🌍 Ambiente: ${config.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  server.close(() => {
    console.log('Servidor fechado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received');
  server.close(() => {
    console.log('Servidor fechado');
    process.exit(0);
  });
});

export default server;