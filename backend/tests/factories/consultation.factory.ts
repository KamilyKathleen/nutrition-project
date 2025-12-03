/**
 * 🏭 CONSULTATION FACTORY
 * Factory para criar dados de teste de consultas
 */

import mongoose from 'mongoose';

export const createConsultationData = (overrides = {}) => ({
  patientId: new mongoose.Types.ObjectId(),
  nutritionistId: new mongoose.Types.ObjectId(),
  date: new Date('2025-12-15T14:00:00'),
  type: 'online',
  status: 'scheduled',
  notes: 'Consulta de acompanhamento',
  ...overrides
});

export const createScheduledConsultation = () => 
  createConsultationData({ status: 'scheduled' });

export const createCompletedConsultation = () => 
  createConsultationData({ 
    status: 'completed',
    date: new Date('2025-11-15T14:00:00')
  });

export const createCancelledConsultation = () => 
  createConsultationData({ 
    status: 'cancelled',
    notes: 'Paciente cancelou'
  });

export const createInPersonConsultation = () => 
  createConsultationData({ type: 'in_person' });
