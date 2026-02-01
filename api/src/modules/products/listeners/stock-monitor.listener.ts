import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../database/prisma.service';
import { NotificationService } from '../../notifications/notification.service';
import { UsersService } from '../../users/users.service';

@Injectable()
export class StockMonitorListener {
  private readonly logger = new Logger(StockMonitorListener.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly usersService: UsersService,
  ) {}

  @OnEvent('order.completed')
  async handleOrderCompleted(event: { orderId: string; storeId: string }) {
    this.logger.log(`🔍 Verificando estoque após pedido ${event.orderId}`);

    // 1. Buscar itens do pedido para saber quais produtos foram vendidos
    const orderItems = await this.prisma.orderItem.findMany({
      where: { orderId: event.orderId, productId: { not: null } },
      include: {
        product: {
            include: {
                stocks: {
                    where: { storeId: event.storeId }
                }
            }
        }
      },
    });

    for (const item of orderItems) {
      if (!item.product || !item.product.stocks.length) continue;

      const stock = item.product.stocks[0] as any;

      // 2. Verificar se estoque está abaixo do mínimo
      if (stock.quantity <= stock.minStock) {
        this.logger.warn(
          `⚠️ ESTOQUE BAIXO: ${item.product.name} (Atual: ${stock.quantity}, Mín: ${stock.minStock})`,
        );

        // 3. Notificar Gerentes
        await this.notifyManagers(event.storeId, item.product.name, stock.quantity);
      }
    }
  }

  private async notifyManagers(storeId: string, productName: string, quantity: number) {
    // Buscar todos os funcionários com role MANAGER ou OWNER desta loja
    const managers = await this.usersService.findEmployeesByStore(storeId);

    for (const manager of managers) {
        // Enviar Push usa EnqueueNotification
        // Como employees também são users, o userId serve
      try {
        await this.notificationService.enqueueNotification({
          userId: manager.id,
          category: 'Warning', // Warning category
          payload: {
            title: '⚠️ Alerta de Estoque Baixo',
            body: `O produto "${productName}" está acabando! Restam apenas ${quantity} unidades.`,
            data: {
              screen: 'manager_stock',
              type: 'LOW_STOCK',
            },
          },
        });
      } catch (e) {
        this.logger.error(`Erro ao notificar gerente ${manager.id}`, e);
      }
    }
  }
}
