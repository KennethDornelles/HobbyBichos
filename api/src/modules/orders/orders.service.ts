import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  PreconditionFailedException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, Store, Prisma } from '@prisma/client';

// Interface para o usuário autenticado
interface AuthUser {
  id: string;
  storeId: string;
  role?: string;
}

// Tipo estendido da Store com campos opcionais
type StoreWithPayment = Store & {
  whatsappNumber: string | null;
  pixKey: string | null;
};

// Tipo do pedido com relações
type OrderWithRelations = Order & {
  orderItems: Array<{
    id: string;
    productId: string | null;
    serviceId: string | null;
    quantity: number;
    price: Prisma.Decimal;
    orderId: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  store?: StoreWithPayment;
};

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto, user: AuthUser) {
    // Validação: pedido deve ter pelo menos 1 item
    if (
      !createOrderDto.items ||
      !Array.isArray(createOrderDto.items) ||
      createOrderDto.items.length === 0
    ) {
      const { BadRequestException } = await import('@nestjs/common');
      throw new BadRequestException('Pedido deve conter ao menos um item');
    }
    // Validação de acesso à loja
    if (createOrderDto.storeId !== user.storeId) {
      throw new ForbiddenException('Acesso negado à loja');
    }

    // Calcule o total do pedido
    const total = createOrderDto.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );

    // Status inicial
    const status = 'WAITING_PAYMENT';

    // Criação do pedido com os itens em uma única transação
    const order = (await this.prisma.order.create({
      data: {
        storeId: createOrderDto.storeId,
        userId: user.id,
        total,
        status,
        orderItems: {
          createMany: {
            data: createOrderDto.items.map((item) => ({
              productId: item.productId,
              serviceId: item.serviceId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      },
      include: {
        orderItems: true,
        store: true,
      },
    })) as OrderWithRelations;

    // Busca dados da loja (whatsappNumber, pixKey)
    const store: StoreWithPayment =
      order.store ||
      ((await this.prisma.store.findUnique({
        where: { id: order.storeId },
      })) as StoreWithPayment);

    // Validação do WhatsApp da loja
    if (!store?.whatsappNumber) {
      throw new PreconditionFailedException(
        'A loja precisa configurar o número do WhatsApp para pagamentos.',
      );
    }

    // Gera o link do WhatsApp
    const whatsappLink = this.generateWhatsAppLink(order, store);

    return {
      order,
      paymentAction: {
        whatsappLink,
        pixKey: store.pixKey,
        orderTotal: total,
      },
    };
  }

  // Método privado para gerar o link do WhatsApp
  private generateWhatsAppLink(
    order: OrderWithRelations,
    store: StoreWithPayment,
  ): string {
    const totalFormatted = Number(order.total).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    const text = encodeURIComponent(
      `Olá! Fiz o pedido #${order.id} na Hobby Bichos. Total: ${totalFormatted}. Segue meu pedido para pagamento via PIX.`,
    );
    return `https://wa.me/${store.whatsappNumber}?text=${text}`;
  }

  async finishOrder(orderId: string, user: AuthUser) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    if (order.storeId !== user.storeId) {
      throw new ForbiddenException('Acesso negado à loja');
    }

    if (order.status === 'PAID') {
      throw new ForbiddenException('Pedido já finalizado');
    }

    // Permissão: apenas OWNER ou MANAGER podem finalizar
    if (user.role && !['OWNER', 'MANAGER'].includes(user.role)) {
      throw new ForbiddenException(
        'Apenas administradores podem finalizar o pagamento.',
      );
    }

    // Atualiza estoque dos produtos
    for (const item of order.orderItems) {
      if (item.productId) {
        const productStoreId = user.storeId;
        const stock = await this.prisma.productStock.findUnique({
          where: {
            productId_storeId: {
              productId: item.productId,
              storeId: productStoreId,
            },
          },
        });

        if (!stock || stock.quantity < item.quantity) {
          throw new ForbiddenException('Estoque insuficiente');
        }

        await this.prisma.productStock.update({
          where: {
            productId_storeId: {
              productId: item.productId,
              storeId: productStoreId,
            },
          },
          data: {
            quantity: { decrement: item.quantity },
          },
        });
      }
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID' },
      include: {
        orderItems: true,
      },
    });
  }

  async findAll(userStoreId: string) {
    return this.prisma.order.findMany({
      where: { storeId: userStoreId },
      include: {
        orderItems: true,
      },
    });
  }

  async findOne(id: string, userStoreId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, storeId: userStoreId },
      include: {
        orderItems: true,
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            phone: true,
            whatsappNumber: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }
    // Replicar lógica do create para retornar paymentAction
    const store = order.store;
    let whatsappLink: string | null = null;
    if (store?.whatsappNumber) {
      const totalFormatted = Number(order.total).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
      const text = encodeURIComponent(
        `Olá! Fiz o pedido #${order.id} na Hobby Bichos. Total: ${totalFormatted}. Segue meu pedido para pagamento via PIX.`,
      );
      whatsappLink = `https://wa.me/${store.whatsappNumber}?text=${text}`;
    }
    // Retornar os dados do pedido no nível raiz + paymentAction
    return {
      ...order,
      paymentAction: {
        whatsappLink,
        orderTotal: Number(order.total),
      },
    };
  }
}
