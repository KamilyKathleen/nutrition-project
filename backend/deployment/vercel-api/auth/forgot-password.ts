import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { withDatabase } from '../_lib/handler';
import { UserService } from '../../src/services/UserService';
import { EmailService } from '../../src/services/EmailService';

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

// In-memory store for development - em produção usar Redis ou MongoDB
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
      const { error, value } = forgotPasswordSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Email inválido',
          errors: error.details.map(d => d.message)
        });
      }

      const { email } = value;
      const userService = new UserService();
      const emailService = new EmailService();

      // Buscar usuário
      const user = await userService.findByEmail(email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Gerar token de reset
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password_reset' },
        process.env.JWT_SECRET!
      );

      // Salvar token (em produção, usar banco de dados ou Redis)
      passwordResetTokens.set(user.id, {
        userId: user.id,
        token: resetToken,
        expiresAt: new Date(Date.now() + 3600000), // 1 hora
        used: false
      });

      // Enviar email de reset (direto, sem queue)
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      try {
        await emailService.sendEmail({
          to: user.email,
          subject: '🔑 Redefinição de senha - Sistema de Nutrição',
          html: `
            <h2>Redefinição de Senha</h2>
            <p>Olá, ${user.name}!</p>
            <p>Recebemos uma solicitação para redefinir sua senha.</p>
            <p><a href="${resetLink}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Redefinir Senha</a></p>
            <p>Este link é válido por 1 hora.</p>
          `,
          text: `Redefinir senha: ${resetLink}`
        });
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError);
        // Continua mesmo se email falhar
      }

      res.status(200).json({
        success: true,
        message: 'Email de recuperação enviado',
        // Em desenvolvimento, incluir token para testes
        ...(process.env.NODE_ENV === 'development' && { data: { resetToken } })
      });

    } catch (error: any) {
      console.error('Erro no forgot password:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  });
}