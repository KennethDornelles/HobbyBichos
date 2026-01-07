import { Test, TestingModule } from '@nestjs/testing';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

describe('ServicesController', () => {
  let controller: ServicesController;
  let service: ServicesService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
      providers: [{ provide: ServicesService, useValue: mockService }],
    }).compile();

    controller = module.get<ServicesController>(ServicesController);
    service = module.get<ServicesService>(ServicesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve delegar para service.create e retornar o resultado', async () => {
      const dto: CreateServiceDto = { name: 'Serviço' } as any;
      const req = { user: { id: 'u1', storeId: 's1' } };
      const expected = { id: 'svc1' };
      mockService.create.mockResolvedValue(expected);
      const result = await controller.create(dto, req);
      expect(service.create).toHaveBeenCalledWith(dto, req.user);
      expect(result).toBe(expected);
    });
  });

  describe('findAll', () => {
    it('deve delegar para service.findAll e retornar o resultado', async () => {
      const req = { user: { storeId: 's1' } };
      const expected = [{ id: 'svc1' }];
      mockService.findAll.mockResolvedValue(expected);
      const result = await controller.findAll(req);
      expect(service.findAll).toHaveBeenCalledWith('s1');
      expect(result).toBe(expected);
    });
  });

  describe('findOne', () => {
    it('deve delegar para service.findOne e retornar o resultado', async () => {
      const req = { user: { storeId: 's1' } };
      const expected = { id: 'svc1' };
      mockService.findOne.mockResolvedValue(expected);
      const result = await controller.findOne('svc1', req);
      expect(service.findOne).toHaveBeenCalledWith('svc1', 's1');
      expect(result).toBe(expected);
    });
  });

  describe('update', () => {
    it('deve delegar para service.update e retornar o resultado', async () => {
      const req = { user: { storeId: 's1' } };
      const dto: UpdateServiceDto = { name: 'Novo Serviço' } as any;
      const expected = { id: 'svc1', name: 'Novo Serviço' };
      mockService.update.mockResolvedValue(expected);
      const result = await controller.update('svc1', dto, req);
      expect(service.update).toHaveBeenCalledWith('svc1', dto, 's1');
      expect(result).toBe(expected);
    });
  });

  describe('remove', () => {
    it('deve delegar para service.remove e retornar o resultado', async () => {
      const req = { user: { storeId: 's1' } };
      const expected = { id: 'svc1', removed: true };
      mockService.remove.mockResolvedValue(expected);
      const result = await controller.remove('svc1', req);
      expect(service.remove).toHaveBeenCalledWith('svc1', 's1');
      expect(result).toBe(expected);
    });
  });
});
