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

  describe('findByMemberCode', () => {
    it('deve normalizar código em lowercase para UPPERCASE', async () => {
      const prisma = {
        memberCode: {
          findUnique: jest.fn().mockResolvedValue({
            code: 'USER123',
            userId: 'user1',
            user: { id: 'user1', loyaltyAccount: { id: 'loyalty1' } },
          }),
        },
      };
      (service as any).prisma = prisma;
      const result = await service.findByMemberCode('user123');
      expect(result).toEqual({
        id: 'user1',
        loyaltyAccount: { id: 'loyalty1' },
      });
      expect(prisma.memberCode.findUnique).toHaveBeenCalledWith({
        where: { code: 'USER123' },
        include: { user: { include: { loyaltyAccount: true } } },
      });
    });

    it('deve normalizar código com espaços', async () => {
      const prisma = {
        memberCode: {
          findUnique: jest.fn().mockResolvedValue({
            code: 'USER123',
            userId: 'user1',
            user: { id: 'user1', loyaltyAccount: null },
          }),
        },
      };
      (service as any).prisma = prisma;
      const result = await service.findByMemberCode('  USER123  ');
      expect(result).toEqual({ id: 'user1', loyaltyAccount: null });
      expect(prisma.memberCode.findUnique).toHaveBeenCalledWith({
        where: { code: 'USER123' },
        include: { user: { include: { loyaltyAccount: true } } },
      });
    });

    it('deve normalizar código mixed-case', async () => {
      const prisma = {
        memberCode: {
          findUnique: jest.fn().mockResolvedValue({
            code: 'USER123',
            userId: 'user1',
            user: { id: 'user1' },
          }),
        },
      };
      (service as any).prisma = prisma;
      const result = await service.findByMemberCode('UsEr123');
      expect(prisma.memberCode.findUnique).toHaveBeenCalledWith({
        where: { code: 'USER123' },
        include: { user: { include: { loyaltyAccount: true } } },
      });
    });

    it('deve retornar null se código não encontrado', async () => {
      const prisma = {
        memberCode: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      };
      (service as any).prisma = prisma;
      const result = await service.findByMemberCode('invalid');
      expect(result).toBeNull();
    });
  });

  describe('assignMemberCode', () => {
    it('deve atribuir código normalizado para novo membro', async () => {
      const user = {
        id: 'user1',
        email: 'test@example.com',
        loyaltyAccount: { id: 'loyalty1' },
      };
      const prisma = {
        user: {
          findUnique: jest.fn().mockResolvedValue(user),
        },
        memberCode: {
          findUnique: jest.fn().mockResolvedValue(null),
          upsert: jest.fn().mockResolvedValue({
            code: 'USER123',
            userId: 'user1',
          }),
        },
      };
      (service as any).prisma = prisma;

      const result = await service.assignMemberCode({
        id: 'user1',
        code: 'user123',
      });

      expect(result).toEqual({ code: 'USER123', userId: 'user1' });
      expect(prisma.memberCode.upsert).toHaveBeenCalledWith({
        where: { code: 'USER123' },
        update: { userId: 'user1' },
        create: { code: 'USER123', userId: 'user1' },
      });
    });

    it('deve normalizar código com espaços ao atribuir', async () => {
      const user = {
        id: 'user1',
        email: 'test@example.com',
        loyaltyAccount: { id: 'loyalty1' },
      };
      const prisma = {
        user: {
          findUnique: jest.fn().mockResolvedValue(user),
        },
        memberCode: {
          findUnique: jest.fn().mockResolvedValue(null),
          upsert: jest.fn().mockResolvedValue({
            code: 'USER123',
            userId: 'user1',
          }),
        },
      };
      (service as any).prisma = prisma;

      await service.assignMemberCode({
        id: 'user1',
        code: '  user123  ',
      });

      expect(prisma.memberCode.upsert).toHaveBeenCalledWith({
        where: { code: 'USER123' },
        update: { userId: 'user1' },
        create: { code: 'USER123', userId: 'user1' },
      });
    });

    it('deve lançar erro se código está vinculado a outro usuário', async () => {
      const user = {
        id: 'user1',
        email: 'test@example.com',
        loyaltyAccount: { id: 'loyalty1' },
      };
      const existing = {
        code: 'USER123',
        userId: 'user2', // Diferente de user1
      };
      const prisma = {
        user: {
          findUnique: jest.fn().mockResolvedValue(user),
        },
        memberCode: {
          findUnique: jest.fn().mockResolvedValue(existing),
        },
      };
      (service as any).prisma = prisma;

      await expect(
        service.assignMemberCode({
          id: 'user1',
          code: 'USER123',
        }),
      ).rejects.toThrow('Código já está vinculado a outro usuário');
    });

    it('deve atualizar código se pertence ao mesmo usuário', async () => {
      const user = {
        id: 'user1',
        email: 'test@example.com',
        loyaltyAccount: { id: 'loyalty1' },
      };
      const existing = {
        code: 'USER123',
        userId: 'user1', // Mesmo usuário
      };
      const prisma = {
        user: {
          findUnique: jest.fn().mockResolvedValue(user),
        },
        memberCode: {
          findUnique: jest.fn().mockResolvedValue(existing),
          upsert: jest.fn().mockResolvedValue({
            code: 'USER123',
            userId: 'user1',
          }),
        },
      };
      (service as any).prisma = prisma;

      const result = await service.assignMemberCode({
        id: 'user1',
        code: 'USER123',
      });

      expect(result).toEqual({ code: 'USER123', userId: 'user1' });
      expect(prisma.memberCode.upsert).toHaveBeenCalled();
    });

    it('deve lançar erro se código não é fornecido', async () => {
      (service as any).prisma = {};
      await expect(
        service.assignMemberCode({
          id: 'user1',
          code: '',
        }),
      ).rejects.toThrow('Informe o código');
    });

    it('deve lançar erro se usuário não encontrado', async () => {
      const prisma = {
        user: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      };
      (service as any).prisma = prisma;

      await expect(
        service.assignMemberCode({
          id: 'invalid',
          code: 'USER123',
        }),
      ).rejects.toThrow('Usuário não encontrado');
    });

    it('deve criar loyalty account se não existir', async () => {
      const user = {
        id: 'user1',
        email: 'test@example.com',
        loyaltyAccount: null,
      };
      const prisma = {
        user: {
          findUnique: jest.fn().mockResolvedValue(user),
        },
        loyaltyAccount: {
          create: jest.fn().mockResolvedValue({ id: 'loyalty1' }),
        },
        memberCode: {
          findUnique: jest.fn().mockResolvedValue(null),
          upsert: jest.fn().mockResolvedValue({
            code: 'USER123',
            userId: 'user1',
          }),
        },
      };
      (service as any).prisma = prisma;

      // Mock ensureLoyaltyForUser
      jest.spyOn(service, 'ensureLoyaltyForUser').mockResolvedValue({
        id: 'loyalty1',
      });

      await service.assignMemberCode({
        id: 'user1',
        code: 'USER123',
      });

      expect(service.ensureLoyaltyForUser).toHaveBeenCalledWith({
        email: undefined,
        id: 'user1',
      });
    });
  });
});
