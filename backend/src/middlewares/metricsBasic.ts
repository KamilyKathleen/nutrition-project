/**
 * 📊 MIDDLEWARE DE MÉTRICAS - SIMPLIFICADO
 * ========================================
 * Captura automática de métricas básicas
 */

import { Request, Response, NextFunction } from 'express';
import { MetricService } from '../services/MetricService';
import { MetricType, MetricUnit } from '../models/Metric';
import { AuthenticatedRequest } from './auth';

// ================================
// 🎯 INTERFACES
// ================================

interface MetricRequest extends AuthenticatedRequest {
  timing?: {
    startTime: number;
    endTime?: number;
    duration?: number;
  };
}

// ================================
// 🎯 CONFIGURAÇÕES
// ================================

const IGNORED_ROUTES = [
  '/health',
  '/metrics', 
  '/favicon.ico',
  '/robots.txt'
];

// ================================
// 🎯 MIDDLEWARE PRINCIPAL
// ================================

/**
 * 📊 Middleware para capturar métricas básicas
 */
export const metricsMiddleware = (
  req: MetricRequest,
  res: Response, 
  next: NextFunction
): void => {
  // Verificar se deve ignorar a rota
  if (shouldIgnoreRoute(req.path)) {
    return next();
  }

  // Iniciar timing
  req.timing = {
    startTime: Date.now()
  };

  // Interceptar o final da resposta
  const originalEnd = res.end;
  let endCalled = false;

  res.end = function(chunk?: any, encoding?: any): any {
    if (endCalled) {
      return;
    }
    endCalled = true;

    // Finalizar timing
    if (req.timing) {
      req.timing.endTime = Date.now();
      req.timing.duration = req.timing.endTime - req.timing.startTime;
    }

    // Capturar métricas de forma assíncrona
    setImmediate(async () => {
      try {
        await captureBasicMetrics(req, res);
      } catch (error) {
        console.error('Erro ao capturar métricas:', error);
      }
    });

    // Chamar método original
    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * 📊 Middleware de métricas de sistema
 */
export const systemMetricsMiddleware = (): void => {
  // Capturar métricas de sistema periodicamente
  setInterval(async () => {
    try {
      await captureSystemMetrics();
    } catch (error) {
      console.error('Erro ao capturar métricas de sistema:', error);
    }
  }, 60000); // A cada minuto
};

// ================================
// 🎯 FUNÇÕES DE CAPTURA
// ================================

/**
 * 📊 Capturar métricas básicas da requisição
 */
async function captureBasicMetrics(
  req: MetricRequest,
  res: Response
): Promise<void> {
  try {
    const metrics = [];

    // Métrica de requisição
    metrics.push({
      type: MetricType.API_REQUEST,
      value: 1,
      options: {
        ...(req.user?.userId && { userId: req.user.userId }),
        tags: {
          method: req.method,
          status: res.statusCode.toString(),
          route: getRoutePattern(req.path)
        },
        metadata: {
          path: req.path,
          statusCode: res.statusCode
        }
      }
    });

    // Métrica de tempo de resposta
    if (req.timing?.duration) {
      metrics.push({
        type: MetricType.RESPONSE_TIME,
        value: req.timing.duration,
        options: {
          unit: MetricUnit.MILLISECONDS,
          ...(req.user?.userId && { userId: req.user.userId }),
          tags: {
            method: req.method,
            route: getRoutePattern(req.path)
          }
        }
      });
    }

    // Métrica de erro se necessário
    if (res.statusCode >= 400) {
      metrics.push({
        type: MetricType.API_ERROR,
        value: 1,
        options: {
          ...(req.user?.userId && { userId: req.user.userId }),
          tags: {
            method: req.method,
            status: res.statusCode.toString(),
            errorType: res.statusCode >= 500 ? 'server_error' : 'client_error'
          }
        }
      });
    }

    // Registrar métricas
    if (metrics.length > 0) {
      await MetricService.recordBatch(metrics);
    }

  } catch (error) {
    console.error('Erro interno ao capturar métricas:', error);
  }
}

/**
 * 📊 Capturar métricas de sistema
 */
async function captureSystemMetrics(): Promise<void> {
  try {
    const metrics = [];

    // Uso de memória
    const memoryUsage = process.memoryUsage();
    metrics.push({
      type: MetricType.MEMORY_USAGE,
      value: memoryUsage.heapUsed,
      options: {
        unit: MetricUnit.BYTES,
        tags: {
          type: 'heap_used'
        },
        metadata: {
          heapTotal: memoryUsage.heapTotal,
          rss: memoryUsage.rss
        }
      }
    });

    // CPU usage básico
    const cpuUsage = process.cpuUsage();
    metrics.push({
      type: MetricType.CPU_USAGE,
      value: (cpuUsage.user + cpuUsage.system) / 1000000,
      options: {
        unit: MetricUnit.SECONDS,
        tags: {
          type: 'total'
        }
      }
    });

    // Registrar métricas
    if (metrics.length > 0) {
      await MetricService.recordBatch(metrics);
    }

  } catch (error) {
    console.error('Erro ao capturar métricas de sistema:', error);
  }
}

// ================================
// 🎯 FUNÇÕES AUXILIARES
// ================================

/**
 * 📊 Verificar se deve ignorar a rota
 */
function shouldIgnoreRoute(path: string): boolean {
  return IGNORED_ROUTES.some(route => 
    path.startsWith(route) || path === route
  );
}

/**
 * 📊 Obter padrão da rota
 */
function getRoutePattern(path: string): string {
  // eslint-disable-next-line prefer-string-replace-all
  return path
    .replace(/\/[0-9a-fA-F]{24}/g, '/:id') // MongoDB ObjectIds
    .replace(/\/\d+/g, '/:id') // Números
    .replace(/\/[a-zA-Z0-9-]+$/g, '/:param'); // Parâmetros finais
}

// ================================
// 🎯 EXPORTS
// ================================

export {
  captureBasicMetrics as captureRequestMetrics,
  captureSystemMetrics,
  shouldIgnoreRoute,
  getRoutePattern
};