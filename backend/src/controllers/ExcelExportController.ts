/**
 * 📊 CONTROLLER DE EXPORTAÇÃO EXCEL - VERSÃO SIMPLIFICADA
 * =======================================================
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { ExcelExportService } from '../services/ExcelExportService';
import { AppError } from '../middlewares/errorHandler';

export class ExcelExportController {
  private excelService: ExcelExportService;

  constructor() {
    this.excelService = new ExcelExportService();
  }

  /**
   * 📊 Exportar pacientes
   */
  async exportPatients(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { format = 'xlsx', includeDeleted = false } = req.query;
      const filters = req.body || {};

      const buffer = await this.excelService.exportPatients(filters, {
        format: format as 'xlsx' | 'csv',
        includeDeleted: includeDeleted === 'true'
      });

      const filename = `pacientes_${new Date().toISOString().split('T')[0]}.${format}`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      next(new AppError('Erro ao exportar pacientes', 500));
    }
  }

  /**
   * 📋 Exportar avaliações nutricionais
   */
  async exportAssessments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { format = 'xlsx' } = req.query;
      const filters = req.body || {};

      const buffer = await this.excelService.exportNutritionalAssessments(filters, {
        format: format as 'xlsx' | 'csv'
      });

      const filename = `avaliacoes_${new Date().toISOString().split('T')[0]}.${format}`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      next(new AppError('Erro ao exportar avaliações', 500));
    }
  }

  /**
   * 🍽️ Exportar planos dietéticos
   */
  async exportDietPlans(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { format = 'xlsx' } = req.query;
      const filters = req.body || {};

      const buffer = await this.excelService.exportDietPlans(filters, {
        format: format as 'xlsx' | 'csv'
      });

      const filename = `planos_dieta_${new Date().toISOString().split('T')[0]}.${format}`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      next(new AppError('Erro ao exportar planos dietéticos', 500));
    }
  }

  /**
   * 👥 Exportar consultas
   */
  async exportConsultations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { format = 'xlsx' } = req.query;
      const filters = req.body || {};

      const buffer = await this.excelService.exportConsultations(filters, {
        format: format as 'xlsx' | 'csv'
      });

      const filename = `consultas_${new Date().toISOString().split('T')[0]}.${format}`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-oficedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      next(new AppError('Erro ao exportar consultas', 500));
    }
  }

  /**
   * 📊 Exportar métricas
   */
  async exportMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { format = 'xlsx' } = req.query;
      const filters = req.body || {};

      const buffer = await this.excelService.exportMetrics(filters, {
        format: format as 'xlsx' | 'csv'
      });

      const filename = `metricas_${new Date().toISOString().split('T')[0]}.${format}`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      next(new AppError('Erro ao exportar métricas', 500));
    }
  }

  /**
   * 🔄 Exportar relatório completo
   */
  async exportComprehensiveReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { format = 'xlsx' } = req.query;
      const options = req.body || {};

      const buffer = await this.excelService.generateComprehensiveReport(options, {
        format: format as 'xlsx' | 'csv'
      });

      const filename = `relatorio_completo_${new Date().toISOString().split('T')[0]}.${format}`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      next(new AppError('Erro ao gerar relatório completo', 500));
    }
  }
}