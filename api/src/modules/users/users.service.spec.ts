import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../database/prisma.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    }).compile();
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    beforeEach(() => {
      jest.spyOn(require('bcrypt'), 'hash').mockResolvedValue('hashed');
    });
    it('deve criar usuário comum', async () => {
      const prisma = {
        user: { create: jest.fn().mockResolvedValue({ id: '1', name: 'Ana' }) },
      };
      (service as any).prisma = prisma;
      const dto = {
        name: 'Ana',
        email: 'a@a.com',
        password: '123',
        role: 'CLIENT',
      };
      const result = await service.create(dto);
      expect(result).toEqual({ id: '1', name: 'Ana' });
      expect(prisma.user.create).toHaveBeenCalled();
    });
    it('deve lançar erro se EMPLOYEE sem storeId', async () => {
      const prisma = { user: { create: jest.fn() } };
      (service as any).prisma = prisma;
      const dto = {
        name: 'Ana',
        email: 'a@a.com',
        password: '123',
        role: 'EMPLOYEE',
      };
      await expect(service.create(dto)).rejects.toThrow(
        'Funcionários precisam de storeId',
      );
    });
  });

  describe('findAllByStore', () => {
    it('deve retornar usuários da loja', async () => {
      const prisma = {
        user: {
          findMany: jest
            .fn()
            .mockResolvedValue([{ id: '1', storeId: 'loja1' }]),
        },
      };
      (service as any).prisma = prisma;
      const result = await service.findAllByStore('loja1');
      expect(result).toEqual([{ id: '1', storeId: 'loja1' }]);
    });
  });

  describe('findByEmail', () => {
    it('deve retornar usuário pelo email', async () => {
      const prisma = {
        user: {
          findUnique: jest
            .fn()
            .mockResolvedValue({ id: '1', email: 'a@a.com' }),
        },
      };
      (service as any).prisma = prisma;
      const result = await service.findByEmail('a@a.com');
      expect(result).toEqual({ id: '1', email: 'a@a.com' });
    });
  });

  describe('findById', () => {
    it('deve retornar usuário pelo id', async () => {
      const prisma = {
        user: { findUnique: jest.fn().mockResolvedValue({ id: '1' }) },
      };
      (service as any).prisma = prisma;
      const result = await service.findById('1');
      expect(result).toEqual({ id: '1' });
    });
  });

  describe('update', () => {
    beforeEach(() => {
      jest.spyOn(require('bcrypt'), 'hash').mockResolvedValue('hashed');
    });
    it('deve atualizar usuário', async () => {
      const prisma = {
        user: {
          update: jest.fn().mockResolvedValue({ id: '1', name: 'Novo' }),
        },
      };
      (service as any).prisma = prisma;
      const result = await service.update('1', { name: 'Novo' });
      expect(result).toEqual({ id: '1', name: 'Novo' });
    });
    it('deve atualizar senha se fornecida', async () => {
      const prisma = {
        user: {
          update: jest.fn().mockResolvedValue({ id: '1', name: 'Novo' }),
        },
      };
      (service as any).prisma = prisma;
      const result = await service.update('1', { password: 'nova' });
      expect(result).toEqual({ id: '1', name: 'Novo' });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { password: 'hashed' },
      });
    });
  });
});
