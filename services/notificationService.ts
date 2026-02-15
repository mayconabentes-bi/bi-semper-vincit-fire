import { Notificacao } from '../types';

export class NotificationService {
  private static instance: NotificationService;
  
  private constructor() {}
  
  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async sendEmail(destinatario: string, assunto: string, mensagem: string): Promise<boolean> {
    console.log(`📧 EMAIL enviado para ${destinatario}: ${assunto}`);
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 500);
    });
  }

  async sendSMS(telefone: string, mensagem: string): Promise<boolean> {
    console.log(`📱 SMS enviado para ${telefone}: ${mensagem}`);
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 500);
    });
  }

  async sendWhatsApp(telefone: string, mensagem: string): Promise<boolean> {
    console.log(`💬 WhatsApp enviado para ${telefone}: ${mensagem}`);
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 500);
    });
  }

  async notify(notificacao: Notificacao): Promise<boolean> {
    try {
      switch (notificacao.tipo) {
        case 'email':
          return await this.sendEmail(notificacao.destinatario, notificacao.assunto, notificacao.mensagem);
        case 'sms':
          return await this.sendSMS(notificacao.destinatario, notificacao.mensagem);
        case 'whatsapp':
          return await this.sendWhatsApp(notificacao.destinatario, notificacao.mensagem);
        case 'sistema':
          return true;
        default:
          return false;
      }
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      return false;
    }
  }
}

export const notificationService = NotificationService.getInstance();