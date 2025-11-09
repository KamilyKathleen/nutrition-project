import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import { NotificationModel, INotification } from '../../src/models/Notification';
import { createMockUser, createMockNotification } from '../setup';

describe('Sistema de Notificações - Modelo', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  describe('Modelo Notification', () => {
    it('deve criar uma notificação válida', () => {
      const mockUser = createMockUser();
      const notificationData = {
        type: 'INFO',
        title: 'Teste de Notificação',
        message: 'Esta é uma mensagem de teste',
        userId: mockUser._id,
        status: 'PENDING',
        channel: 'EMAIL'
      };

      const notification = new NotificationModel(notificationData);
      
      expect(notification.type).toBe('INFO');
      expect(notification.title).toBe('Teste de Notificação');
      expect(notification.message).toBe('Esta é uma mensagem de teste');
      expect(notification.userId).toEqual(mockUser._id);
      expect(notification.status).toBe('PENDING');
      expect(notification.channel).toBe('EMAIL');
    });

    it('deve requerer campos obrigatórios', () => {
      const notification = new NotificationModel({});
      const error = notification.validateSync();
      
      expect(error?.errors?.type).toBeDefined();
      expect(error?.errors?.title).toBeDefined();
      expect(error?.errors?.message).toBeDefined();
      expect(error?.errors?.userId).toBeDefined();
    });

    it('deve aceitar valores padrão', () => {
      const mockUser = createMockUser();
      const notification = new NotificationModel({
        type: 'INFO',
        title: 'Teste',
        message: 'Teste',
        userId: mockUser._id
      });
      
      expect(notification.channel).toBe('email'); // valor padrão
      expect(notification.status).toBe('PENDING'); // valor padrão
      expect(notification.priority).toBe('normal'); // valor padrão
    });
  });

  describe('Validação de Dados Mock', () => {
    it('deve ter mocks válidos de usuário', () => {
      const mockUser = createMockUser();
      
      expect(mockUser).toHaveProperty('_id');
      expect(mockUser).toHaveProperty('email');
      expect(mockUser).toHaveProperty('name');
      expect(mockUser).toHaveProperty('isActive');
      expect(mockUser).toHaveProperty('createdAt');
      expect(mockUser).toHaveProperty('updatedAt');
      
      expect(mongoose.Types.ObjectId.isValid(mockUser._id)).toBe(true);
      expect(mockUser.email).toContain('@');
      expect(mockUser.name).toBeTruthy();
    });

    it('deve ter mocks válidos de notificação', () => {
      const mockNotification = createMockNotification();
      
      expect(mockNotification).toHaveProperty('_id');
      expect(mockNotification).toHaveProperty('type');
      expect(mockNotification).toHaveProperty('title');
      expect(mockNotification).toHaveProperty('message');
      expect(mockNotification).toHaveProperty('userId');
      expect(mockNotification).toHaveProperty('status');
      expect(mockNotification).toHaveProperty('channel');
      expect(mockNotification).toHaveProperty('createdAt');
      
      expect(mongoose.Types.ObjectId.isValid(mockNotification._id)).toBe(true);
      expect(mongoose.Types.ObjectId.isValid(mockNotification.userId)).toBe(true);
      expect(mockNotification.createdAt).toBeInstanceOf(Date);
    });

    it('deve permitir customização nos mocks', () => {
      const customUser = createMockUser({ 
        name: 'Nome Custom',
        email: 'custom@test.com'
      });
      
      expect(customUser.name).toBe('Nome Custom');
      expect(customUser.email).toBe('custom@test.com');
      
      const customNotification = createMockNotification({
        type: 'SUCCESS',
        title: 'Título Custom'
      });
      
      expect(customNotification.type).toBe('SUCCESS');
      expect(customNotification.title).toBe('Título Custom');
    });
  });

  describe('Funcionalidade do Sistema', () => {
    it('deve validar ObjectIds corretamente', () => {
      const validId = new mongoose.Types.ObjectId();
      const invalidId = 'invalid-id';
      
      expect(mongoose.Types.ObjectId.isValid(validId)).toBe(true);
      expect(mongoose.Types.ObjectId.isValid(invalidId)).toBe(false);
    });

    it('deve trabalhar com timestamps', () => {
      const now = new Date();
      const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      expect(now).toBeInstanceOf(Date);
      expect(past).toBeInstanceOf(Date);
      expect(past.getTime()).toBeLessThan(now.getTime());
    });

    it('deve simular estruturas de dados do sistema', () => {
      const systemData = {
        users: [createMockUser(), createMockUser()],
        notifications: [createMockNotification(), createMockNotification()],
        summary: {
          totalUsers: 2,
          totalNotifications: 2,
          activeNotifications: 2
        }
      };

      expect(systemData.users).toHaveLength(2);
      expect(systemData.notifications).toHaveLength(2);
      expect(systemData.summary.totalUsers).toBe(2);
    });
  });
});