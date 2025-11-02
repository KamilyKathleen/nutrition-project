import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { config } from '@/config/environment';
import { AppError } from './errorHandler';
import { JwtPayload, UserRole } from '@/types';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = (req.headers as any).authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token de acesso não fornecido', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer '
    
    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    (req as unknown as AuthenticatedRequest).user = decoded;
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Token inválido', 401));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Token expirado', 401));
    }
    next(error);
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as unknown as AuthenticatedRequest;
    if (!authReq.user) {
      return next(new AppError('Usuário não autenticado', 401));
    }

    if (!roles.includes(authReq.user.role)) {
      return next(new AppError('Acesso não autorizado para este recurso', 403));
    }

    next();
  };
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = (req.headers as any).authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Se houver erro no token opcional, continua sem usuário
    next();
  }
};