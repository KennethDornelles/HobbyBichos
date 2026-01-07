jest.mock('bcrypt');
import { Test, TestingModule } from '@nestjs/testing';
import { PasswordForgotService } from './password-forgot.service';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('PasswordForgotService', () => {
  let service: PasswordForgotService;
  let prisma: any;
  let jwtService: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      recoveryCode: {
        updateMany: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest
        .fn()
        .mockImplementation(async (ops) =>
          Promise.all(ops.map((op: any) => op)),
        ),
    };
    jwtService = { sign: jest.fn().mockReturnValue('token') };
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordForgotService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();
    service = module.get<PasswordForgotService>(PasswordForgotService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('requestPasswordResetOld', () => {
    it('deve lançar NotFoundException se usuário não existe', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.requestPasswordResetOld({ email: 'a@a.com' }),
      ).rejects.toThrow('Usuário não encontrado');
    });
    it('deve retornar token se usuário existe', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@a.com' });
      const result = await service.requestPasswordResetOld({
        email: 'a@a.com',
      });
      expect(result).toHaveProperty('token', 'token');
    });
  });

  describe('requestPasswordReset', () => {
    it('deve retornar mensagem mesmo se usuário não existe', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const result = await service.requestPasswordReset({ email: 'a@a.com' });
      expect(result).toHaveProperty('message');
    });
    it('deve invalidar códigos antigos, criar novo e retornar mensagem', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@a.com',
        name: 'Ana',
      });
      prisma.recoveryCode.updateMany.mockResolvedValue({});
      prisma.recoveryCode.create.mockResolvedValue({});
      const result = await service.requestPasswordReset({ email: 'a@a.com' });
      expect(prisma.recoveryCode.updateMany).toHaveBeenCalled();
      expect(prisma.recoveryCode.create).toHaveBeenCalled();
      expect(result).toHaveProperty('message');
    });
  });

  describe('resetPassword', () => {
    it('deve lançar BadRequestException se usuário não existe', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.resetPassword({
          email: 'a@a.com',
          code: '123456',
          newPassword: 'nova',
        }),
      ).rejects.toThrow('Código inválido ou expirado');
    });
    it('deve lançar BadRequestException se recovery não existe', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@a.com' });
      prisma.recoveryCode.findFirst.mockResolvedValue(null);
      await expect(
        service.resetPassword({
          email: 'a@a.com',
          code: '123456',
          newPassword: 'nova',
        }),
      ).rejects.toThrow('Código inválido ou expirado');
    });
    it('deve atualizar senha e marcar recovery como usado', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@a.com' });
      prisma.recoveryCode.findFirst.mockResolvedValue({ id: 'r1' });
      prisma.user.update.mockResolvedValue({});
      prisma.recoveryCode.update.mockResolvedValue({});
      const result = await service.resetPassword({
        email: 'a@a.com',
        code: '123456',
        newPassword: 'nova',
      });
      expect(prisma.user.update).toHaveBeenCalled();
      expect(prisma.recoveryCode.update).toHaveBeenCalled();
      expect(result).toHaveProperty('message', 'Senha redefinida com sucesso!');
    });
  });
});
