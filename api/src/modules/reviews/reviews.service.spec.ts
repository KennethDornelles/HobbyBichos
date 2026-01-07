import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../../database/prisma.service';

describe('ReviewsService', () => {
  let service: ReviewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewsService, PrismaService],
    }).compile();
    service = module.get<ReviewsService>(ReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    let prisma: any;
    const userId = 'user1';
    const createReviewDto = {
      appointmentId: 'appt1',
      stars: 5,
      comment: 'Ótimo!',
    };
    beforeEach(() => {
      prisma = {
        appointment: { findUnique: jest.fn() },
        review: {
          create: jest.fn().mockResolvedValue({ id: 'rev1', stars: 5 }),
        },
      };
      (service as any).prisma = prisma;
    });
    it('deve criar review com sucesso', async () => {
      prisma.appointment.findUnique.mockResolvedValue({
        id: 'appt1',
        status: 'COMPLETED',
        pet: { ownerId: userId },
        storeId: 'store1',
        professionalId: 'emp1',
      });
      const result = await service.create(createReviewDto, userId);
      expect(result).toEqual({ id: 'rev1', stars: 5 });
      expect(prisma.review.create).toHaveBeenCalled();
    });
    it('deve lançar NotFoundException se agendamento não existe', async () => {
      prisma.appointment.findUnique.mockResolvedValue(null);
      await expect(service.create(createReviewDto, userId)).rejects.toThrow(
        'Agendamento não encontrado',
      );
    });
    it('deve lançar ForbiddenException se agendamento não está COMPLETED', async () => {
      prisma.appointment.findUnique.mockResolvedValue({
        status: 'SCHEDULED',
        pet: { ownerId: userId },
      });
      await expect(service.create(createReviewDto, userId)).rejects.toThrow(
        'Só é possível avaliar agendamentos concluídos',
      );
    });
    it('deve lançar ForbiddenException se não for dono do pet', async () => {
      prisma.appointment.findUnique.mockResolvedValue({
        status: 'COMPLETED',
        pet: { ownerId: 'outro' },
      });
      await expect(service.create(createReviewDto, userId)).rejects.toThrow(
        'Você não pode avaliar este agendamento',
      );
    });
    it('deve lançar ForbiddenException se não houver profissional', async () => {
      prisma.appointment.findUnique.mockResolvedValue({
        status: 'COMPLETED',
        pet: { ownerId: userId },
        professionalId: null,
      });
      await expect(service.create(createReviewDto, userId)).rejects.toThrow(
        'Agendamento não possui profissional vinculado.',
      );
    });
  });

  describe('averageForStore', () => {
    it('deve retornar média das avaliações da loja', async () => {
      const prisma = {
        review: {
          aggregate: jest.fn().mockResolvedValue({ _avg: { stars: 4.5 } }),
        },
      };
      (service as any).prisma = prisma;
      const result = await service.averageForStore('store1');
      expect(result).toBe(4.5);
    });
    it('deve retornar 0 se não houver avaliações', async () => {
      const prisma = {
        review: {
          aggregate: jest.fn().mockResolvedValue({ _avg: { stars: null } }),
        },
      };
      (service as any).prisma = prisma;
      const result = await service.averageForStore('store1');
      expect(result).toBe(0);
    });
  });

  describe('averageForEmployee', () => {
    it('deve retornar média das avaliações do funcionário', async () => {
      const prisma = {
        review: {
          aggregate: jest.fn().mockResolvedValue({ _avg: { stars: 3 } }),
        },
      };
      (service as any).prisma = prisma;
      const result = await service.averageForEmployee('emp1');
      expect(result).toBe(3);
    });
    it('deve retornar 0 se não houver avaliações', async () => {
      const prisma = {
        review: {
          aggregate: jest.fn().mockResolvedValue({ _avg: { stars: null } }),
        },
      };
      (service as any).prisma = prisma;
      const result = await service.averageForEmployee('emp1');
      expect(result).toBe(0);
    });
  });
});
