import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordForgotService } from './password-forgot.service';

describe('AuthController', () => {
  let controller: AuthController;
  let testingModule: TestingModule;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            getProfile: jest.fn(),
          },
        },
        {
          provide: PasswordForgotService,
          useValue: {
            requestPasswordReset: jest.fn(),
            resetPassword: jest.fn(),
          },
        },
      ],
    }).compile();
    controller = testingModule.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('deve chamar authService.register', async () => {
      const authService = testingModule.get<AuthService>(AuthService);
      (authService.register as jest.Mock).mockResolvedValue('ok');
      const result = await controller.register({
        email: 'a@a.com',
        password: '123',
        name: 'A',
      });
      expect(authService.register).toHaveBeenCalledWith({
        email: 'a@a.com',
        password: '123',
        name: 'A',
      });
      expect(result).toBe('ok');
    });
  });

  describe('login', () => {
    it('deve chamar authService.login', async () => {
      const authService = testingModule.get<AuthService>(AuthService);
      (authService.login as jest.Mock).mockResolvedValue('token');
      const result = await controller.login({
        email: 'a@a.com',
        password: '123',
      });
      expect(authService.login).toHaveBeenCalledWith('a@a.com', '123');
      expect(result).toBe('token');
    });
  });

  describe('getProfile', () => {
    it('deve chamar authService.getProfile', async () => {
      const authService = testingModule.get<AuthService>(AuthService);
      (authService.getProfile as jest.Mock).mockResolvedValue('profile');
      const result = await controller.getProfile({ id: 'id' } as any);
      expect(authService.getProfile).toHaveBeenCalledWith('id');
      expect(result).toBe('profile');
    });
  });
});
