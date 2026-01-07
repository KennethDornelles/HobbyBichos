import { Test, TestingModule } from '@nestjs/testing';
import { PetsService } from './pets.service';
import { PrismaService } from '../../database/prisma.service';

describe('PetsService', () => {
  let service: PetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PetsService, PrismaService],
    }).compile();
    service = module.get<PetsService>(PetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um pet', async () => {
      const prisma = {
        pet: { create: jest.fn().mockResolvedValue({ id: '1', name: 'Rex' }) },
      };
      (service as any).prisma = prisma;
      const result = await service.create({ name: 'Rex' }, 'owner1');
      expect(result).toEqual({ id: '1', name: 'Rex' });
      expect(prisma.pet.create).toHaveBeenCalledWith({
        data: { name: 'Rex', ownerId: 'owner1' },
      });
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os pets', async () => {
      const prisma = {
        pet: { findMany: jest.fn().mockResolvedValue([{ id: '1' }]) },
      };
      (service as any).prisma = prisma;
      const result = await service.findAll();
      expect(result).toEqual([{ id: '1' }]);
    });
  });

  describe('findOne', () => {
    it('deve retornar um pet pelo id', async () => {
      const prisma = {
        pet: { findUnique: jest.fn().mockResolvedValue({ id: '1' }) },
      };
      (service as any).prisma = prisma;
      const result = await service.findOne('1');
      expect(result).toEqual({ id: '1' });
    });
  });

  describe('update', () => {
    it('deve atualizar um pet se for do dono', async () => {
      const prisma = {
        pet: {
          findUnique: jest
            .fn()
            .mockResolvedValue({ id: '1', ownerId: 'owner1' }),
          update: jest.fn().mockResolvedValue({ id: '1', name: 'Rex' }),
        },
      };
      (service as any).prisma = prisma;
      const result = await service.update('1', { name: 'Rex' }, 'owner1');
      expect(result).toEqual({ id: '1', name: 'Rex' });
    });
    it('deve lançar ForbiddenException se não for do dono', async () => {
      const prisma = {
        pet: {
          findUnique: jest
            .fn()
            .mockResolvedValue({ id: '1', ownerId: 'other' }),
        },
      };
      (service as any).prisma = prisma;
      await expect(
        service.update('1', { name: 'Rex' }, 'owner1'),
      ).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('deve remover um pet se for do dono', async () => {
      const prisma = {
        pet: {
          findUnique: jest
            .fn()
            .mockResolvedValue({ id: '1', ownerId: 'owner1' }),
          delete: jest.fn().mockResolvedValue({ id: '1' }),
        },
      };
      (service as any).prisma = prisma;
      const result = await service.remove('1', 'owner1');
      expect(result).toEqual({ id: '1' });
    });
    it('deve lançar ForbiddenException se não for do dono', async () => {
      const prisma = {
        pet: {
          findUnique: jest
            .fn()
            .mockResolvedValue({ id: '1', ownerId: 'other' }),
        },
      };
      (service as any).prisma = prisma;
      await expect(service.remove('1', 'owner1')).rejects.toThrow();
    });
  });

  describe('findMyPets', () => {
    it('deve retornar pets do dono', async () => {
      const prisma = {
        pet: {
          findMany: jest
            .fn()
            .mockResolvedValue([{ id: '1', ownerId: 'owner1' }]),
        },
      };
      (service as any).prisma = prisma;
      const result = await service.findMyPets('owner1');
      expect(result).toEqual([{ id: '1', ownerId: 'owner1' }]);
    });
  });
});
