import { Router } from 'express';
import { HybridAuthController } from '../controllers/HybridAuthController';

const router = Router();
const hybridAuthController = new HybridAuthController();

/**
 * 🔥🎫 HYBRID AUTH ROUTES
 * =======================
 * Firebase Authentication + JWT Authorization
 */

// 📝 Registro híbrido: Firebase + MongoDB
router.post('/hybrid/register', hybridAuthController.registerWithFirebase);

// 🔐 Login híbrido: Firebase + JWT customizado
router.post('/hybrid/login', hybridAuthController.loginWithFirebase);

// 🔄 Renovar token: Firebase → JWT customizado
router.post('/hybrid/refresh', hybridAuthController.refreshToken);

export { router as hybridAuthRoutes };