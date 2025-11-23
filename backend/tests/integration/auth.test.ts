/**
 * 📊 TESTES DE INTEGRAÇÃO
 * =======================
 * Testes de integração para endpoints da API
 */

import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../../src/app';
import { UserModel } from '../../src/models/User';

describe('Auth Integration Tests', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Configurar MongoDB em memória
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Limpar dados antes de cada teste
    await UserModel.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('deve registrar um novo usuário', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'patient'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('deve retornar erro para email já existente', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'patient'
      };

      // Primeiro registro
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Segundo registro com mesmo email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('já existe');
    });

    it('deve validar dados obrigatórios', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        password: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Criar usuário para testes de login
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'patient'
        });
    });

    it('deve fazer login com credenciais válidas', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(loginData.email);
    });

    it('deve rejeitar credenciais inválidas', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('deve rejeitar usuário inexistente', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/logout', () => {
    let authToken: string;

    beforeEach(async () => {
      // Registrar e fazer login para obter token
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'patient'
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      authToken = loginResponse.body.token;
    });

    it('deve fazer logout com token válido', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    it('deve rejeitar logout sem token', async () => {
      await request(app)
        .post('/api/auth/logout')
        .expect(401);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'patient'
        });
    });

    it('deve processar solicitação de reset de senha', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com' })
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    it('deve aceitar email inexistente sem revelar informação', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Performance Tests', () => {
    it('deve processar múltiplas requisições concorrentes', async () => {
      const concurrentRequests = 20;
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'patient'
      };

      // Registrar usuário primeiro
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      const loginPromises = Array(concurrentRequests).fill(null).map(() =>
        request(app)
          .post('/api/auth/login')
          .send({
            email: userData.email,
            password: userData.password
          })
      );

      const responses = await Promise.all(loginPromises);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
      });
    });

    it('deve manter performance sob carga de registros', async () => {
      const userCount = 50;
      const start = performance.now();

      const registerPromises = Array(userCount).fill(null).map((_, index) =>
        request(app)
          .post('/api/auth/register')
          .send({
            name: `User ${index}`,
            email: `user${index}@example.com`,
            password: 'password123',
            role: 'patient'
          })
      );

      const responses = await Promise.all(registerPromises);
      const duration = performance.now() - start;

      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Deve processar 50 registros em menos de 10 segundos
      expect(duration).toBeLessThan(10000);
      
      console.log(`✅ ${userCount} registros processados em ${duration.toFixed(2)}ms`);
      console.log(`⚡ Throughput: ${(userCount / (duration / 1000)).toFixed(1)} registros/seg`);
    });
  });
});