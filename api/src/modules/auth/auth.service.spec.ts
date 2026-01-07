import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { PasswordForgotService } from './password-forgot.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: {} },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('token') },
        },
        { provide: PasswordForgotService, useValue: {} },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('deve lançar ConflictException se email já existir', async () => {
      const prisma = { user: { findFirst: jest.fn().mockResolvedValue({}) } };
      (service as any).prisma = prisma;
      await expect(
        service.register({
          email: 'a@a.com',
          phone: '123',
          password: '123',
          name: 'A',
        }),
      ).rejects.toThrow('Email ou telefone já está em uso');
    });
  });

  describe('login', () => {
    it('deve lançar UnauthorizedException se usuário não existir', async () => {
      const prisma = {
        user: { findUnique: jest.fn().mockResolvedValue(null) },
      };
      (service as any).prisma = prisma;
      await expect(service.login('a@a.com', '123')).rejects.toThrow(
        'Email ou senha inválidos',
      );
    });
  });

  describe('getProfile', () => {
    it('deve lançar UnauthorizedException se usuário não encontrado', async () => {
      const prisma = {
        user: { findUnique: jest.fn().mockResolvedValue(null) },
      };
      (service as any).prisma = prisma;
      await expect(service.getProfile('id')).rejects.toThrow(
        'Usuário não encontrado',
      );
    });
  });
});
