import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin';
import { UserService } from '../services/UserService';
import { AppError } from './errorHandler';

/**
 * 🔥 FIREBASE AUTH MIDDLEWARE
 * ===========================
 * Middleware para autenticação Firebase
 */

interface FirebaseAuthRequest extends Request {
  firebaseUser?: {
    uid: string;
    email: string;
    name?: string;
    role?: string;
    systemUserId?: string;
  };
}

/**
 * Middleware obrigatório - requer token Firebase
 */
export const requireFirebaseAuth = async (
  req: FirebaseAuthRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token de autenticação obrigatório', 401);
    }

    const token = authHeader.substring(7);
    
    // Verificar token Firebase
    const decodedToken = await adminAuth!.verifyIdToken(token);
    
    // Adicionar dados do usuário ao request
    req.firebaseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      name: decodedToken.name,
      role: decodedToken.role,
      systemUserId: decodedToken.systemUserId
    };

    next();
  } catch (error: any) {
    if (error.code?.startsWith('auth/')) {
      next(new AppError('Token Firebase inválido ou expirado', 401));
    } else {
      next(error);
    }
  }
};

/**
 * Middleware opcional - token Firebase opcional
 */
export const optionalFirebaseAuth = async (
  req: FirebaseAuthRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continua sem autenticação
    }

    const token = authHeader.substring(7);
    
    try {
      const decodedToken = await adminAuth!.verifyIdToken(token);
      
      req.firebaseUser = {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        name: decodedToken.name,
        role: decodedToken.role,
        systemUserId: decodedToken.systemUserId
      };
    } catch (error) {
      // Token inválido, mas continua sem autenticação
      console.warn('Token Firebase inválido (opcional):', error);
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware de role - requer role específica
 */
export const requireRole = (allowedRoles: string[]) => {
  return async (req: FirebaseAuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.firebaseUser) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const userRole = req.firebaseUser.role;
      
      if (!userRole || !allowedRoles.includes(userRole)) {
        throw new AppError('Acesso negado: permissões insuficientes', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middlewares específicos por role
 */
export const requireNutritionist = requireRole(['nutritionist', 'admin']);
export const requirePatient = requireRole(['patient', 'nutritionist', 'admin']);
export const requireAdmin = requireRole(['admin']);

/**
 * Middleware híbrido - suporta JWT e Firebase
 */
export const hybridAuth = async (
  req: any, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Token de autenticação obrigatório', 401));
  }

  const token = authHeader.substring(7);

  try {
    // Primeiro tenta Firebase
    const decodedToken = await adminAuth!.verifyIdToken(token);
    
    req.firebaseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      name: decodedToken.name,
      role: decodedToken.role,
      systemUserId: decodedToken.systemUserId
    };

    req.authType = 'firebase';
    return next();

  } catch (firebaseError) {
    // Se Firebase falhar, tenta JWT tradicional
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = decoded;
      req.authType = 'jwt';
      return next();

    } catch (jwtError) {
      return next(new AppError('Token inválido', 401));
    }
  }
};

export default {
  requireFirebaseAuth,
  optionalFirebaseAuth,
  requireRole,
  requireNutritionist,
  requirePatient,
  requireAdmin,
  hybridAuth
};