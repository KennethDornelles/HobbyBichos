import { Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  PushProvider,
  WhatsAppProvider,
  SmsProvider,
  EmailProvider,
} from './providers';
import type { NotificationCategory, NotificationChannel } from '@prisma/client';

@Processor('notification_queue')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  private pushProvider = new PushProvider();
  private whatsappProvider = new WhatsAppProvider();
  private smsProvider = new SmsProvider();
  private emailProvider = new EmailProvider();

  constructor(private readonly prisma: PrismaService) {}

  async process(job: Job) {
    const { userId, storeId, category, payload } = job.data as {
      userId: string;
      storeId: string;
      category: NotificationCategory;
      payload: any;
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
        if (pushOk) {
          await this.prisma.notification.create({
            data: {
              userId,
              storeId,
              status: 'SENT',
              category,
              channel: 'PUSH',
              payload,
            },
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
      if (waOk) {
        await this.prisma.notification.create({
          data: {
            userId,
            storeId,
            status: 'SENT',
            category,
            channel: 'WHATSAPP',
            payload,
          },
        });
        return { status: 'sent', channel: 'WHATSAPP' };
      }
    }

    // 4. SMS (Zenvia) para OTP ou fallback urgente
    if (
      (!preferences || preferences.sms) &&
      (category === 'OTP' || ['APPOINTMENT_REMINDER', 'PAYMENT_REMINDER'].includes(category))
    ) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      this.logger.log('Enviando SMS via Zenvia');
      const smsOk = user?.phone
        ? await this.smsProvider.send(user.phone, payload?.message || '')
        : false;
      if (smsOk) {
        await this.prisma.notification.create({
          data: {
            userId,
            storeId,
            status: 'SENT',
            category,
            channel: 'SMS',
            payload,
          },
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
      if (emailOk) {
        await this.prisma.notification.create({
          data: {
            userId,
            storeId,
            status: 'SENT',
            category,
            channel: 'EMAIL' as NotificationChannel,
            payload,
          },
        });
        return { status: 'sent', channel: 'EMAIL' };
      }
    }

    // Se nada foi enviado
    await this.prisma.notification.create({
      data: {
        userId,
        storeId,
        status: 'FAILED',
        category,
        channel: 'PUSH' as NotificationChannel, // fallback para PUSH, pode ser ajustado
        payload,
        error: 'Nenhum canal disponível ou permitido',
      },
    });
    return { status: 'failed', reason: 'Nenhum canal disponível ou permitido' };
  }
}
