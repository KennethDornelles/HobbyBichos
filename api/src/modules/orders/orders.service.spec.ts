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
    const eventEmitter = { emit: jest.fn() };
    service = new OrdersService(prisma as unknown as PrismaService, eventEmitter as any);
  });

  describe('create', () => {
    const user = { id: 'user1', storeId: 'store1', role: 'MANAGER' };
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
      address: 'av',
      city: 'sp',
      state: 'sp',
      latitude: 0,
      longitude: 0,
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
        minStock: 5,
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
        minStock: 5,
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

  describe('findAll', () => {
    it('deve filtrar por userId se for CLIENT', async () => {
      const user = { id: 'client1', storeId: 'store1', role: 'CLIENT' };
      prisma.order.findMany.mockResolvedValue([]);
      
      await service.findAll(user);
      
      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'client1' })
        })
      );
    });

    it('deve filtrar por storeId se for OWNER/MANAGER', async () => {
      const user = { id: 'manager1', storeId: 'store1', role: 'MANAGER' };
      prisma.order.findMany.mockResolvedValue([]);
      
      await service.findAll(user);
      
      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ storeId: 'store1' })
        })
      );
    });
  });

  describe('cancelOrder', () => {
    const orderId = 'order1';
    const mockOrder = { id: orderId, userId: 'client1', storeId: 'store1', status: 'PENDING' };

    it('deve permitir cancelamento pelo cliente dono do pedido', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder as any);
      prisma.order.update.mockResolvedValue({ ...mockOrder, status: 'CANCELLED' } as any);
      
      const result = await service.cancelOrder(orderId, { id: 'client1', storeId: 'store1', role: 'CLIENT' });
      expect(result.status).toBe('CANCELLED');
    });

    it('deve negar cancelamento se for cliente diferente', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder as any);
      await expect(service.cancelOrder(orderId, { id: 'other', storeId: 'store1', role: 'CLIENT' }))
        .rejects.toThrow(ForbiddenException);
    });

    it('deve negar cancelamento se já estiver entregue', async () => {
      prisma.order.findUnique.mockResolvedValue({ ...mockOrder, status: 'DELIVERED' } as any);
      await expect(service.cancelOrder(orderId, { id: 'client1', storeId: 'store1', role: 'CLIENT' }))
        .rejects.toThrow('Não é possível cancelar um pedido já entregue');
    });
  });

  describe('findOne', () => {
    const orderId = 'order1';
    const mockOrder = { 
      id: orderId, 
      userId: 'client1', 
      storeId: 'store1', 
      total: new Prisma.Decimal(10),
      store: { whatsappNumber: '5511999999999' } 
    };

    it('deve retornar pedido com paymentAction', async () => {
      prisma.order.findFirst.mockResolvedValue(mockOrder as any);
      const result = await service.findOne(orderId, { id: 'client1', storeId: 'store1' });
      
      expect(result.paymentAction).toBeDefined();
      expect(result.paymentAction.whatsappLink).toContain('wa.me');
    });
  });

  describe('testUpdateStatus', () => {
    const orderId = 'order1';
    const mockOrder = { id: orderId, userId: 'client1', storeId: 'store1' };

    it('deve atualizar status arbitrário para testes', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder as any);
      prisma.order.update.mockResolvedValue({ ...mockOrder, status: 'PROCESSING' } as any);
      
      const result = await service.testUpdateStatus(orderId, 'PROCESSING', { id: 'manager1', storeId: 'store1' });
      expect(result.status).toBe('PROCESSING');
    });

    it('deve validar status permitidos', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder as any);
      await expect(service.testUpdateStatus(orderId, 'INVALID', { id: 'manager1', storeId: 'store1' }))
        .rejects.toThrow('Status inválido');
    });
  });
});

