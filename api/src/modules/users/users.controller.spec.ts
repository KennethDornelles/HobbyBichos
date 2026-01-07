import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../../common/enums/role.enum';
import { ForbiddenException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockService = {
    findAllByStore: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('findAllByStore', () => {
    it('deve delegar para service.findAllByStore e retornar o resultado', async () => {
      const expected = [{ id: 'u1' }];
      mockService.findAllByStore.mockResolvedValue(expected);
      const result = await controller.findAllByStore('s1');
      expect(service.findAllByStore).toHaveBeenCalledWith('s1');
      expect(result).toBe(expected);
    });
  });

  describe('create', () => {
    it('deve delegar para service.create e retornar o resultado', async () => {
      const dto: CreateUserDto = { email: 'a@a.com', password: '123' } as any;
      const expected = { id: 'u1' };
      mockService.create.mockResolvedValue(expected);
      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });
  });

  describe('getProfile', () => {
    it('deve delegar para service.findById e retornar o resultado', async () => {
      const req = { user: { id: 'u1', role: Role.CLIENT } };
      const expected = { id: 'u1' };
      mockService.findById.mockResolvedValue(expected);
      const result = await controller.getProfile(req);
      expect(service.findById).toHaveBeenCalledWith('u1');
      expect(result).toBe(expected);
    });
    it('deve lançar ForbiddenException se não autenticado', async () => {
      const req = {};
      await expect(controller.getProfile(req)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('updateProfile', () => {
    it('deve atualizar perfil se CLIENT', async () => {
      const req = { user: { id: 'u1', role: Role.CLIENT } };
      const dto: UpdateUserDto = { name: 'Novo Nome' } as any;
      const expected = { id: 'u1', name: 'Novo Nome' };
      mockService.update.mockResolvedValue(expected);
      const result = await controller.updateProfile(req, dto);
      expect(service.update).toHaveBeenCalledWith('u1', dto);
      expect(result).toBe(expected);
    });
    it('deve lançar ForbiddenException se não for CLIENT', async () => {
      const req = { user: { id: 'u1', role: Role.OWNER } };
      const dto: UpdateUserDto = { name: 'Novo Nome' } as any;
      await expect(controller.updateProfile(req, dto)).rejects.toThrow(
        ForbiddenException,
      );
    });
    it('deve lançar ForbiddenException se não autenticado', async () => {
      const req = {};
      const dto: UpdateUserDto = { name: 'Novo Nome' } as any;
      await expect(controller.updateProfile(req, dto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
