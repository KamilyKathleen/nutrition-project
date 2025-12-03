/**
 * 🏭 USER FACTORY
 * Factory para criar dados de teste de usuários
 */

import mongoose from 'mongoose';

export const createUserData = (overrides = {}) => ({
  firebaseUid: `firebase_${Math.random().toString(36).substr(2, 9)}`,
  email: 'nutricionista@example.com',
  name: 'Dr. Maria Nutricionista',
  role: 'nutritionist',
  createdAt: new Date(),
  ...overrides
});

export const createNutritionistData = () => 
  createUserData({ role: 'nutritionist' });

export const createPatientUserData = () => 
  createUserData({ 
    role: 'patient',
    email: 'paciente@example.com',
    name: 'Pedro Paciente'
  });

export const createAdminData = () => 
  createUserData({ 
    role: 'admin',
    email: 'admin@example.com',
    name: 'Admin Sistema'
  });
