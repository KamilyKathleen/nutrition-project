import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from './config/environment';
import { errorHandler } from './middlewares/errorHandler';
import { rateLimiter } from './middlewares/rateLimiter';
import { authRoutes } from './routes/authRoutes';
import firebaseAuthRoutes from './routes/firebaseAuth';
import { userRoutes } from './routes/userRoutes';
import { patientRoutes } from './routes/patientRoutes';
import { nutritionalAssessmentRoutes } from './routes/nutritionalAssessmentRoutes';
import { dietPlanRoutes } from './routes/dietPlanRoutes';
import { consultationRoutes } from './routes/consultationRoutes';
import { blogRoutes } from './routes/blogRoutes';
import { reportRoutes } from './routes/reportRoutes';
import auditRoutes from './routes/auditRoutes';
import { notificationRoutes } from './routes/notificationRoutes';
import metricRoutes from './routes/metricRoutes';
import { exportRoutes } from './routes/exportRoutes';
import { metricsMiddleware, systemMetricsMiddleware } from './middlewares/metricsBasic';
import { connectToDatabase } from './config/database';

const app = express();

// Conectar ao MongoDB
connectToDatabase();

// Middlewares de segurança
app.use(helmet());
app.use(compression());
app.use(rateLimiter);

// CORS configuration
app.use(cors({
  origin: config.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Métricas middleware
app.use(metricsMiddleware);

// Logging
if (config.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV 
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/firebase', firebaseAuthRoutes); // 🔥 Firebase Auth
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/nutritional-assessments', nutritionalAssessmentRoutes);
app.use('/api/diet-plans', dietPlanRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/metrics', metricRoutes);
app.use('/api/exports', exportRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use(errorHandler);

// Inicializar métricas de sistema
if (config.NODE_ENV !== 'test') {
  systemMetricsMiddleware();
}

export default app;