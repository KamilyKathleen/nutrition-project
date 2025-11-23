import { NextRequest } from 'next/server';
import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    userId: string; // Alias for uid for compatibility
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
 * 🔐 FIREBASE AUTHENTICATION MIDDLEWARE
 * =====================================
 * Middleware para verificar tokens Firebase nos endpoints da API
 */

export async function authMiddleware(request: NextRequest): Promise<AuthResult> {
  try {
    // Buscar token no header Authorization
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Token de autenticação não fornecido'
      };
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    // Verificar token com Firebase Admin
    const decodedToken = await adminAuth!.verifyIdToken(token);

    return {
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        name: decodedToken.name || decodedToken.email
      }
    };

  } catch (error_: unknown) {
    console.error('Erro na autenticação:', error_);
    
    if ((error_ as any)?.code === 'auth/id-token-expired') {
      return {
        success: false,
        error: 'Token expirado'
      };
    }
    
    if ((error_ as any)?.code === 'auth/id-token-revoked') {
      return {
        success: false,
        error: 'Token revogado'
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

export async function optionalAuthMiddleware(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get('Authorization');
  
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
  request: NextRequest, 
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
export async function requireNutritionist(request: NextRequest): Promise<AuthResult> {
  return await requireRole(request, ['nutritionist', 'admin']);
}

/**
 * 👤 PATIENT ONLY
 * ===============
 */
export async function requirePatient(request: NextRequest): Promise<AuthResult> {
  return await requireRole(request, ['patient', 'nutritionist', 'admin']);
}

/**
 * 👑 ADMIN ONLY
 * =============
 */
export async function requireAdmin(request: NextRequest): Promise<AuthResult> {
  return await requireRole(request, ['admin']);
}

/**
 * EXPRESS MIDDLEWARE AUTHENTICATE
 * ==============================
 */
export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token de autenticação não fornecido'
      });
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth!.verifyIdToken(token);

    req.user = {
      uid: decodedToken.uid,
      userId: decodedToken.uid, // Alias for compatibility
      email: decodedToken.email || '',
      name: decodedToken.name || decodedToken.email
    };

    return next();

  } catch (error_: unknown) {
    console.error('Erro na autenticação:', error_);
    
    if ((error_ as any)?.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado'
      });
    }
    
    if ((error_ as any)?.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        success: false,
        error: 'Token revogado'
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Token inválido'
    });
  }
}

/**
 * EXPRESS MIDDLEWARE AUTHORIZE
 * ===========================
 */
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

      const userRecord = await adminAuth!.getUser(req.user.uid);
      const customClaims = userRecord.customClaims || {};
      const userRole = customClaims.role as string;

      if (!userRole || !rolesArray.includes(userRole)) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado: permissões insuficientes'
        });
      }

      req.user.role = userRole;
      return next();

    } catch (error_: unknown) {
      console.error('Erro ao verificar role:', error_);
      return res.status(500).json({
        success: false,
        error: 'Erro ao verificar permissões'
      });
    }
  };
}