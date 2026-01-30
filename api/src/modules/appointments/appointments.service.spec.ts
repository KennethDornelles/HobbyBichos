import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from '../../database/prisma.service';
import { ServicesService } from '../services/services.service';
import { MailService } from '../mail/mail.service';
import { AppointmentsRepository } from './appointments.repository';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let appointmentsRepository: any;
  let prisma: any;
  let servicesService: any;
  let mailService: any;

  beforeEach(async () => {
    appointmentsRepository = {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    };

    prisma = {
      storeExclusion: { findFirst: jest.fn() },
      storeBusinessHour: { findFirst: jest.fn() },
      service: { findUnique: jest.fn() },
    };

    servicesService = { findOne: jest.fn() };
    mailService = { sendAppointmentConfirmation: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AppointmentsRepository, useValue: appointmentsRepository },
        { provide: ServicesService, useValue: servicesService },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const user = { storeId: 'store1', userId: 'user1' };
    const createDto = {
      petId: 'pet1',
      employeeId: 'emp1',
      serviceId: 'svc1',
      startsAt: new Date().toISOString(),
    };
    const mockService = {
      id: 'svc1',
      storeId: 'store1',
      durationMin: 30,
    };

    beforeEach(() => {
      // Configuração padrão de sucesso
      prisma.service.findUnique.mockResolvedValue(mockService);
      prisma.storeExclusion.findFirst.mockResolvedValue(null);
      prisma.storeBusinessHour.findFirst.mockResolvedValue({
        openTime: '08:00',
        closeTime: '18:00',
      });
      appointmentsRepository.findFirst.mockResolvedValue(null); // Sem conflito
      appointmentsRepository.create.mockResolvedValue({
        id: 'apt1',
        user: { email: 'a@a.com', name: 'Cliente' },
        store: { name: 'Loja' },
        startsAt: new Date(),
      });
    });

    it('deve criar agendamento com sucesso', async () => {
      const result = await service.create(createDto, user);
      expect(result).toBeDefined();
      expect(appointmentsRepository.create).toHaveBeenCalled();
      expect(mailService.sendAppointmentConfirmation).toHaveBeenCalled();
    });

    it('deve lançar erro se serviço não encontrado', async () => {
      prisma.service.findUnique.mockResolvedValue(null);
      await expect(service.create(createDto, user)).rejects.toThrow(
        'Serviço não encontrado',
      );
    });

    it('deve lançar erro se loja fechada', async () => {
      prisma.storeExclusion.findFirst.mockResolvedValue({});
      await expect(service.create(createDto, user)).rejects.toThrow(
        'A loja estará fechada nesta data.',
      );
    });

    it('deve lançar erro se não houver expediente', async () => {
      prisma.storeBusinessHour.findFirst.mockResolvedValue(null);
      await expect(service.create(createDto, user)).rejects.toThrow(
        'A loja não possui expediente neste dia.',
      );
    });

    it('deve lançar erro se horário fora do expediente', async () => {
      prisma.storeBusinessHour.findFirst.mockResolvedValue({
        openTime: '10:00',
        closeTime: '12:00',
      });
      // 10pm = fora 10am-12pm
      // createDto.startsAt é 'now' ou fixo? Se for now, pode ser tricky.
      // O mock do DTO ali em cima: new Date().toISOString()
      // Vamos mockar uma data inválida explicitamente no teste
      const dto = { ...createDto, startsAt: '2026-01-01T20:00:00Z' };
      await expect(service.create(dto, user)).rejects.toThrow(
        'Horário fora do expediente da loja.',
      );
    });

    it('deve lançar erro se houver conflito de agendamento', async () => {
      appointmentsRepository.findFirst.mockResolvedValue({});
      await expect(service.create(createDto, user)).rejects.toThrow(
        'Horário já agendado',
      );
    });
  });
});
