/**
 * 📧 SERVIÇO DE EMAIL
 * ===================
 * Sistema completo para envio de emails com templates
 */

import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { 
  NotificationType, 
  NotificationStatus, 
  INotification 
} from '../models/Notification';

/**
 * 📧 CONFIGURAÇÃO DO EMAIL
 */
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

/**
 * 📧 DADOS DO EMAIL
 */
interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: any[];
}

/**
 * 📧 SERVIÇO DE EMAIL
 */
export class EmailService {
  private transporter!: Transporter;
  private fromEmail: string;

  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@nutrition-app.com';
    this.initializeTransporter();
  }

  /**
   * 🔧 Inicializar transportador de email
   */
  private initializeTransporter(): void {
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    };

    this.transporter = nodemailer.createTransport(config);
  }

  /**
   * 📧 Enviar email simples
   */
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.fromEmail,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text || this.stripHtml(emailData.html),
        attachments: emailData.attachments || []
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email enviado:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      return false;
    }
  }

  /**
   * 📧 Processar notificação de email
   */
  async processNotification(notification: INotification): Promise<boolean> {
    try {
      // Buscar dados do usuário
      await notification.populate('userId');
      const user = notification.userId as any;

      if (!user || !user.email) {
        throw new Error('Usuário ou email não encontrado');
      }

      // Gerar conteúdo do email baseado no tipo
      const emailContent = await this.generateEmailContent(notification);

      // Enviar email
      const success = await this.sendEmail({
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      });

      // Atualizar status da notificação
      if (success) {
        notification.status = NotificationStatus.SENT;
        notification.sentAt = new Date();
      } else {
        notification.status = NotificationStatus.FAILED;
        notification.failureReason = 'Falha no envio do email';
        notification.retryCount += 1;
      }

      await notification.save();
      return success;

    } catch (error) {
      console.error('❌ Erro ao processar notificação:', error);
      
      notification.status = NotificationStatus.FAILED;
      notification.failureReason = error instanceof Error ? error.message : 'Erro desconhecido';
      notification.retryCount += 1;
      await notification.save();
      
      return false;
    }
  }

  /**
   * 📧 Gerar conteúdo do email baseado no tipo
   */
  private async generateEmailContent(notification: INotification): Promise<{
    subject: string;
    html: string;
    text: string;
  }> {
    const user = notification.userId as any;
    const data = notification.data || {};

    switch (notification.type) {
      case NotificationType.WELCOME_EMAIL:
        return this.generateWelcomeEmail(user, data);

      case NotificationType.CONSULTATION_REMINDER:
        return this.generateConsultationReminder(user, data);

      case NotificationType.CONSULTATION_SCHEDULED:
        return this.generateConsultationScheduled(user, data);

      case NotificationType.DIET_PLAN_CREATED:
        return this.generateDietPlanCreated(user, data);

      case NotificationType.PASSWORD_RESET:
        return this.generatePasswordReset(user, data);

      default:
        return this.generateGenericEmail(notification.title, notification.message);
    }
  }

  /**
   * 👋 Email de boas-vindas
   */
  private generateWelcomeEmail(user: any, data: any): { subject: string; html: string; text: string } {
    const subject = `Bem-vindo(a) ao Sistema de Nutrição, ${user.name}!`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .button { background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍎 Bem-vindo ao Sistema de Nutrição!</h1>
          </div>
          <div class="content">
            <h2>Olá, ${user.name}!</h2>
            <p>É um prazer ter você conosco! Seu cadastro foi realizado com sucesso.</p>
            <p><strong>Suas informações:</strong></p>
            <ul>
              <li>Email: ${user.email}</li>
              <li>Tipo de conta: ${user.role === 'nutritionist' ? 'Nutricionista' : 'Estudante'}</li>
              <li>Data de cadastro: ${new Date().toLocaleDateString('pt-BR')}</li>
            </ul>
            <p>Agora você pode começar a usar todas as funcionalidades do sistema.</p>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/login" class="button">Fazer Login</a>
            </div>
            <p>Se você tiver alguma dúvida, não hesite em entrar em contato conosco.</p>
            <p>Atenciosamente,<br>Equipe Sistema de Nutrição</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Bem-vindo ao Sistema de Nutrição, ${user.name}!
      
      É um prazer ter você conosco! Seu cadastro foi realizado com sucesso.
      
      Email: ${user.email}
      Tipo de conta: ${user.role === 'nutritionist' ? 'Nutricionista' : 'Estudante'}
      
      Acesse: ${process.env.FRONTEND_URL}/login
      
      Atenciosamente,
      Equipe Sistema de Nutrição
    `;

    return { subject, html, text };
  }

  /**
   * ⏰ Lembrete de consulta
   */
  private generateConsultationReminder(user: any, data: any): { subject: string; html: string; text: string } {
    const consultationDate = new Date(data.consultationDate).toLocaleDateString('pt-BR');
    const consultationTime = new Date(data.consultationDate).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const subject = `🔔 Lembrete: Consulta agendada para amanhã`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .highlight { background-color: #FFF3E0; padding: 15px; border-left: 4px solid #FF9800; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Lembrete de Consulta</h1>
          </div>
          <div class="content">
            <h2>Olá, ${user.name}!</h2>
            <p>Este é um lembrete de que você tem uma consulta agendada:</p>
            <div class="highlight">
              <p><strong>📅 Data:</strong> ${consultationDate}</p>
              <p><strong>🕐 Horário:</strong> ${consultationTime}</p>
              <p><strong>👩‍⚕️ Nutricionista:</strong> ${data.nutritionistName || 'A definir'}</p>
            </div>
            <p>Por favor, não se esqueça de comparecer no horário agendado.</p>
            <p>Se precisar remarcar ou cancelar, entre em contato conosco.</p>
            <p>Atenciosamente,<br>Equipe Sistema de Nutrição</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Lembrete de Consulta
      
      Olá, ${user.name}!
      
      Você tem uma consulta agendada:
      Data: ${consultationDate}
      Horário: ${consultationTime}
      Nutricionista: ${data.nutritionistName || 'A definir'}
      
      Atenciosamente,
      Equipe Sistema de Nutrição
    `;

    return { subject, html, text };
  }

  /**
   * 📅 Consulta agendada
   */
  private generateConsultationScheduled(user: any, data: any): { subject: string; html: string; text: string } {
    const consultationDate = new Date(data.consultationDate).toLocaleDateString('pt-BR');
    const consultationTime = new Date(data.consultationDate).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const subject = `✅ Consulta agendada com sucesso`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .success { background-color: #E8F5E8; padding: 15px; border-left: 4px solid #4CAF50; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Consulta Agendada</h1>
          </div>
          <div class="content">
            <h2>Olá, ${user.name}!</h2>
            <p>Sua consulta foi agendada com sucesso!</p>
            <div class="success">
              <p><strong>📅 Data:</strong> ${consultationDate}</p>
              <p><strong>🕐 Horário:</strong> ${consultationTime}</p>
              <p><strong>👩‍⚕️ Nutricionista:</strong> ${data.nutritionistName || 'A definir'}</p>
              <p><strong>🏥 Local:</strong> ${data.location || 'Online'}</p>
            </div>
            <p>Você receberá um lembrete 24 horas antes da consulta.</p>
            <p>Se precisar de alguma alteração, entre em contato conosco.</p>
            <p>Atenciosamente,<br>Equipe Sistema de Nutrição</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Consulta Agendada com Sucesso!
      
      Olá, ${user.name}!
      
      Detalhes da consulta:
      Data: ${consultationDate}
      Horário: ${consultationTime}
      Nutricionista: ${data.nutritionistName || 'A definir'}
      Local: ${data.location || 'Online'}
      
      Atenciosamente,
      Equipe Sistema de Nutrição
    `;

    return { subject, html, text };
  }

  /**
   * 🍽️ Plano alimentar criado
   */
  private generateDietPlanCreated(user: any, data: any): { subject: string; html: string; text: string } {
    const subject = `🍽️ Seu novo plano alimentar está pronto!`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .plan-info { background-color: #E3F2FD; padding: 15px; border-left: 4px solid #2196F3; margin: 10px 0; }
          .button { background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍽️ Plano Alimentar Criado</h1>
          </div>
          <div class="content">
            <h2>Olá, ${user.name}!</h2>
            <p>Seu nutricionista criou um novo plano alimentar personalizado para você!</p>
            <div class="plan-info">
              <p><strong>📋 Plano:</strong> ${data.planTitle || 'Novo Plano'}</p>
              <p><strong>🎯 Objetivo:</strong> ${data.planDescription || 'Melhoria da alimentação'}</p>
              <p><strong>📅 Início:</strong> ${new Date(data.startDate).toLocaleDateString('pt-BR')}</p>
              <p><strong>🥗 Calorias/dia:</strong> ${data.targetCalories || 'A definir'} kcal</p>
            </div>
            <p>Acesse o sistema para visualizar seu plano completo com todas as refeições e orientações.</p>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/diet-plans" class="button">Ver Meu Plano</a>
            </div>
            <p>Siga as orientações do seu nutricionista e mantenha uma alimentação saudável!</p>
            <p>Atenciosamente,<br>Equipe Sistema de Nutrição</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Plano Alimentar Criado!
      
      Olá, ${user.name}!
      
      Seu nutricionista criou um novo plano alimentar:
      Plano: ${data.planTitle || 'Novo Plano'}
      Início: ${new Date(data.startDate).toLocaleDateString('pt-BR')}
      Calorias/dia: ${data.targetCalories || 'A definir'} kcal
      
      Acesse: ${process.env.FRONTEND_URL}/diet-plans
      
      Atenciosamente,
      Equipe Sistema de Nutrição
    `;

    return { subject, html, text };
  }

  /**
   * 🔑 Reset de senha
   */
  private generatePasswordReset(user: any, data: any): { subject: string; html: string; text: string } {
    const subject = `🔑 Redefinição de senha - Sistema de Nutrição`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background-color: #F44336; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .security { background-color: #FFEBEE; padding: 15px; border-left: 4px solid #F44336; margin: 10px 0; }
          .button { background-color: #F44336; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔑 Redefinição de Senha</h1>
          </div>
          <div class="content">
            <h2>Olá, ${user.name}!</h2>
            <p>Recebemos uma solicitação para redefinir sua senha.</p>
            <div class="security">
              <p><strong>⚠️ Importante:</strong> Se você não fez esta solicitação, ignore este email. Sua senha permanecerá inalterada.</p>
            </div>
            <p>Para redefinir sua senha, clique no botão abaixo:</p>
            <div style="text-align: center;">
              <a href="${data.resetLink}" class="button">Redefinir Senha</a>
            </div>
            <p>Este link é válido por 1 hora e só pode ser usado uma vez.</p>
            <p>Por motivos de segurança, se você não redefinir sua senha dentro deste prazo, será necessário fazer uma nova solicitação.</p>
            <p>Atenciosamente,<br>Equipe Sistema de Nutrição</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Redefinição de Senha
      
      Olá, ${user.name}!
      
      Recebemos uma solicitação para redefinir sua senha.
      
      Se você não fez esta solicitação, ignore este email.
      
      Para redefinir: ${data.resetLink}
      
      Link válido por 1 hora.
      
      Atenciosamente,
      Equipe Sistema de Nutrição
    `;

    return { subject, html, text };
  }

  /**
   * 📧 Email genérico
   */
  private generateGenericEmail(title: string, message: string): { subject: string; html: string; text: string } {
    const subject = title;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background-color: #607D8B; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 ${title}</h1>
          </div>
          <div class="content">
            <p>${message.replace(/\n/g, '</p><p>')}</p>
            <p>Atenciosamente,<br>Equipe Sistema de Nutrição</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      ${title}
      
      ${message}
      
      Atenciosamente,
      Equipe Sistema de Nutrição
    `;

    return { subject, html, text };
  }

  /**
   * 🧹 Remover HTML de texto
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  /**
   * 🔧 Testar configuração de email
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Conexão com servidor SMTP estabelecida');
      return true;
    } catch (error) {
      console.error('❌ Erro na configuração SMTP:', error);
      return false;
    }
  }
}