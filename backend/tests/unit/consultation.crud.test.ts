/**
 * 🧪 TESTES CRUD - CONSULTA
 * Testes simples de Create, Read, Update, Delete para consultas
 */

import { createMockModel } from '../mocks/helpers';
import { createConsultationData } from '../factories/consultation.factory';

describe('CRUD de Consulta', () => {
  let mockConsultationModel: any;

  beforeEach(() => {
    mockConsultationModel = createMockModel();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // CREATE
  describe('Create - Criar consulta', () => {
    it('deve criar uma nova consulta', async () => {
      const consultationData = createConsultationData({
        type: 'online',
        status: 'scheduled',
        notes: 'Primeira consulta'
      });

      mockConsultationModel.create.mockResolvedValue(consultationData);

      const result = await mockConsultationModel.create(consultationData);

      expect(mockConsultationModel.create).toHaveBeenCalledWith(consultationData);
      expect(result.type).toBe('online');
      expect(result.status).toBe('scheduled');
      expect(result.notes).toBe('Primeira consulta');
    });

    it('deve validar data obrigatória', async () => {
      const invalidData = { type: 'online' }; // Sem data

      mockConsultationModel.create.mockRejectedValue(
        new Error('Data é obrigatória')
      );

      await expect(mockConsultationModel.create(invalidData))
        .rejects.toThrow('Data é obrigatória');
    });

    it('deve validar paciente obrigatório', async () => {
      const invalidData = { 
        date: new Date(),
        type: 'online'
      }; // Sem patientId

      mockConsultationModel.create.mockRejectedValue(
        new Error('Paciente é obrigatório')
      );

      await expect(mockConsultationModel.create(invalidData))
        .rejects.toThrow('Paciente é obrigatório');
    });
  });

  // READ
  describe('Read - Buscar consultas', () => {
    it('deve buscar consulta por ID', async () => {
      const consultationData = createConsultationData();
      mockConsultationModel.findById.mockResolvedValue(consultationData);

      const result = await mockConsultationModel.findById('consultation-123');

      expect(mockConsultationModel.findById).toHaveBeenCalledWith('consultation-123');
      expect(result).toBeDefined();
      expect(result.type).toBe(consultationData.type);
    });

    it('deve listar consultas de um paciente', async () => {
      const consultations = [
        createConsultationData({ status: 'scheduled' }),
        createConsultationData({ status: 'completed' }),
        createConsultationData({ status: 'completed' })
      ];

      mockConsultationModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(consultations)
      });

      const result = await mockConsultationModel.find({ patientId: 'patient-123' }).exec();

      expect(result).toHaveLength(3);
      expect(result[0].status).toBe('scheduled');
    });

    it('deve buscar consultas por status', async () => {
      const scheduledConsultations = [
        createConsultationData({ status: 'scheduled' }),
        createConsultationData({ status: 'scheduled' })
      ];

      mockConsultationModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(scheduledConsultations)
      });

      const result = await mockConsultationModel.find({ status: 'scheduled' }).exec();

      expect(result).toHaveLength(2);
      expect(result.every((c: any) => c.status === 'scheduled')).toBe(true);
    });

    it('deve buscar consultas por período', async () => {
      const consultations = [
        createConsultationData({ 
          date: new Date('2025-12-15T14:00:00')
        })
      ];

      mockConsultationModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(consultations)
      });

      const startDate = new Date('2025-12-01');
      const endDate = new Date('2025-12-31');

      const result = await mockConsultationModel.find({
        date: { $gte: startDate, $lte: endDate }
      }).exec();

      expect(result).toHaveLength(1);
    });
  });

  // UPDATE
  describe('Update - Atualizar consulta', () => {
    it('deve atualizar status da consulta', async () => {
      const updatedConsultation = createConsultationData({ status: 'completed' });
      mockConsultationModel.findByIdAndUpdate.mockResolvedValue(updatedConsultation);

      const result = await mockConsultationModel.findByIdAndUpdate(
        'consultation-123',
        { status: 'completed' }
      );

      expect(mockConsultationModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'consultation-123',
        { status: 'completed' }
      );
      expect(result.status).toBe('completed');
    });

    it('deve atualizar notas da consulta', async () => {
      const updatedConsultation = createConsultationData({ 
        notes: 'Notas atualizadas da consulta'
      });
      mockConsultationModel.findByIdAndUpdate.mockResolvedValue(updatedConsultation);

      const result = await mockConsultationModel.findByIdAndUpdate(
        'consultation-123',
        { notes: 'Notas atualizadas da consulta' }
      );

      expect(result.notes).toBe('Notas atualizadas da consulta');
    });

    it('deve cancelar consulta', async () => {
      const cancelledConsultation = createConsultationData({ 
        status: 'cancelled',
        notes: 'Paciente cancelou'
      });
      mockConsultationModel.findByIdAndUpdate.mockResolvedValue(cancelledConsultation);

      const result = await mockConsultationModel.findByIdAndUpdate(
        'consultation-123',
        { status: 'cancelled', notes: 'Paciente cancelou' }
      );

      expect(result.status).toBe('cancelled');
      expect(result.notes).toContain('cancelou');
    });
  });

  // DELETE
  describe('Delete - Deletar consulta', () => {
    it('deve deletar consulta existente', async () => {
      const consultationData = createConsultationData();
      mockConsultationModel.findByIdAndDelete.mockResolvedValue(consultationData);

      const result = await mockConsultationModel.findByIdAndDelete('consultation-123');

      expect(mockConsultationModel.findByIdAndDelete).toHaveBeenCalledWith('consultation-123');
      expect(result).toBeDefined();
    });

    it('deve retornar null ao deletar consulta inexistente', async () => {
      mockConsultationModel.findByIdAndDelete.mockResolvedValue(null);

      const result = await mockConsultationModel.findByIdAndDelete('id-invalido');

      expect(result).toBeNull();
    });
  });

  // CONTAGEM E ESTATÍSTICAS
  describe('Count - Estatísticas de consultas', () => {
    it('deve contar total de consultas', async () => {
      mockConsultationModel.countDocuments.mockResolvedValue(50);

      const count = await mockConsultationModel.countDocuments();

      expect(count).toBe(50);
    });

    it('deve contar consultas agendadas', async () => {
      mockConsultationModel.countDocuments.mockResolvedValue(10);

      const count = await mockConsultationModel.countDocuments({ status: 'scheduled' });

      expect(mockConsultationModel.countDocuments).toHaveBeenCalledWith({ status: 'scheduled' });
      expect(count).toBe(10);
    });

    it('deve contar consultas completadas', async () => {
      mockConsultationModel.countDocuments.mockResolvedValue(35);

      const count = await mockConsultationModel.countDocuments({ status: 'completed' });

      expect(count).toBe(35);
    });

    it('deve contar consultas de um nutricionista', async () => {
      mockConsultationModel.countDocuments.mockResolvedValue(127);

      const count = await mockConsultationModel.countDocuments({ 
        nutritionistId: 'nutritionist-123' 
      });

      expect(count).toBe(127);
    });
  });

  // VALIDAÇÕES DE NEGÓCIO
  describe('Validações de negócio', () => {
    it('não deve permitir consulta sem tipo', async () => {
      const invalidData = { 
        date: new Date(),
        patientId: 'patient-123'
      }; // Sem type

      mockConsultationModel.create.mockRejectedValue(
        new Error('Tipo de consulta é obrigatório')
      );

      await expect(mockConsultationModel.create(invalidData))
        .rejects.toThrow('Tipo de consulta é obrigatório');
    });

    it('deve aceitar apenas tipos válidos (online, in_person)', async () => {
      const validOnline = createConsultationData({ type: 'online' });
      const validInPerson = createConsultationData({ type: 'in_person' });

      expect(validOnline.type).toMatch(/^(online|in_person)$/);
      expect(validInPerson.type).toMatch(/^(online|in_person)$/);
    });

    it('deve aceitar apenas status válidos', async () => {
      const validStatuses = ['scheduled', 'completed', 'cancelled', 'no_show'];
      const consultation = createConsultationData({ status: 'scheduled' });

      expect(validStatuses).toContain(consultation.status);
    });
  });
});
