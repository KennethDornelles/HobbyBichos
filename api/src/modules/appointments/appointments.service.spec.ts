import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from '../../database/prisma.service';
import { ServicesService } from '../services/services.service';
import { MailService } from '../mail/mail.service';

describe('AppointmentsService', () => {
  let service: AppointmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        PrismaService,
        // Adiciona os providers necessários para o construtor
        {
          provide: ServicesService,
          useValue: {},
        },
        {
          provide: MailService,
          useValue: {},
        },
      ],
    }).compile();
    service = module.get<AppointmentsService>(AppointmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    let prisma: any;
    let servicesService: any;
    let mailService: any;
    const user = { storeId: 'store1', userId: 'user1' };
    const createDto = {
      petId: 'pet1',
      employeeId: 'emp1',
      serviceId: 'svc1',
      startsAt: new Date().toISOString(),
    };

    beforeEach(() => {
      prisma = {
        storeExclusion: { findFirst: jest.fn().mockResolvedValue(null) },
        storeBusinessHour: {
          findFirst: jest
            .fn()
            .mockResolvedValue({ openTime: '08:00', closeTime: '18:00' }),
        },
        appointment: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({
            user: { email: 'a@a.com', name: 'Cliente' },
            store: { name: 'Loja' },
            startsAt: new Date(),
          }),
        },
      };
      servicesService = {
        findOne: jest.fn().mockResolvedValue({ durationMin: 30 }),
      };
      mailService = {
        sendAppointmentConfirmation: jest.fn().mockResolvedValue(undefined),
      };
      (service as any).prisma = prisma;
      (service as any).servicesService = servicesService;
      (service as any).mailService = mailService;
    });

    it('deve criar agendamento com sucesso', async () => {
      const result = await service.create(createDto, user);
      expect(result).toBeDefined();
      expect(prisma.appointment.create).toHaveBeenCalled();
      expect(mailService.sendAppointmentConfirmation).toHaveBeenCalled();
    });

    it('deve lançar erro se serviço não encontrado', async () => {
      servicesService.findOne.mockResolvedValue(null);
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
      await expect(service.create(createDto, user)).rejects.toThrow(
        'Horário fora do expediente da loja.',
      );
    });

    it('deve lançar erro se houver conflito de agendamento', async () => {
      prisma.appointment.findFirst.mockResolvedValue({});
      await expect(service.create(createDto, user)).rejects.toThrow(
        'Horário já agendado',
      );
    });
  });
});
