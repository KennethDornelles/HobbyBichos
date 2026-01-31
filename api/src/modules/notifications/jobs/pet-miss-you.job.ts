import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../database/prisma.service';
import { PushProvider } from '../providers';
import { subDays, startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class PetMissYouJob {
  private readonly logger = new Logger(PetMissYouJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pushProvider: PushProvider,
  ) {}

  // Executar todo dia às 10:00 da manhã
  @Cron('0 10 * * *')
  async handleCron() {
    this.logger.log('⏳ Iniciando Job "Pet Miss You" (Re-engajamento)...');

    // Data limite: 30 dias atrás
    const thirtyDaysAgoStart = startOfDay(subDays(new Date(), 30));
    const thirtyDaysAgoEnd = endOfDay(subDays(new Date(), 30));

    // Buscar pets cujo último agendamento foi há exatamente 30 dias
    // (Para não spammar todo dia, pegamos apenas quem "bateu" a marca de 30 dias hoje)
    const pets = await this.prisma.pet.findMany({
      where: {
        appointments: {
          some: {
            startsAt: {
              gte: thirtyDaysAgoStart,
              lte: thirtyDaysAgoEnd,
            },
          },
          // Garantir que não teve agendamento POSTERIOR a essa data (realmente sumiu)
          none: {
            startsAt: {
              gt: thirtyDaysAgoEnd,
            },
          },
        },
        owner: {
          pushTokens: { some: { isActive: true } },
          userNotificationPreferences: {
            none: {
              category: 'MARKETING', // Miss You conta como Marketing/Engajamento
              push: false,
            },
          },
        },
      },
      include: {
        owner: {
          include: {
            pushTokens: { where: { isActive: true } },
          },
        },
      },
    });

    if (pets.length === 0) {
      this.logger.log('Nenhum pet encontrado para re-engajamento hoje.');
      return;
    }

    this.logger.log(`📢 Enviando "Saudades" para ${pets.length} pets...`);

    for (const pet of pets) {
      const tokens = pet.owner.pushTokens.map((t) => t.expoToken);
      if (tokens.length === 0) continue;

      const title = `${pet.name} está com saudades! 🐾`;
      const body = `Faz tempo que não vemos o ${pet.name}. Que tal agendar um momento especial de cuidados?`;

      // Envia Push
      const sent = await this.pushProvider.send(tokens, {
        title,
        body,
        data: {
            type: 'MARKETING',
            petId: pet.id
        }
      });

      if (sent) {
        await this.prisma.notification.create({
          data: {
            userId: pet.owner.id,
            storeId: pet.storeId,
            title,
            body,
            category: 'MARKETING',
            channel: 'PUSH',
            status: 'SENT',
          },
        });
      }
    }
    
    this.logger.log('✅ Job "Pet Miss You" concluído.');
  }
}
