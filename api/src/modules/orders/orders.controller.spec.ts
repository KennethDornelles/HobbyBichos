import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    finishOrder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: mockService }],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve delegar para service.create e retornar o resultado', async () => {
      const dto: CreateOrderDto = { storeId: 's1', items: [] } as any;
      const user = { userId: 'u1', storeId: 's1' };
      const req = { user };
      const expected = { id: 'o1' };
      mockService.create.mockResolvedValue(expected);
      const result = await controller.create(dto, req);
      expect(service.create).toHaveBeenCalledWith(dto, user);
      expect(result).toBe(expected);
    });
  });

  describe('findAll', () => {
    it('deve delegar para service.findAll e retornar o resultado', async () => {
      const user = { userId: 'u1', storeId: 's1' };
      const req = { user };
      const expected = [{ id: 'o1' }];
      mockService.findAll.mockResolvedValue(expected);
      const result = await controller.findAll(req);
      expect(service.findAll).toHaveBeenCalledWith(user.storeId);
      expect(result).toBe(expected);
    });
  });

  describe('findOne', () => {
    it('deve delegar para service.findOne e retornar o resultado', async () => {
      const user = { userId: 'u1', storeId: 's1' };
      const req = { user };
      const expected = { id: 'o1' };
      mockService.findOne.mockResolvedValue(expected);
      const result = await controller.findOne('o1', req);
      expect(service.findOne).toHaveBeenCalledWith('o1', user.storeId);
      expect(result).toBe(expected);
    });
  });

  describe('finishOrder', () => {
    it('deve delegar para service.finishOrder e retornar o resultado', async () => {
      const user = { userId: 'u1', storeId: 's1' };
      const req = { user };
      const expected = { id: 'o1', finished: true };
      mockService.finishOrder.mockResolvedValue(expected);
      const result = await controller.finishOrder('o1', req);
      expect(service.finishOrder).toHaveBeenCalledWith('o1', user);
      expect(result).toBe(expected);
    });
  });
});
