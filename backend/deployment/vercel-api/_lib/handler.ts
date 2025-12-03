import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import connectToDatabase from './mongodb';

export interface AuthenticatedRequest extends VercelRequest {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export function cors(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

export function authenticateToken(req: AuthenticatedRequest, res: VercelResponse): boolean {
  const authHeader = req.headers?.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, message: 'Token de acesso requerido' });
    return false;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;
    return true;
  } catch (error) {
    res.status(403).json({ success: false, message: 'Token inválido' });
    return false;
  }
}

export function checkRole(requiredRole: string) {
  return (req: AuthenticatedRequest, res: VercelResponse): boolean => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      return false;
    }

    if (req.user.role !== requiredRole && req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Permissão insuficiente' });
      return false;
    }

    return true;
  };
}

export async function withDatabase<T>(
  req: VercelRequest,
  res: VercelResponse,
  handler: (req: VercelRequest, res: VercelResponse) => Promise<T>
): Promise<void> {
  try {
    // CORS
    if (cors(req, res)) return;

    // Connect to database
    await connectToDatabase();

    // Execute handler
    await handler(req, res);
  } catch (error: any) {
    console.error('❌ Erro no handler:', error);

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export async function withAuth<T>(
  req: AuthenticatedRequest,
  res: VercelResponse,
  handler: (req: AuthenticatedRequest, res: VercelResponse) => Promise<T>,
  requiredRole?: string
): Promise<void> {
  await withDatabase(req, res, async (req, res) => {
    // Authenticate
    if (!authenticateToken(req as AuthenticatedRequest, res)) return;

    // Check role if specified
    if (requiredRole && !checkRole(requiredRole)(req as AuthenticatedRequest, res)) return;

    // Execute handler
    await handler(req as AuthenticatedRequest, res);
  });
}