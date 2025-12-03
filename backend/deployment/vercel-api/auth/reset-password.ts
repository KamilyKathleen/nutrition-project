import { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { withDatabase } from '../_lib/handler';
import { UserService } from '../../src/services/UserService';

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).required()
});

// Same store as forgot-password (em produção usar Redis ou MongoDB)
const passwordResetTokens = new Map<string, {
  userId: string;
  token: string;
  expiresAt: Date;
  used: boolean;
}>();

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
      const { error, value } = resetPasswordSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.details.map(d => d.message)
        });
      }

      const { token, newPassword } = value;
      const userService = new UserService();

      // Verificar token JWT
      let decoded: any;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET!);
        
        if (decoded.type !== 'password_reset') {
          throw new Error('Token inválido');
        }
      } catch (jwtError) {
        return res.status(400).json({
          success: false,
          message: 'Token de reset inválido ou expirado'
        });
      }

      // Verificar se token não foi usado (em produção seria no Redis/DB)
      const tokenData = passwordResetTokens.get(decoded.userId);
      
      if (!tokenData) {
        return res.status(400).json({
          success: false,
          message: 'Token não encontrado'
        });
      }

      if (tokenData.used || tokenData.token !== token) {
        return res.status(400).json({
          success: false,
          message: 'Token já utilizado ou inválido'
        });
      }

      if (tokenData.expiresAt < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Token expirado'
        });
      }

      // Marcar token como usado
      tokenData.used = true;
      passwordResetTokens.set(decoded.userId, tokenData);
      
      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Atualizar senha no banco
      await userService.updatePassword(decoded.userId, hashedPassword);

      res.status(200).json({
        success: true,
        message: 'Senha alterada com sucesso'
      });

    } catch (error: any) {
      console.error('Erro no reset password:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  });
}