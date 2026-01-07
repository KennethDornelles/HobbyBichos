import { Test, TestingModule } from '@nestjs/testing';
import { StoresService } from './stores.service';
import { PrismaService } from '../../database/prisma.service';

describe('StoresService', () => {
  let service: StoresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoresService, PrismaService],
    }).compile();
    service = module.get<StoresService>(StoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAvailability', () => {
    let prisma: any;
    beforeEach(() => {
      prisma = {
        storeExclusion: { findFirst: jest.fn().mockResolvedValue(null) },
        storeBusinessHour: {
          findFirst: jest
            .fn()
            .mockResolvedValue({ openTime: '08:00', closeTime: '18:00' }),
        },
        service: {
          findMany: jest.fn().mockResolvedValue([{ durationMin: 30 }]),
        },
        appointment: { findMany: jest.fn().mockResolvedValue([]) },
      };
      (service as any).prisma = prisma;
      global.format = (date: Date, fmt: string) => '09:00';
      global.addMinutes = (date: Date, min: number) =>
        new Date(date.getTime() + min * 60000);
    });
    it('deve retornar slots disponíveis', async () => {
      const result = await service.getAvailability('store1', '2026-01-06');
      expect(result.slots.length).toBeGreaterThan(0);
      expect(prisma.storeExclusion.findFirst).toHaveBeenCalled();
      expect(prisma.storeBusinessHour.findFirst).toHaveBeenCalled();
      expect(prisma.service.findMany).toHaveBeenCalled();
      expect(prisma.appointment.findMany).toHaveBeenCalled();
    });
    it('deve retornar slots vazios se for data de exclusão', async () => {
      prisma.storeExclusion.findFirst.mockResolvedValue({});
      const result = await service.getAvailability('store1', '2026-01-06');
      expect(result.slots).toEqual([]);
    });
    it('deve retornar slots vazios se não houver horário de funcionamento', async () => {
      prisma.storeBusinessHour.findFirst.mockResolvedValue(null);
      const result = await service.getAvailability('store1', '2026-01-06');
      expect(result.slots).toEqual([]);
    });
    it('deve retornar slots vazios se não houver serviços', async () => {
      prisma.service.findMany.mockResolvedValue([]);
      const result = await service.getAvailability('store1', '2026-01-06');
      expect(result.slots).toEqual([]);
    });
  });

  describe('create', () => {
    it('deve criar uma loja', async () => {
      const prisma = {
        store: {
          create: jest.fn().mockResolvedValue({ id: '1', name: 'Loja' }),
        },
      };
      (service as any).prisma = prisma;
      const result = await service.create({
        name: 'Loja',
        phone: '123',
        isActive: true,
      });
      expect(result).toEqual({ id: '1', name: 'Loja' });
      expect(prisma.store.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar todas as lojas ativas', async () => {
      const prisma = {
        store: {
          findMany: jest.fn().mockResolvedValue([{ id: '1', isActive: true }]),
        },
      };
      (service as any).prisma = prisma;
      const result = await service.findAll();
      expect(result).toEqual([{ id: '1', isActive: true }]);
    });
  });
});
