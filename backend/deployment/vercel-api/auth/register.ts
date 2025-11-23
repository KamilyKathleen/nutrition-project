import { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { withDatabase } from '../_lib/handler';
import { UserService } from '../../src/services/UserService';

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string().valid('nutricionista', 'paciente').required(),
  phone: Joi.string().optional(),
  dateOfBirth: Joi.date().optional()
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withDatabase(req, res, async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        success: false, 
        message: 'Método não permitido' 
      });
    }

    try {
      // Validar dados de entrada
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.details.map(d => d.message)
        });
      }

      const userData = value;
      const userService = new UserService();

      // Verificar se usuário já existe
      const existingUser = await userService.findByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email já cadastrado'
        });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Criar usuário
      const user = await userService.create({
        ...userData,
        password: hashedPassword
      });

      // Gerar token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET!
      );

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          token
        }
      });

    } catch (error: any) {
      console.error('Erro no registro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  });
}