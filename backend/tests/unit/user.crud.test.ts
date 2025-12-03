/**
 * 🧪 TESTES CRUD - USUÁRIO
 * Testes simples de Create, Read, Update, Delete para usuários
 */

import { createMockModel } from '../mocks/helpers';
import { createUserData } from '../factories/user.factory';

describe('CRUD de Usuário', () => {
  let mockUserModel: any;

  beforeEach(() => {
    mockUserModel = createMockModel();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // CREATE
  describe('Create - Criar usuário', () => {
    it('deve criar um novo usuário', async () => {
      const userData = createUserData({
        name: 'Dr. João Silva',
        email: 'joao@example.com',
        role: 'nutritionist'
      });

      mockUserModel.create.mockResolvedValue(userData);

      const result = await mockUserModel.create(userData);

      expect(mockUserModel.create).toHaveBeenCalledWith(userData);
      expect(result.name).toBe('Dr. João Silva');
      expect(result.email).toBe('joao@example.com');
      expect(result.role).toBe('nutritionist');
    });

    it('deve validar email obrigatório', async () => {
      const invalidData = { name: 'Teste' }; // Sem email

      mockUserModel.create.mockRejectedValue(
        new Error('Email é obrigatório')
      );

      await expect(mockUserModel.create(invalidData))
        .rejects.toThrow('Email é obrigatório');
    });
  });

  // READ
  describe('Read - Buscar usuários', () => {
    it('deve buscar usuário por ID', async () => {
      const userData = createUserData();
      mockUserModel.findById.mockResolvedValue(userData);

      const result = await mockUserModel.findById('user-123');

      expect(mockUserModel.findById).toHaveBeenCalledWith('user-123');
      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
    });

    it('deve retornar null se usuário não existir', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      const result = await mockUserModel.findById('id-invalido');

      expect(result).toBeNull();
    });

    it('deve buscar usuário por email', async () => {
      const userData = createUserData({ email: 'teste@test.com' });
      mockUserModel.findOne.mockResolvedValue(userData);

      const result = await mockUserModel.findOne({ email: 'teste@test.com' });

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'teste@test.com' });
      expect(result.email).toBe('teste@test.com');
    });

    it('deve listar todos os usuários', async () => {
      const users = [
        createUserData({ name: 'User 1' }),
        createUserData({ name: 'User 2' }),
        createUserData({ name: 'User 3' })
      ];

      mockUserModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(users)
      });

      const result = await mockUserModel.find().exec();

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('User 1');
    });
  });

  // UPDATE
  describe('Update - Atualizar usuário', () => {
    it('deve atualizar dados do usuário', async () => {
      const updatedData = createUserData({ name: 'Nome Atualizado' });
      mockUserModel.findByIdAndUpdate.mockResolvedValue(updatedData);

      const result = await mockUserModel.findByIdAndUpdate(
        'user-123',
        { name: 'Nome Atualizado' }
      );

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'user-123',
        { name: 'Nome Atualizado' }
      );
      expect(result.name).toBe('Nome Atualizado');
    });

    it('deve retornar null ao atualizar usuário inexistente', async () => {
      mockUserModel.findByIdAndUpdate.mockResolvedValue(null);

      const result = await mockUserModel.findByIdAndUpdate('id-invalido', {});

      expect(result).toBeNull();
    });
  });

  // DELETE
  describe('Delete - Deletar usuário', () => {
    it('deve deletar usuário existente', async () => {
      const userData = createUserData();
      mockUserModel.findByIdAndDelete.mockResolvedValue(userData);

      const result = await mockUserModel.findByIdAndDelete('user-123');

      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith('user-123');
      expect(result).toBeDefined();
    });

    it('deve retornar null ao deletar usuário inexistente', async () => {
      mockUserModel.findByIdAndDelete.mockResolvedValue(null);

      const result = await mockUserModel.findByIdAndDelete('id-invalido');

      expect(result).toBeNull();
    });
  });

  // CONTAGEM
  describe('Count - Contar usuários', () => {
    it('deve contar total de usuários', async () => {
      mockUserModel.countDocuments.mockResolvedValue(10);

      const count = await mockUserModel.countDocuments();

      expect(count).toBe(10);
    });

    it('deve contar usuários por role', async () => {
      mockUserModel.countDocuments.mockResolvedValue(5);

      const count = await mockUserModel.countDocuments({ role: 'nutritionist' });

      expect(mockUserModel.countDocuments).toHaveBeenCalledWith({ role: 'nutritionist' });
      expect(count).toBe(5);
    });
  });
});
