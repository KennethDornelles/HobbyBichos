import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import {
  PushProvider,
  WhatsAppProvider,
  SmsProvider,
  EmailProvider,
} from './providers';
import type { NotificationCategory, NotificationChannel } from '@prisma/client';

@Processor('notification_queue')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  private pushProvider: PushProvider;
  private whatsappProvider: WhatsAppProvider;
  private smsProvider: SmsProvider;
  private emailProvider: EmailProvider;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    super();
    this.pushProvider = new PushProvider();
    this.whatsappProvider = new WhatsAppProvider();
    this.smsProvider = new SmsProvider();
    
    const resendKey = this.configService.get<string>('RESEND_API_KEY') || '';
    const mailFrom = this.configService.get<string>('MAIL_FROM') || 'Hobby Bichos <onboarding@resend.dev>';
    this.emailProvider = new EmailProvider(resendKey, mailFrom);
  }

  async process(job: Job): Promise<any> {
    const { userId, storeId, category, payload, notificationId } = job.data as {
      userId: string;
      storeId: string;
      category: NotificationCategory;
      payload: any;
      notificationId?: string;
    };
    this.logger.log(
      `Processando notificação para user ${userId}, categoria ${category}`,
    );

    // 1. Buscar preferências do usuário
    const preferences = await this.prisma.userNotificationPreference.findFirst({
      where: { userId, storeId, category },
    });

    // 2. PUSH (prioridade custo zero)
    if (!preferences || preferences.push) {
      const tokens = await this.prisma.pushToken.findMany({
        where: { userId, isActive: true },
      });
      if (tokens.length > 0) {
        this.logger.log(
          `Enviando PUSH para tokens: ${tokens.map((t) => t.expoToken).join(', ')}`,
        );
        const pushOk = await this.pushProvider.send(
          tokens.map((t) => t.expoToken),
          payload,
        );
        if (pushOk && notificationId) {
          await this.prisma.notification.update({
            where: { id: notificationId },
            data: { status: 'SENT', channel: 'PUSH' },
          });
          return { status: 'sent', channel: 'PUSH' };
        }
      }
    }

    // 3. WhatsApp (Meta/Zenvia) para categorias críticas
    if (
      (!preferences || preferences.whatsapp) &&
      ['APPOINTMENT_REMINDER', 'PAYMENT_REMINDER'].includes(category)
    ) {
      // Buscar telefone do usuário
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      const templateMap = {
        APPOINTMENT_REMINDER: 'lembrete_pet_v1',
        ORDER_CONFIRMED: 'pedido_recebido_v2',
        PAYMENT_REMINDER: 'pix_pendente_v1',
      };
      const templateId = templateMap[category] || '';
      this.logger.log('Enviando WhatsApp via template mapeado');
      const waOk = user?.phone
        ? await this.whatsappProvider.send(user.phone, templateId, payload)
        : false;
      if (waOk && notificationId) {
        await this.prisma.notification.update({
          where: { id: notificationId },
          data: { status: 'SENT', channel: 'WHATSAPP' },
        });
        return { status: 'sent', channel: 'WHATSAPP' };
      }
    }

    // 4. SMS (Zenvia) para OTP ou fallback urgente
    if (
      (!preferences || preferences.sms) &&
      (category === 'OTP' ||
        ['APPOINTMENT_REMINDER', 'PAYMENT_REMINDER'].includes(category))
    ) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      this.logger.log('Enviando SMS via Zenvia');
      const smsOk = user?.phone
        ? await this.smsProvider.send(user.phone, payload?.message || '')
        : false;
      if (smsOk && notificationId) {
        await this.prisma.notification.update({
          where: { id: notificationId },
          data: { status: 'SENT', channel: 'SMS' },
        });
        return { status: 'sent', channel: 'SMS' };
      }
    }

    // 5. E-mail transacional (SendGrid) para ORDER_CONFIRMED
    if ((!preferences || preferences.email) && category === 'ORDER_CONFIRMED') {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      this.logger.log('Enviando E-mail transacional');
      const emailOk = user?.email
        ? await this.emailProvider.send(
            user.email,
            'Confirmação de Pedido',
            payload?.message || '',
          )
        : false;
      if (emailOk && notificationId) {
        await this.prisma.notification.update({
          where: { id: notificationId },
          data: { status: 'SENT', channel: 'EMAIL' as NotificationChannel },
        });
        return { status: 'sent', channel: 'EMAIL' };
      }
    }

    // Se nada foi enviado
    if (notificationId) {
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: 'FAILED',
          error: 'Nenhum canal disponível ou permitido',
        },
      });
    }
    return { status: 'failed', reason: 'Nenhum canal disponível ou permitido' };
  }
}
