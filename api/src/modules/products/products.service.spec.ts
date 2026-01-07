import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../../database/prisma.service';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsService, PrismaService],
    }).compile();
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um produto', async () => {
      const prisma = {
        product: {
          create: jest.fn().mockResolvedValue({ id: '1', name: 'Produto' }),
        },
      };
      (service as any).prisma = prisma;
      const result = await service.create({ name: 'Produto' });
      expect(result).toEqual({ id: '1', name: 'Produto' });
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: { name: 'Produto' },
      });
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os produtos', async () => {
      const prisma = {
        product: { findMany: jest.fn().mockResolvedValue([{ id: '1' }]) },
      };
      (service as any).prisma = prisma;
      const result = await service.findAll();
      expect(result).toEqual([{ id: '1' }]);
    });
  });

  describe('findOne', () => {
    it('deve retornar um produto pelo id', async () => {
      const prisma = {
        product: { findUnique: jest.fn().mockResolvedValue({ id: '1' }) },
      };
      (service as any).prisma = prisma;
      const result = await service.findOne('1');
      expect(result).toEqual({ id: '1' });
    });
  });

  describe('update', () => {
    it('deve atualizar um produto', async () => {
      const prisma = {
        product: {
          update: jest.fn().mockResolvedValue({ id: '1', name: 'Novo' }),
        },
      };
      (service as any).prisma = prisma;
      const result = await service.update('1', { name: 'Novo' });
      expect(result).toEqual({ id: '1', name: 'Novo' });
    });
  });

  describe('remove', () => {
    it('deve remover um produto', async () => {
      const prisma = {
        product: { delete: jest.fn().mockResolvedValue({ id: '1' }) },
      };
      (service as any).prisma = prisma;
      const result = await service.remove('1');
      expect(result).toEqual({ id: '1' });
    });
  });

  describe('updateProductStock', () => {
    it('deve atualizar o estoque do produto', async () => {
      const prisma = {
        productStock: {
          upsert: jest
            .fn()
            .mockResolvedValue({ productId: '1', storeId: '2', quantity: 10 }),
        },
      };
      (service as any).prisma = prisma;
      const result = await service.updateProductStock('1', '2', 10);
      expect(result).toEqual({ productId: '1', storeId: '2', quantity: 10 });
      expect(prisma.productStock.upsert).toHaveBeenCalledWith({
        where: { productId_storeId: { productId: '1', storeId: '2' } },
        update: { quantity: 10 },
        create: { productId: '1', storeId: '2', quantity: 10 },
      });
    });
  });

  describe('findAllByStore', () => {
    it('deve retornar produtos de uma loja', async () => {
      const prisma = {
        product: {
          findMany: jest
            .fn()
            .mockResolvedValue([{ id: '1', stocks: [{ storeId: '2' }] }]),
        },
      };
      (service as any).prisma = prisma;
      const result = await service.findAllByStore('2');
      expect(result).toEqual([{ id: '1', stocks: [{ storeId: '2' }] }]);
      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: { stocks: { some: { storeId: '2' } } },
        include: { stocks: true },
      });
    });
  });
});
