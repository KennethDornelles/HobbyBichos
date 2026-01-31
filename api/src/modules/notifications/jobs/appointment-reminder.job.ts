import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../database/prisma.service';
import { NotificationService } from '../notification.service';
import { addHours, subMinutes, startOfHour, endOfHour } from 'date-fns';

@Injectable()
export class AppointmentReminderJob {
  private readonly logger = new Logger(AppointmentReminderJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.log('⏳ Iniciando verificação de lembretes de agendamento...');

    await this.send24hReminders();
    await this.send2hReminders();

    this.logger.log('✅ Verificação de lembretes concluída.');
  }

  private async send24hReminders() {
    // Definir janela de tempo: Agora + 24h (com tolerância da hora atual)
    // Ex: Se agora é 10:00, buscamos agendamentos entre 10:00 e 10:59 de amanhã
    const now = new Date();
    const targetStart = startOfHour(addHours(now, 24));
    const targetEnd = endOfHour(addHours(now, 24));

    await this.processReminders(targetStart, targetEnd, '24h');
  }

  private async send2hReminders() {
    // Definir janela de tempo: Agora + 2h
    const now = new Date();
    const targetStart = startOfHour(addHours(now, 2));
    const targetEnd = endOfHour(addHours(now, 2));

    await this.processReminders(targetStart, targetEnd, '2h');
  }

  private async processReminders(start: Date, end: Date, type: string) {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        startsAt: {
          gte: start,
          lte: end,
        },
        status: 'SCHEDULED',
        user: {
          pushTokens: {
            some: { isActive: true }, // Apenas usuários com token ativo
          },
          userNotificationPreferences: {
            none: {
              category: 'APPOINTMENT_REMINDER',
              push: false, // Ignorar se usuário desativou esta categoria
            }
          }
        },
      },
      include: {
        user: {
          include: {
            pushTokens: {
              where: { isActive: true },
            },
          },
        },
        pet: true,
        service: true,
      },
    });

    if (appointments.length === 0) {
      this.logger.log(`Nenhum agendamento encontrado para lembrete de ${type}.`);
      return;
    }

    this.logger.log(`📢 Enviando ${appointments.length} lembretes de ${type}...`);

    for (const appointment of appointments) {
      const tokens = appointment.user.pushTokens.map((t) => t.expoToken);
      if (tokens.length === 0) continue;

      const timeString = appointment.startsAt.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      let title = 'Lembrete de Agendamento 📅';
      let body = `Não esqueça! ${appointment.pet.name} tem ${appointment.service.name} amanhã às ${timeString}.`;

      if (type === '2h') {
        title = 'Seu agendamento é logo mais! ⏰';
        body = `Oi! ${appointment.pet.name} tem ${appointment.service.name} hoje às ${timeString}. Estamos esperando!`;
      }

      // Enfileira notificação (BullMQ)
      await this.notificationService.enqueueNotification({
        userId: appointment.user.id,
        storeId: appointment.storeId,
        category: 'APPOINTMENT_REMINDER',
        payload: {
          title,
          body,
          data: {
            type: 'APPOINTMENT_REMINDER',
            appointmentId: appointment.id,
          },
        },
      });
    }
  }
}
