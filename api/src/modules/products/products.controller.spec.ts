import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findAllByStore: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: mockService }],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve delegar para service.create e retornar o resultado', async () => {
      const dto: CreateProductDto = { name: 'Produto' } as any;
      const expected = { id: 'prod1' };
      mockService.create.mockResolvedValue(expected);
      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });
  });

  describe('findAll', () => {
    it('deve delegar para service.findAll e retornar o resultado', async () => {
      const expected = [{ id: 'prod1' }];
      mockService.findAll.mockResolvedValue(expected);
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toBe(expected);
    });
  });

  describe('findOne', () => {
    it('deve delegar para service.findOne e retornar o resultado', async () => {
      const expected = { id: 'prod1' };
      mockService.findOne.mockResolvedValue(expected);
      const result = await controller.findOne('prod1');
      expect(service.findOne).toHaveBeenCalledWith('prod1');
      expect(result).toBe(expected);
    });
  });

  describe('update', () => {
    it('deve delegar para service.update e retornar o resultado', async () => {
      const dto: UpdateProductDto = { name: 'Produto' } as any;
      const expected = { id: 'prod1', name: 'Produto' };
      mockService.update.mockResolvedValue(expected);
      const result = await controller.update('prod1', dto);
      expect(service.update).toHaveBeenCalledWith('prod1', dto);
      expect(result).toBe(expected);
    });
  });

  describe('remove', () => {
    it('deve delegar para service.remove e retornar o resultado', async () => {
      const expected = { id: 'prod1', removed: true };
      mockService.remove.mockResolvedValue(expected);
      const result = await controller.remove('prod1');
      expect(service.remove).toHaveBeenCalledWith('prod1');
      expect(result).toBe(expected);
    });
  });

  describe('findAllByStore', () => {
    it('deve delegar para service.findAllByStore e retornar o resultado', async () => {
      const req = { user: { storeId: 's1' } };
      const expected = [{ id: 'prod1' }];
      mockService.findAllByStore.mockResolvedValue(expected);
      const result = await controller.findAllByStore(req);
      expect(service.findAllByStore).toHaveBeenCalledWith('s1');
      expect(result).toBe(expected);
    });
  });
});
