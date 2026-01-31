import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../database/prisma.service';
import { PushProvider } from '../providers';
import { addDays, startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class PointsExpirationJob {
  private readonly logger = new Logger(PointsExpirationJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pushProvider: PushProvider,
  ) {}

  // Executar todo dia às 09:00 da manhã
  @Cron('0 09 * * *')
  async handleCron() {
    this.logger.log('⏳ Iniciando verificação de expiração de pontos...');

    await this.checkExpiration(7); // Avisar com 7 dias
    await this.checkExpiration(1); // Avisar com 1 dia (amanhã)

    this.logger.log('✅ Verificação de expiração concluída.');
  }

  private async checkExpiration(daysUntil: number) {
    const targetDateStart = startOfDay(addDays(new Date(), daysUntil));
    const targetDateEnd = endOfDay(addDays(new Date(), daysUntil));

    // Buscar transações que expiram EXATAMENTE nesse dia
    // E que ainda não foram totalmente consumidas/expiradas (campo `expired: false`)
    // Obs: A lógica exata de consumo de pontos pode ser complexa (FIFO), 
    // mas aqui simplificamos avisando se houver QUALQUER transação expirando.
    const transactions = await this.prisma.loyaltyTransaction.findMany({
      where: {
        expiresAt: {
          gte: targetDateStart,
          lte: targetDateEnd,
        },
        expired: false, // Pontos ainda válidos
        points: { gt: 0 }, // Apenas transações de ganho
        account: {
          user: {
            pushTokens: { some: { isActive: true } },
            userNotificationPreferences: {
                none: {
                    category: 'MARKETING', // Expiração de pontos pode ser alerta ou mkt
                    push: false
                }
            }
          },
        },
      },
      include: {
        account: {
          include: {
            user: {
              include: {
                pushTokens: { where: { isActive: true } },
              },
            },
          },
        },
      },
    });

    if (transactions.length === 0) return;

    this.logger.log(`📢 Avisando ${transactions.length} usuários sobre expiração em ${daysUntil} dias.`);

    // Agrupar por usuário para não mandar múltiplos pushes
    const usersToNotify = new Set<string>();

    for (const trx of transactions) {
      if (usersToNotify.has(trx.account.userId)) continue;
      usersToNotify.add(trx.account.userId);

      const user = trx.account.user;
      const tokens = user.pushTokens.map((t) => t.expoToken);

      let title = 'Seus pontos vão expirar! ⏳';
      let body = `Você tem pontos no Programa de Fidelidade expirando em ${daysUntil} dias. Aproveite para usar agora!`;

      if (daysUntil === 1) {
        title = 'Última chamada! Seus pontos expiram amanhã 😱';
        body = 'Corra para trocar seus pontos antes que eles percam a validade.';
      }

      const sent = await this.pushProvider.send(tokens, { title, body, data: { type: 'LOYALTY_EXPIRATION' } });

      if (sent) {
        await this.prisma.notification.create({
          data: {
            userId: user.id,
            storeId: null,
            title,
            body,
            category: 'MARKETING',
            channel: 'PUSH',
            status: 'SENT',
          },
        });
      }
    }
  }
}
