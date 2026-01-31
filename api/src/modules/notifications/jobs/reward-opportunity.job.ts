import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../database/prisma.service';
import { PushProvider } from '../providers';

@Injectable()
export class RewardOpportunityJob {
  private readonly logger = new Logger(RewardOpportunityJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pushProvider: PushProvider,
  ) {}

  // Executar toda Sexta-feira às 11:00 (pré-fim de semana)
  @Cron('0 11 * * 5')
  async handleCron() {
    this.logger.log('⏳ Iniciando Job "Reward Opportunity" (Sexta-feira)...');

    // 1. Buscar recompensas ativas e "baratas" para sugerir (ex: até 500 pontos)
    // ou buscar a recompensa mais barata para ter uma base.
    const rewards = await this.prisma.loyaltyReward.findMany({
      where: { isActive: true },
      orderBy: { pointsCost: 'asc' },
      take: 3, // Pegar as 3 mais acessíveis
    });

    if (rewards.length === 0) {
      return;
    }

    const minPointsNeeded = rewards[0].pointsCost;

    // 2. Buscar usuários com saldo suficiente
    const accounts = await this.prisma.loyaltyAccount.findMany({
      where: {
        currentPoints: {
          gte: minPointsNeeded, // Tem pelo menos o mínimo pra trocar
        },
        user: {
            pushTokens: { some: { isActive: true } },
             userNotificationPreferences: {
                none: {
                    category: 'MARKETING',
                    push: false
                }
            }
        }
      },
      include: {
        user: {
            include: {
                pushTokens: { where: { isActive: true } }
            }
        }
      }
    });

    if (accounts.length === 0) {
        this.logger.log('Nenhum usuário elegível para recompensas hoje.');
        return;
    }

    this.logger.log(`📢 Notificando ${accounts.length} usuários com saldo para recompensas...`);

    for (const account of accounts) {
        const user = account.user;
        const tokens = user.pushTokens.map(t => t.expoToken);
        
        // Personaliza mensagem com a melhor recompensa que ele pode pegar
        const affordableReward = rewards.reverse().find(r => r.pointsCost <= account.currentPoints) || rewards[0];

        const title = 'Sextou com Prêmios! 🎁';
        const body = `Você tem ${account.currentPoints} pontos! Já dá para trocar por um(a) ${affordableReward.name}. Aproveite o fim de semana!`;

        const sent = await this.pushProvider.send(tokens, { title, body, data: { type: 'REWARD_OPPORTUNITY' } });

        if (sent) {
            await this.prisma.notification.create({
              data: {
                userId: user.id,
                storeId: null,
                title,
                body,
                category: 'MARKETING',
                channel: 'PUSH', // Assumindo canal PUSH
                status: 'SENT',
              },
            });
        }
    }
    
    this.logger.log('✅ Job "Reward Opportunity" concluído.');
  }
}
