import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let service: ReviewsService;

  const mockService = {
    create: jest.fn(),
    averageForStore: jest.fn(),
    averageForEmployee: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [{ provide: ReviewsService, useValue: mockService }],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
    service = module.get<ReviewsService>(ReviewsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve delegar para service.create e retornar o resultado', async () => {
      const dto: CreateReviewDto = { comment: 'Ótimo', rating: 5 } as any;
      const req = { user: { id: 'u1' } };
      const expected = { id: 'r1' };
      mockService.create.mockResolvedValue(expected);
      const result = await controller.create(dto, req);
      expect(service.create).toHaveBeenCalledWith(dto, 'u1');
      expect(result).toBe(expected);
    });
  });

  describe('averageForStore', () => {
    it('deve delegar para service.averageForStore e retornar o resultado', async () => {
      const expected = 4.5;
      mockService.averageForStore.mockResolvedValue(expected);
      const result = await controller.averageForStore('s1');
      expect(service.averageForStore).toHaveBeenCalledWith('s1');
      expect(result).toBe(expected);
    });
  });

  describe('averageForEmployee', () => {
    it('deve delegar para service.averageForEmployee e retornar o resultado', async () => {
      const expected = 4.7;
      mockService.averageForEmployee.mockResolvedValue(expected);
      const result = await controller.averageForEmployee('e1');
      expect(service.averageForEmployee).toHaveBeenCalledWith('e1');
      expect(result).toBe(expected);
    });
  });
});
