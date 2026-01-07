import { Test, TestingModule } from '@nestjs/testing';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

describe('PetsController', () => {
  let controller: PetsController;
  let service: PetsService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findMyPets: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PetsController],
      providers: [{ provide: PetsService, useValue: mockService }],
    }).compile();

    controller = module.get<PetsController>(PetsController);
    service = module.get<PetsService>(PetsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve delegar para service.create e retornar o resultado', async () => {
      const dto: CreatePetDto = { name: 'Rex' } as any;
      const req = { user: { id: 'u1' } };
      const expected = { id: 'p1' };
      mockService.create.mockResolvedValue(expected);
      const result = await controller.create(dto, req);
      expect(service.create).toHaveBeenCalledWith(dto, 'u1');
      expect(result).toBe(expected);
    });
  });

  describe('findAll', () => {
    it('deve delegar para service.findAll e retornar o resultado', async () => {
      const expected = [{ id: 'p1' }];
      mockService.findAll.mockResolvedValue(expected);
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toBe(expected);
    });
  });

  describe('findMyPets', () => {
    it('deve delegar para service.findMyPets e retornar o resultado', async () => {
      const req = { user: { id: 'u1' } };
      const expected = [{ id: 'p1' }];
      mockService.findMyPets.mockResolvedValue(expected);
      const result = await controller.findMyPets(req);
      expect(service.findMyPets).toHaveBeenCalledWith('u1');
      expect(result).toBe(expected);
    });
  });

  describe('findOne', () => {
    it('deve delegar para service.findOne e retornar o resultado', async () => {
      const expected = { id: 'p1' };
      mockService.findOne.mockResolvedValue(expected);
      const result = await controller.findOne('p1');
      expect(service.findOne).toHaveBeenCalledWith('p1');
      expect(result).toBe(expected);
    });
  });

  describe('update', () => {
    it('deve delegar para service.update e retornar o resultado', async () => {
      const req = { user: { id: 'u1' } };
      const dto: UpdatePetDto = { name: 'Rex' } as any;
      const expected = { id: 'p1', name: 'Rex' };
      mockService.update.mockResolvedValue(expected);
      const result = await controller.update('p1', dto, req);
      expect(service.update).toHaveBeenCalledWith('p1', dto, 'u1');
      expect(result).toBe(expected);
    });
  });

  describe('remove', () => {
    it('deve delegar para service.remove e retornar o resultado', async () => {
      const req = { user: { id: 'u1' } };
      const expected = { id: 'p1', removed: true };
      mockService.remove.mockResolvedValue(expected);
      const result = await controller.remove('p1', req);
      expect(service.remove).toHaveBeenCalledWith('p1', 'u1');
      expect(result).toBe(expected);
    });
  });
});
