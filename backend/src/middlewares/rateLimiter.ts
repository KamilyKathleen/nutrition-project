import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/environment';
import { AppError } from './errorHandler';

const rateLimiter = new RateLimiterMemory({
  points: config.RATE_LIMIT_MAX, // Número de requests
  duration: config.RATE_LIMIT_WINDOW_MS / 1000, // Por segundo
});

export const rateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await rateLimiter.consume(req.ip || 'unknown');
    next();
  } catch (error_: any) {
    const secs = Math.round(error_.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    next(new AppError('Muitas tentativas. Tente novamente em alguns minutos.', 429));
  }
};

// Rate limiter específico para login (mais restritivo)
const loginRateLimiter = new RateLimiterMemory({
  points: 5, // 5 tentativas
  duration: 900, // Por 15 minutos
});

export const loginRateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await loginRateLimiter.consume(req.ip || 'unknown');
    next();
  } catch (error_: any) {
    const secs = Math.round(error_.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    next(new AppError('Muitas tentativas de login. Tente novamente em 15 minutos.', 429));
  }
};

export { rateLimiterMiddleware as rateLimiter };