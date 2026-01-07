import { Test, TestingModule } from '@nestjs/testing';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';

describe('StoresController', () => {
  let controller: StoresController;
  let service: StoresService;

  const mockService = {
    getAvailability: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoresController],
      providers: [{ provide: StoresService, useValue: mockService }],
    }).compile();

    controller = module.get<StoresController>(StoresController);
    service = module.get<StoresService>(StoresService);
    jest.clearAllMocks();
  });

  describe('getAvailability', () => {
    it('deve delegar para service.getAvailability e retornar o resultado', async () => {
      const expected = { slots: ['09:00'], businessHour: {}, exclusions: [] };
      mockService.getAvailability.mockResolvedValue(expected);
      const result = await controller.getAvailability('store1', '2026-01-06');
      expect(service.getAvailability).toHaveBeenCalledWith(
        'store1',
        '2026-01-06',
      );
      expect(result).toBe(expected);
    });
  });

  describe('create', () => {
    it('deve delegar para service.create e retornar o resultado', async () => {
      const dto: CreateStoreDto = { name: 'Loja' } as any;
      const expected = { id: 's1' };
      mockService.create.mockResolvedValue(expected);
      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });
  });

  describe('findAll', () => {
    it('deve delegar para service.findAll e retornar o resultado', async () => {
      const expected = [{ id: 's1' }];
      mockService.findAll.mockResolvedValue(expected);
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toBe(expected);
    });
  });
});
