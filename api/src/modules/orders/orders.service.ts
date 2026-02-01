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
export interface AuthUser {
  id: string;
  storeId: string;
  role?: string;
}

// Tipo estendido da Store com campos opcionais
// Tipo estendido da Store para garantir a presença dos campos, mesmo se o cache do Prisma estiver desatualizado
type StoreWithPayment = Store & {
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

import { EventEmitter2 } from '@nestjs/event-emitter';
import { CommissionsService } from '../commissions/commissions.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly commissionsService: CommissionsService,
  ) {}

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

    // Validação de acesso à loja: apenas OWNER/MANAGER precisam ter storeId
    // Clientes (CLIENT role) podem comprar de qualquer loja
    if (user.role && !['CLIENT'].includes(user.role)) {
      // Se for OWNER/MANAGER, valida se está tentando acessar a loja correta
      if (createOrderDto.storeId !== user.storeId) {
        throw new ForbiddenException('Acesso negado à loja');
      }
    }

    // Validar que a loja existe
    const store = await this.prisma.store.findUnique({
      where: { id: createOrderDto.storeId },
    });

    if (!store) {
      throw new NotFoundException('Loja não encontrada');
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
              professionalId: item.professionalId,
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
    const storeData: StoreWithPayment =
      order.store ||
      ((await this.prisma.store.findUnique({
        where: { id: order.storeId },
      })) as StoreWithPayment);

    // Validação do WhatsApp da loja
    if (!storeData?.whatsappNumber) {
      throw new PreconditionFailedException(
        'A loja precisa configurar o número do WhatsApp para pagamentos.',
      );
    }

    // Gera o link do WhatsApp
    const whatsappLink = this.generateWhatsAppLink(order, storeData);

    return {
      order,
      paymentAction: {
        whatsappLink,
        pixKey: storeData.pixKey,
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

    // Gerar ID curto de 8 caracteres para rastreamento
    const shortOrderId = order.id.substring(0, 8).toUpperCase();

    console.log('🆔 Order ID completo:', order.id);
    console.log('📦 Short Order ID:', shortOrderId);
    console.log('💰 Total formatado:', totalFormatted);

    const message =
      `🛒 *PEDIDO HOBBY BICHOS*\n\n` +
      `📦 Pedido: ${shortOrderId}\n` +
      `💰 Total: ${totalFormatted}\n\n` +
      `Olá! Gostaria de *finalizar o pagamento* do pedido via PIX.\n\n` +
      `🆔 ID Completo: ${order.id}`;

    console.log('📝 Mensagem antes do encode:', message);

    const text = encodeURIComponent(message);

    const whatsappLink = `https://wa.me/${store.whatsappNumber}?text=${text}`;
    console.log('📱 WhatsApp Link gerado:', whatsappLink);

    return whatsappLink;
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

    // Apenas OWNER/MANAGER/EMPLOYEE/SUPER_ADMIN podem finalizar pedidos
    const allowedRoles = ['OWNER', 'MANAGER', 'EMPLOYEE', 'SUPER_ADMIN'];
    if (user.role && !allowedRoles.includes(user.role)) {
      throw new ForbiddenException(
        'Você não tem permissão para finalizar o pagamento deste pedido.',
      );
    }

    if (order.storeId !== user.storeId) {
      throw new ForbiddenException('Acesso negado à loja');
    }

    if (order.status === 'PAID') {
      throw new ForbiddenException('Pedido já finalizado');
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

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID' },
      include: {
        orderItems: true,
      },
    });

    // Emitir evento para processamento assíncrono (ex: monitor de estoque, fidelidade)
    this.eventEmitter.emit('order.completed', {
      orderId: updatedOrder.id,
      storeId: updatedOrder.storeId,
      userId: updatedOrder.userId,
      total: Number(updatedOrder.total),
    });

    // Calculate Commissions
    this.commissionsService.calculateForOrder(updatedOrder.id);

    return updatedOrder;
  }

  async findAll(user: AuthUser) {
    // CLIENT vê apenas seus próprios pedidos (exceto cancelados)
    if (!user.role || user.role === 'CLIENT') {
      return this.prisma.order.findMany({
        where: {
          userId: user.id,
          status: { not: 'CANCELLED' },
        },
        include: {
          orderItems: {
            include: {
              product: true,
              service: true,
            },
          },
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
              whatsappNumber: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // OWNER/MANAGER veem pedidos da sua loja (exceto cancelados)
    return this.prisma.order.findMany({
      where: {
        storeId: user.storeId,
        status: { not: 'CANCELLED' },
      },
      include: {
        orderItems: {
          include: {
            product: true,
            service: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancelOrder(orderId: string, user: AuthUser) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    // CLIENT pode cancelar seus próprios pedidos
    if (!user.role || user.role === 'CLIENT') {
      if (order.userId !== user.id) {
        throw new ForbiddenException('Você não pode cancelar este pedido');
      }
    } else {
      // OWNER/MANAGER podem cancelar pedidos da sua loja
      if (order.storeId !== user.storeId) {
        throw new ForbiddenException('Acesso negado à loja');
      }
    }

    if (order.status === 'CANCELLED') {
      throw new ForbiddenException('Pedido já está cancelado');
    }

    if (order.status === 'DELIVERED') {
      throw new ForbiddenException(
        'Não é possível cancelar um pedido já entregue',
      );
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
      include: {
        orderItems: true,
      },
    });
  }

  async findOne(id: string, user: AuthUser) {
    // Construir filtro baseado no tipo de usuário
    const where: any = { id };

    // Se o usuário for funcionário de loja, filtrar por storeId
    if (user.storeId) {
      where.storeId = user.storeId;
    } else {
      // Se for cliente, filtrar por userId
      where.userId = user.id;
    }

    const order = await this.prisma.order.findFirst({
      where,
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
        `Olá! Gostaria de *finalizar o pagamento* do pedido ${order.id} na Hobby Bichos. Total: ${totalFormatted}.`,
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

  async testUpdateStatus(id: string, newStatus: string, user: AuthUser) {
    // Verificar se o pedido existe
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    // Permitir apenas para store employees ou se for proprietário
    if (
      user.storeId &&
      order.storeId !== user.storeId &&
      order.userId !== user.id
    ) {
      throw new ForbiddenException('Sem permissão para atualizar este pedido');
    }

    // Validar status
    const validStatuses = [
      'WAITING_PAYMENT',
      'PAID',
      'PROCESSING',
      'DELIVERED',
      'CANCELLED',
    ];
    if (!validStatuses.includes(newStatus)) {
      throw new PreconditionFailedException(
        `Status inválido. Válidos: ${validStatuses.join(', ')}`,
      );
    }

    // Atualizar status
    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: newStatus },
    });

    return updated;
  }
}
