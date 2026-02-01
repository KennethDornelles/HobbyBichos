import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from '../../notifications/notification.service';
import { TransactionType } from '@prisma/client';

export interface PointsEarnedEvent {
  accountId: string;
  userId: string;
  points: number;
  type: TransactionType;
}

@Injectable()
export class LoyaltyNotificationListener {
  private readonly logger = new Logger(LoyaltyNotificationListener.name);

  constructor(private readonly notificationService: NotificationService) {}

  @OnEvent('loyalty.points.earned')
  async handlePointsEarned(event: PointsEarnedEvent) {
    this.logger.log(
      `🔔 Processando notificação de pontos: ${event.points} pontos (${event.type}) para userId=${event.userId}`,
    );

    let title = 'Você ganhou pontos! 💰';
    let body = `Você acabou de receber ${event.points} pontos no programa de fidelidade.`;

    switch (event.type) {
      case TransactionType.BIRTHDAY:
        title = 'Feliz Aniversário! 🎂';
        body = `Parabéns! Presenteamos você com ${event.points} pontos para celebrar seu dia especial! 🎉`;
        break;
      case TransactionType.WELCOME_BONUS:
        title = 'Bem-vindo ao Clube! 🌟';
        body = `Obrigado por se juntar a nós! Você ganhou ${event.points} de bônus de boas-vindas.`;
        break;
      case TransactionType.PURCHASE:
        title = 'Compra Confirmada 🛍️';
        body = `Sua compra rendeu ${event.points} pontos! Continue acumulando para trocar por prêmios.`;
        break;
      case TransactionType.CHECK_IN:
        title = 'Check-in Realizado ✅';
        body = `Ganhou ${event.points} pontos por nos visitar hoje. Volte sempre!`;
        break;
      case TransactionType.REFERRAL:
        title = 'Indicação Sucesso 🤝';
        body = `Seu amigo se cadastrou! Você ganhou ${event.points} pontos pela indicação.`;
        break;
      case TransactionType.REVIEW:
        title = 'Obrigado pela Avaliação ⭐';
        body = `Sua opinião vale muito! Você ganhou ${event.points} pontos por avaliar nosso serviço.`;
        break;
      case TransactionType.SHARE:
        title = 'Você compartilhou! 📲';
        body = `Obrigado por divulgar! Ganhou ${event.points} pontos pelo compartilhamento.`;
        break;
      case TransactionType.ADMIN_ADJUSTMENT:
        title = 'Ajuste de Pontos 🔧';
        body = `Seu saldo foi ajustado com ${event.points} pontos extra.`;
        break;
    }

    try {
      await this.notificationService.enqueueNotification({
        userId: event.userId,
        category: 'MARKETING', // Fidelidade entra como Marketing/Engajamento
        payload: {
          title,
          body,
          data: {
            screen: 'loyalty', // Redireciona para tela de fidelidade ao clicar
            type: 'POINTS_EARNED',
            points: event.points,
          },
        },
      });
      this.logger.log(`✅ Notificação de pontos enviada para userId=${event.userId}`);
    } catch (error) {
      this.logger.error(
        `❌ Erro ao enviar notificação de pontos para userId=${event.userId}`,
        error,
      );
    }
  }
}
