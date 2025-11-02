import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from '@/config/environment';
import { errorHandler } from '@/middlewares/errorHandler';
import { rateLimiter } from '@/middlewares/rateLimiter';
import { auditSensitiveAccess } from '@/middlewares/auditMiddleware';
import { authRoutes } from '@/routes/authRoutes';
import { userRoutes } from '@/routes/userRoutes';
import { patientRoutes } from '@/routes/patientRoutes';
import { nutritionalAssessmentRoutes } from '@/routes/nutritionalAssessmentRoutes';
import { dietPlanRoutes } from '@/routes/dietPlanRoutes';
import { consultationRoutes } from '@/routes/consultationRoutes';
import { blogRoutes } from '@/routes/blogRoutes';
import { reportRoutes } from '@/routes/reportRoutes';
import auditRoutes from '@/routes/auditRoutes';
import { connectToDatabase } from '@/config/database';

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
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/nutritional-assessments', nutritionalAssessmentRoutes);
app.use('/api/diet-plans', dietPlanRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit', auditRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use(errorHandler);

export { app };