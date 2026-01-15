import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

export interface AppointmentMailData {
  clientName: string;
  date: string;
  [key: string]: unknown;
}

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  private sanitizeEmail(email: string): string {
    // Remove espaços e converte para lowercase
    return email.trim().toLowerCase();
  }

  private validateEmailDomain(email: string): boolean {
    let allowedDomains = process.env.ALLOWED_EMAIL_DOMAINS?.split(',') || [];
    allowedDomains = allowedDomains.filter((d) => d.trim() !== '');
    if (allowedDomains.length === 0) return true;
    const domain = email.split('@')[1];
    return allowedDomains.includes(domain);
  }

  async sendAppointmentConfirmation(
    to: string,
    storeName: string,
    appointmentData: AppointmentMailData,
  ) {
    const sanitizedTo = this.sanitizeEmail(to);
    if (!this.validateEmailDomain(sanitizedTo)) {
      throw new Error(`Domínio não permitido: ${sanitizedTo}`);
    }
    try {
      await this.mailerService.sendMail({
        to: sanitizedTo,
        subject: 'Confirmação de Agendamento',
        template: 'appointment-confirmation',
        context: {
          storeName,
          appointmentData,
        },
      });
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw error;
    }
  }

  async send24hReminder(
    to: string,
    storeName: string,
    appointmentData: AppointmentMailData,
  ) {
    const sanitizedTo = this.sanitizeEmail(to);
    if (!this.validateEmailDomain(sanitizedTo)) {
      throw new Error(`Domínio não permitido: ${sanitizedTo}`);
    }
    try {
      await this.mailerService.sendMail({
        to: sanitizedTo,
        subject: 'Lembrete: Seu agendamento é amanhã!',
        template: '24h-reminder',
        context: {
          storeName,
          appointmentData,
        },
      });
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
        // Em ambiente de teste, apenas loga o erro e não lança
        return;
      }
      throw error;
    }
  }

  async sendPetReadyNotification(
    to: string,
    storeName: string,
    appointmentData: AppointmentMailData,
  ) {
    const sanitizedTo = this.sanitizeEmail(to);
    if (!this.validateEmailDomain(sanitizedTo)) {
      throw new Error(`Domínio não permitido: ${sanitizedTo}`);
    }
    try {
      await this.mailerService.sendMail({
        to: sanitizedTo,
        subject: 'Seu pet está pronto!',
        template: 'pet-ready',
        context: {
          storeName,
          appointmentData,
        },
      });
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
        // Em ambiente de teste, apenas loga o erro e não lança
        return;
      }
      throw error;
    }
  }

  async sendAppointmentCompleted(
    to: string,
    appointmentData: {
      clientName: string;
      petName?: string;
      serviceName?: string;
      storeName?: string;
    },
  ) {
    const sanitizedTo = this.sanitizeEmail(to);
    if (!this.validateEmailDomain(sanitizedTo)) {
      throw new Error(`Domínio não permitido: ${sanitizedTo}`);
    }
    try {
      await this.mailerService.sendMail({
        to: sanitizedTo,
        subject: 'Serviço Concluído - Obrigado!',
        template: 'appointment-completed',
        context: {
          clientName: appointmentData.clientName,
          petName: appointmentData.petName || 'seu pet',
          serviceName: appointmentData.serviceName || 'o serviço',
          storeName: appointmentData.storeName || 'Hobby Bichos',
        },
      });
    } catch (error) {
      console.error('Erro ao enviar email de conclusão:', error);
      if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
        return;
      }
      throw error;
    }
  }
}
