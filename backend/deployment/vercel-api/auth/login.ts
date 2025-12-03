import { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { withDatabase } from '../_lib/handler';
import { UserService } from '../../src/services/UserService';

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
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
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.details.map(d => d.message)
        });
      }

      const { email, password } = value;
      const userService = new UserService();

      // Buscar usuário
      const user = await userService.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      // Verificar se usuário está ativo
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Conta desativada'
        });
      }

      // Atualizar último login
      await userService.updateLastLogin(user.id);

      // Gerar token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET!
      );

      res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
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
      console.error('Erro no login:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  });
}