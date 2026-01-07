import { Test, TestingModule } from '@nestjs/testing';
import { ServicesService } from './services.service';
import { PrismaService } from '../../database/prisma.service';

describe('ServicesService', () => {
  let service: ServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServicesService, PrismaService],
    }).compile();
    service = module.get<ServicesService>(ServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar serviço para SUPER_ADMIN', async () => {
      const prisma = {
        service: {
          create: jest.fn().mockResolvedValue({ id: '1', name: 'Corte' }),
        },
      };
      (service as any).prisma = prisma;
      const user = { role: 'SUPER_ADMIN', storeId: 'loja1' };
      const dto = {
        name: 'Corte',
        price: 10,
        durationMin: 30,
        storeId: 'loja1',
      };
      const result = await service.create(dto, user);
      expect(result).toEqual({ id: '1', name: 'Corte' });
      expect(prisma.service.create).toHaveBeenCalled();
    });
    it('deve criar serviço para usuário comum', async () => {
      const prisma = {
        service: {
          create: jest.fn().mockResolvedValue({ id: '1', name: 'Corte' }),
        },
      };
      (service as any).prisma = prisma;
      const user = { role: 'MANAGER', storeId: 'loja2' };
      const dto = { name: 'Corte', price: 10, durationMin: 30 };
      const result = await service.create(dto, user);
      expect(result).toEqual({ id: '1', name: 'Corte' });
      expect(prisma.service.create).toHaveBeenCalledWith({
        data: { name: 'Corte', price: 10, durationMin: 30, storeId: 'loja2' },
      });
    });
    it('deve lançar ForbiddenException se não houver storeId', async () => {
      const prisma = { service: { create: jest.fn() } };
      (service as any).prisma = prisma;
      const user = { role: 'MANAGER' };
      const dto = { name: 'Corte', price: 10, durationMin: 30 };
      await expect(service.create(dto, user)).rejects.toThrow(
        'storeId é obrigatório',
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os serviços da loja', async () => {
      const prisma = {
        service: { findMany: jest.fn().mockResolvedValue([{ id: '1' }]) },
      };
      (service as any).prisma = prisma;
      const result = await service.findAll('loja1');
      expect(result).toEqual([{ id: '1' }]);
    });
  });

  describe('findOne', () => {
    it('deve retornar serviço pelo id e loja', async () => {
      const prisma = {
        service: {
          findFirst: jest.fn().mockResolvedValue({ id: '1', storeId: 'loja1' }),
        },
      };
      (service as any).prisma = prisma;
      const result = await service.findOne('1', 'loja1');
      expect(result).toEqual({ id: '1', storeId: 'loja1' });
    });
  });

  describe('update', () => {
    it('deve atualizar serviço', async () => {
      const prisma = {
        service: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      };
      (service as any).prisma = prisma;
      const result = await service.update('1', { name: 'Novo' }, 'loja1');
      expect(result).toEqual({ count: 1 });
    });
  });

  describe('remove', () => {
    it('deve remover serviço', async () => {
      const prisma = {
        service: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
      };
      (service as any).prisma = prisma;
      const result = await service.remove('1', 'loja1');
      expect(result).toEqual({ count: 1 });
    });
  });
});
