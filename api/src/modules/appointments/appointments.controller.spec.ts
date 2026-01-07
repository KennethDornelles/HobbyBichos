import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { FilterAppointmentsDto } from './dto/filter-appointments.dto';
import { ExecutionContext } from '@nestjs/common';

describe('AppointmentsController', () => {
  let controller: AppointmentsController;
  let service: AppointmentsService;

  const mockService = {
    create: jest.fn(),
    findAllByStore: jest.fn(),
  };

  const mockGuard = {
    canActivate: jest.fn((context: ExecutionContext) => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentsController],
      providers: [{ provide: AppointmentsService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<AppointmentsController>(AppointmentsController);
    service = module.get<AppointmentsService>(AppointmentsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve delegar para service.create e retornar o resultado', async () => {
      const dto: CreateAppointmentDto = {
        petId: '1',
        employeeId: '2',
        serviceId: '3',
        startsAt: new Date().toISOString(),
      };
      const user = { userId: 'u1', storeId: 's1' };
      const req = { user };
      const expected = { id: 'a1' };
      mockService.create.mockResolvedValue(expected);
      const result = await controller.create(dto, req);
      expect(service.create).toHaveBeenCalledWith(dto, user);
      expect(result).toBe(expected);
    });
  });

  describe('findAllByStore', () => {
    it('deve delegar para service.findAllByStore e retornar o resultado', async () => {
      const filter: FilterAppointmentsDto = { employeeId: '2' } as any;
      const user = { userId: 'u1', storeId: 's1' };
      const req = { user };
      const expected = [{ id: 'a1' }];
      mockService.findAllByStore.mockResolvedValue(expected);
      const result = await controller.findAllByStore(filter, req);
      expect(service.findAllByStore).toHaveBeenCalledWith(filter, user);
      expect(result).toBe(expected);
    });
  });
});
