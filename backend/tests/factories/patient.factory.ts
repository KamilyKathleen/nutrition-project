/**
 * 🏭 PATIENT FACTORY
 * Factory para criar dados de teste de pacientes
 */

import mongoose from 'mongoose';

export const createPatientData = (overrides = {}) => ({
  name: 'João Silva',
  email: 'joao.silva@example.com',
  birthDate: new Date('1990-05-15'),
  gender: 'male',
  notes: 'Paciente teste',
  nutritionistId: new mongoose.Types.ObjectId(),
  status: 'linked',
  ...overrides
});

export const createMultiplePatients = (count: number) => {
  return Array.from({ length: count }, (_, index) => 
    createPatientData({
      name: `Paciente ${index + 1}`,
      email: `paciente${index + 1}@example.com`
    })
  );
};

export const createPatientWithoutEmail = () => 
  createPatientData({ email: undefined });

export const createPatientNotLinked = () => 
  createPatientData({ status: 'not_linked', userId: undefined });
