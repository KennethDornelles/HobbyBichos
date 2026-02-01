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
    mailService = { 
      sendAppointmentConfirmation: jest.fn(),
      sendAppointmentCompleted: jest.fn(),
    };

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
      startsAt: '2026-01-01T14:00:00', // Safer local time
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

  describe('findAllByStore', () => {
    const filter = { storeId: 'store1', date: '2026-01-01' };

    it('deve listar agendamentos do cliente', async () => {
      const user = { id: 'client1', role: 'CLIENT', storeId: 'any' };
      appointmentsRepository.findMany.mockResolvedValue([]);
      
      await service.findAllByStore(filter, user);
      
      expect(appointmentsRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'client1' })
        })
      );
    });

    it('deve listar agendamentos da loja para gestores', async () => {
      const user = { storeId: 'store1', role: 'MANAGER' };
      appointmentsRepository.findMany.mockResolvedValue([]);
      
      await service.findAllByStore(filter, user);
      
      expect(appointmentsRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ storeId: 'store1' })
        })
      );
    });

    it('deve filtrar por data corretamente', async () => {
      const user = { storeId: 'store1', role: 'OWNER' };
      appointmentsRepository.findMany.mockResolvedValue([]);
      
      await service.findAllByStore({ ...filter, date: '2026-02-01' }, user);
      
      expect(appointmentsRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            startsAt: {
              gte: new Date('2026-02-01'),
              lt: new Date('2026-02-02')
            }
          })
        })
      );
    });
  });

  describe('findOne', () => {
    const appointmentId = 'apt1';
    const mockApt = { id: appointmentId, userId: 'client1', storeId: 'store1' };

    beforeEach(() => {
      appointmentsRepository.findUnique.mockResolvedValue(mockApt);
    });

    it('deve retornar agendamento se for do próprio cliente', async () => {
      const result = await service.findOne(appointmentId, { id: 'client1', role: 'CLIENT' });
      expect(result).toEqual(mockApt);
    });

    it('deve lançar NotFound se cliente tentar ver agendamento de outro', async () => {
      await expect(service.findOne(appointmentId, { id: 'other', role: 'CLIENT' }))
        .rejects.toThrow('Agendamento não encontrado');
    });

    it('deve retornar agendamento se gestor for da mesma loja', async () => {
      const result = await service.findOne(appointmentId, { storeId: 'store1', role: 'MANAGER' });
      expect(result).toEqual(mockApt);
    });

    it('deve lançar NotFound se agendamento não existir', async () => {
      appointmentsRepository.findUnique.mockResolvedValue(null);
      await expect(service.findOne('invalid', { role: 'OWNER' }))
        .rejects.toThrow('Agendamento não encontrado');
    });
  });

  describe('getEmployeeDashboard', () => {
    const employee = { id: 'emp1', storeId: 'store1', role: 'EMPLOYEE', name: 'Func' };

    it('deve retornar dados do dashboard com sucesso', async () => {
      appointmentsRepository.findMany.mockResolvedValue([]);
      const result = await service.getEmployeeDashboard(employee);
      
      expect(result).toBeDefined();
      expect(result.employeeName).toBe('Func');
      expect(appointmentsRepository.findMany).toHaveBeenCalledTimes(2); // Hoje e Próximos
    });

    it('deve lançar erro para papel não autorizado', async () => {
      await expect(service.getEmployeeDashboard({ ...employee, role: 'CLIENT' }))
        .rejects.toThrow('Acesso negado ao dashboard');
    });

    it('deve lançar erro se employee não tiver loja', async () => {
      await expect(service.getEmployeeDashboard({ ...employee, storeId: undefined }))
        .rejects.toThrow('Employee não possui loja associada');
    });
  });

  describe('updateAppointmentStatus', () => {
    const aptId = 'apt1';
    const manager = { storeId: 'store1', role: 'MANAGER' };
    const mockApt = { 
      id: aptId, 
      storeId: 'store1', 
      user: { email: 'a@a.com', name: 'C' },
      store: { name: 'L' } 
    };

    beforeEach(() => {
      appointmentsRepository.findUnique.mockResolvedValue(mockApt);
      appointmentsRepository.update.mockResolvedValue({ ...mockApt, status: 'PAID' });
    });

    it('deve atualizar status com sucesso', async () => {
      const result = await service.updateAppointmentStatus(aptId, { status: 'COMPLETED' }, manager);
      expect(result.status).toBeDefined();
      expect(appointmentsRepository.update).toHaveBeenCalled();
    });

    it('deve enviar email quando status for COMPLETED', async () => {
      mailService.sendAppointmentCompleted = jest.fn();
      await service.updateAppointmentStatus(aptId, { status: 'COMPLETED' }, manager);
      expect(mailService.sendAppointmentCompleted).toHaveBeenCalled();
    });

    it('deve negar atualização de agendamento de outra loja', async () => {
      await expect(service.updateAppointmentStatus(aptId, { status: 'PAID' }, { ...manager, storeId: 'outra' }))
        .rejects.toThrow('Sem permissão para atualizar este agendamento');
    });

    it('deve negar acesso para CLIENT', async () => {
      await expect(service.updateAppointmentStatus(aptId, { status: 'PAID' }, { role: 'CLIENT' }))
        .rejects.toThrow('Sem permissão para atualizar agendamentos');
    });
  });
});

