import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    userId: string; 
    email: string;
    name?: string;
    role?: string;
  };
}

interface AuthResult {
  success: boolean;
  user?: {
    uid: string;
    email: string;
    name?: string;
    role?: string;
  };
  error?: string;
}

/**
 * 🔐 JWT AUTHENTICATION MIDDLEWARE
 * ================================
 * Middleware para verificar tokens JWT nos endpoints da API
 */

export async function authMiddleware(request: Request): Promise<AuthResult> {
  try {
    // Buscar token no header Authorization
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Token de autenticação não fornecido'
      };
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    // Verificar token JWT local
    const jwt = await import('jsonwebtoken');
    const { config } = await import('../config/environment');
    
    if (!config.JWT_SECRET) {
      return {
        success: false,
        error: 'Configuração do servidor inválida'
      };
    }

    const decodedToken = jwt.verify(token, config.JWT_SECRET) as any;

    return {
      success: true,
      user: {
        uid: decodedToken.userId,
        email: decodedToken.email || '',
        name: decodedToken.name || decodedToken.email || '',
        role: decodedToken.role
      }
    };

  } catch (error_: unknown) {
    console.error('Erro na autenticação:', error_);
    
    if ((error_ as any)?.name === 'TokenExpiredError') {
      return {
        success: false,
        error: 'Token expirado'
      };
    }
    
    if ((error_ as any)?.name === 'JsonWebTokenError') {
      return {
        success: false,
        error: 'Token inválido'
      };
    }

    return {
      success: false,
      error: 'Token inválido'
    };
  }
}

/**
 * 🔍 OPTIONAL AUTH MIDDLEWARE
 * ===========================
 * Para endpoints que podem funcionar com ou sem autenticação
 */

export async function optionalAuthMiddleware(request: Request): Promise<AuthResult> {
  const authHeader = request.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      success: true,
      user: undefined
    };
  }

  return await authMiddleware(request);
}

/**
 * 👨‍⚕️ ROLE-BASED AUTH MIDDLEWARE
 * ==============================
 * Verificar se o usuário tem permissão específica
 */

export async function requireRole(
  request: Request, 
  allowedRoles: string[]
): Promise<AuthResult> {
  const authResult = await authMiddleware(request);
  
  if (!authResult.success) {
    return authResult;
  }

  try {
    // Buscar dados do usuário no Firebase para verificar role
    const userRecord = await adminAuth!.getUser(authResult.user!.uid);
    const customClaims = userRecord.customClaims || {};
    const userRole = customClaims.role as string;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return {
        success: false,
        error: 'Acesso negado: permissões insuficientes'
      };
    }

    return {
      success: true,
      user: {
        ...authResult.user!,
        role: userRole
      }
    };

  } catch (error_: unknown) {
    console.error('Erro ao verificar role:', error_);
    return {
      success: false,
      error: 'Erro ao verificar permissões'
    };
  }
}

/**
 * 🏥 NUTRITIONIST ONLY
 * ====================
 */
export async function requireNutritionist(request: Request): Promise<AuthResult> {
  return await requireRole(request, ['nutritionist', 'admin']);
}

/**
 * 👤 PATIENT ONLY
 * ===============
 */
export async function requirePatient(request: Request): Promise<AuthResult> {
  return await requireRole(request, ['patient', 'nutritionist', 'admin']);
}

/**
 * 👑 ADMIN ONLY
 * =============
 */
export async function requireAdmin(request: Request): Promise<AuthResult> {
  return await requireRole(request, ['admin']);
}

/**
 * EXPRESS MIDDLEWARE AUTHENTICATE - VERSÃO SIMPLIFICADA
 * ======================================================
 */
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('Token não fornecido ou formato inválido');
    res.status(401).json({
      success: false,
      error: 'Usuário não autenticado'
    });
    return;
  }

  const token = authHeader.substring(7);
  
  try {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    req.user = {
      uid: decoded.userId,
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name || decoded.email,
      role: decoded.role
    };

    next();
    
  } catch (error: any) {
    console.error('Erro ao verificar token:', error.message);
    res.status(401).json({
      success: false,
      error: error.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido'
    });
  }
}

export function authorize(roles: string[] | string) {
  const rolesArray = Array.isArray(roles) ? roles : [roles];
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado'
        });
      }

      try {
        const { UserModel } = await import('../models/User');
        const user = await UserModel.findById(req.user.userId);
        
        if (!user) {
          console.warn('Usuário não encontrado no MongoDB:', req.user.email);
          return res.status(403).json({
            success: false,
            error: 'Usuário não encontrado'
          });
        }

        const currentRole = user.role;
        req.user.role = currentRole;

        if (!rolesArray.includes(currentRole)) {
          return res.status(403).json({
            success: false,
            error: `Acesso negado: permissões insuficientes. Role necessário: ${rolesArray.join(' ou ')}, Role atual: ${currentRole}`
          });
        }

        return next();

      } catch (dbError) {
        console.error('Erro ao buscar usuário do banco:', dbError);
        return res.status(500).json({
          success: false,
          error: 'Erro ao verificar permissões'
        });
      }

    } catch (error_: unknown) {
      console.error('Erro ao verificar role:', error_);
      return res.status(500).json({
        success: false,
        error: 'Erro ao verificar permissões'
      });
    }
  };
}