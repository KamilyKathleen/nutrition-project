/**
 * 📊 CONTROLLER DE MÉTRICAS
 * =========================
 * Controller para gerenciamento e consulta de métricas
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { MetricService } from '../services/MetricService';
import { AppError } from '../middlewares/errorHandler';
import { MetricType } from '../models/Metric';

export class MetricController {

  /**
   * 📊 Registrar nova métrica
   */
  async recordMetric(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, value = 1, ...options } = req.body;
      const metric = await MetricService.record(type, value, options);

      res.status(201).json({
        success: true,
        message: 'Métrica registrada com sucesso',
        data: metric
      });
    } catch (error) {
      next(new AppError('Erro ao registrar métrica', 500));
    }
  }

  /**
   * 📈 Obter relatório de métricas
   */
  async getReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const report = await MetricService.generateReport(start, end);

      res.json({
        success: true,
        message: 'Relatório gerado com sucesso',
        data: report
      });
    } catch (error) {
      next(new AppError('Erro ao gerar relatório', 500));
    }
  }

  /**
   * 📅 Obter métricas por período
   */
  async getMetricsByPeriod(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { days = 7, groupBy = 'day', aggregationType = 'sum' } = req.query;
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - Number(days) * 24 * 60 * 60 * 1000);

      const metrics = await MetricService.aggregate(
        { startDate, endDate },
        { 
          groupBy: groupBy as 'day', 
          aggregationType: aggregationType as 'sum' 
        }
      );

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      next(new AppError('Erro ao obter métricas por período', 500));
    }
  }

  /**
   * 👤 Obter métricas do usuário
   */
  async getUserMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId || req.user?.userId;
      
      if (!userId) {
        throw new AppError('ID do usuário é obrigatório', 400);
      }

      const metrics = await MetricService.find({ userId });

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      next(error instanceof AppError ? error : new AppError('Erro ao obter métricas do usuário', 500));
    }
  }

  /**
   * � Buscar métricas com filtros
   */
  async findMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = req.query as any;
      const options = {
        limit: Number(req.query.limit) || 100,
        skip: Number(req.query.skip) || 0
      };

      const metrics = await MetricService.find(filters, options);

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      next(new AppError('Erro ao buscar métricas', 500));
    }
  }

  /**
   * 🧹 Limpar métricas antigas
   */
  async cleanupMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { days = 90 } = req.query;
      const deletedCount = await MetricService.cleanup(Number(days));

      res.json({
        success: true,
        message: `${deletedCount} métricas antigas foram removidas`,
        data: { deletedCount }
      });
    } catch (error) {
      next(new AppError('Erro ao limpar métricas antigas', 500));
    }
  }

  /**
   * 📊 Registrar múltiplas métricas
   */
  async recordBatch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { metrics } = req.body;
      const result = await MetricService.recordBatch(metrics);

      res.status(201).json({
        success: true,
        message: `${result.length} métricas registradas com sucesso`,
        data: result
      });
    } catch (error) {
      next(new AppError('Erro ao registrar métricas em lote', 500));
    }
  }
}