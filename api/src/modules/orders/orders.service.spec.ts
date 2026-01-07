import { OrdersService } from './orders.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import {
  PrismaClient,
  Order,
  Store,
  ProductStock,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

// Tipos auxiliares para os testes
type StoreWithWhatsapp = Store & {
  whatsappNumber?: string | null;
  pixKey?: string | null;
};

type OrderItemComplete = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  orderId: string;
  storeId: string;
  productId: string | null;
  serviceId: string | null;
  quantity: number;
  price: number;
};

type OrderWithRelations = Order & {
  orderItems: OrderItemComplete[];
  store: StoreWithWhatsapp;
};

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    service = new OrdersService(prisma as unknown as PrismaService);
  });

  describe('create', () => {
    const user = { id: 'user1', storeId: 'store1' };
    const store: StoreWithWhatsapp = {
      id: 'store1',
      createdAt: new Date(),
      updatedAt: new Date(),
      name: 'Test Store',
      slug: 'test-store',
      phone: '5511999999999',
      isActive: true,
      whatsappNumber: '5511999999999',
      pixKey: 'pixkey',
    };
    const items = [
      { productId: 'p1', price: 10, quantity: 2 },
      { productId: 'p2', price: 5, quantity: 1 },
    ];
    const createOrderDto = { storeId: 'store1', items };

    it('deve lançar ForbiddenException se storeId for diferente', async () => {
      await expect(
        service.create({ ...createOrderDto, storeId: 'outra' }, user),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve calcular o total corretamente', async () => {
      const mockOrder: OrderWithRelations = {
        id: '1',
        total: new Prisma.Decimal(25),
        status: 'WAITING_PAYMENT',
        createdAt: new Date(),
        updatedAt: new Date(),
        storeId: 'store1',
        userId: 'user1',
        orderItems: items.map((item, index) => ({
          id: `item${index}`,
          orderId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
          storeId: 'store1',
          productId: item.productId,
          serviceId: null,
          quantity: item.quantity,
          price: item.price,
        })),
        store: store,
      };

      prisma.order.create.mockResolvedValue(mockOrder);
      prisma.store.findUnique.mockResolvedValue(store);

      const result = await service.create(createOrderDto, user);
      expect(Number(result.order.total)).toBe(25);
      expect(result.paymentAction.orderTotal).toBe(25);
    });

    it('deve lançar erro se loja não tem whatsapp', async () => {
      const storeWithoutWhatsapp: StoreWithWhatsapp = {
        ...store,
        whatsappNumber: null,
      };

      const mockOrder: OrderWithRelations = {
        id: '1',
        total: new Prisma.Decimal(25),
        status: 'WAITING_PAYMENT',
        createdAt: new Date(),
        updatedAt: new Date(),
        storeId: 'store1',
        userId: 'user1',
        orderItems: items.map((item, index) => ({
          id: `item${index}`,
          orderId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
          storeId: 'store1',
          productId: item.productId,
          serviceId: null,
          quantity: item.quantity,
          price: item.price,
        })),
        store: storeWithoutWhatsapp,
      };

      prisma.order.create.mockResolvedValue(mockOrder);
      prisma.store.findUnique.mockResolvedValue(storeWithoutWhatsapp);

      await expect(service.create(createOrderDto, user)).rejects.toThrow();
    });

    it('deve gerar link do WhatsApp corretamente', async () => {
      const mockOrder: OrderWithRelations = {
        id: '1',
        total: new Prisma.Decimal(25),
        status: 'WAITING_PAYMENT',
        createdAt: new Date(),
        updatedAt: new Date(),
        storeId: 'store1',
        userId: 'user1',
        orderItems: items.map((item, index) => ({
          id: `item${index}`,
          orderId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
          storeId: 'store1',
          productId: item.productId,
          serviceId: null,
          quantity: item.quantity,
          price: item.price,
        })),
        store: store,
      };

      prisma.order.create.mockResolvedValue(mockOrder);
      prisma.store.findUnique.mockResolvedValue(store);

      const result = await service.create(createOrderDto, user);
      expect(result.paymentAction.whatsappLink).toContain('wa.me');
      expect(result.paymentAction.whatsappLink).toContain(store.whatsappNumber);
    });
  });

  describe('finishOrder', () => {
    const user = { id: 'user1', storeId: 'store1', role: 'OWNER' };

    const orderItem: OrderItemComplete = {
      id: 'item1',
      orderId: 'order1',
      createdAt: new Date(),
      updatedAt: new Date(),
      storeId: 'store1',
      productId: 'p1',
      serviceId: null,
      quantity: 1,
      price: 10,
    };

    type OrderWithItems = Order & {
      orderItems: OrderItemComplete[];
    };

    const order: OrderWithItems = {
      id: 'order1',
      storeId: 'store1',
      status: 'WAITING_PAYMENT',
      total: new Prisma.Decimal(10),
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user1',
      orderItems: [orderItem],
    };

    it('deve lançar NotFoundException se pedido não existe', async () => {
      prisma.order.findUnique.mockResolvedValue(null);
      await expect(service.finishOrder('order1', user)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar ForbiddenException se storeId diferente', async () => {
      const orderWithDifferentStore: OrderWithItems = {
        ...order,
        storeId: 'outra',
      };

      prisma.order.findUnique.mockResolvedValue(orderWithDifferentStore);
      await expect(service.finishOrder('order1', user)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('deve lançar ForbiddenException se já pago', async () => {
      const paidOrder: OrderWithItems = {
        ...order,
        status: 'PAID',
      };

      prisma.order.findUnique.mockResolvedValue(paidOrder);
      await expect(service.finishOrder('order1', user)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('deve lançar ForbiddenException se não for OWNER/MANAGER', async () => {
      prisma.order.findUnique.mockResolvedValue(order);
      await expect(
        service.finishOrder('order1', { ...user, role: 'USER' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar ForbiddenException se estoque insuficiente', async () => {
      const productStock: ProductStock = {
        id: 'stock1',
        quantity: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        storeId: 'store1',
        productId: 'p1',
      };

      prisma.order.findUnique.mockResolvedValue(order);
      prisma.productStock.findUnique.mockResolvedValue(productStock);

      await expect(service.finishOrder('order1', user)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('deve finalizar pedido e atualizar estoque', async () => {
      const productStock: ProductStock = {
        id: 'stock1',
        quantity: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
        storeId: 'store1',
        productId: 'p1',
      };

      const paidOrder: OrderWithItems = {
        ...order,
        status: 'PAID',
      };

      prisma.order.findUnique.mockResolvedValue(order);
      prisma.productStock.findUnique.mockResolvedValue(productStock);
      prisma.order.update.mockResolvedValue(paidOrder);

      const result = await service.finishOrder('order1', user);

      expect(result.status).toBe('PAID');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.productStock.update).toHaveBeenCalled();
    });
  });
});
