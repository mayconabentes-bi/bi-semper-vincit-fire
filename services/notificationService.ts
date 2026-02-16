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
    console.warn(`[MODO DE LANÇAMENTO] Envio de EMAIL para ${destinatario} desativado.`);
    // Lógica de envio de e-mail (ex: com SendGrid, etc.) será reativada no futuro.
    return Promise.resolve(true);
  }

  async sendSMS(telefone: string, mensagem: string): Promise<boolean> {
    console.warn(`[MODO DE LANÇAMENTO] Envio de SMS para ${telefone} desativado.`);
    // Lógica de envio de SMS (ex: com Twilio, etc.) será reativada no futuro.
    return Promise.resolve(true);
  }

  async sendWhatsApp(telefone: string, mensagem: string): Promise<boolean> {
    console.warn(`[MODO DE LANÇAMENTO] Envio de WhatsApp para ${telefone} desativado.`);
    // Lógica de envio de WhatsApp (ex: com a API do WhatsApp Business) será reativada no futuro.
    return Promise.resolve(true);
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
          // Notificações de sistema continuam funcionando normalmente.
          return true;
        default:
          return false;
      }
    } catch (error) {
      console.error('Erro ao processar notificação:', error);
      return false;
    }
  }
}

export const notificationService = NotificationService.getInstance();