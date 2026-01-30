// jest.mock('nodemailer');
import { Test, TestingModule } from '@nestjs/testing';
import { BrevoService } from './brevo.service';
import { ConfigService } from '@nestjs/config';

// Mock Resend
const mockResend = {
  emails: {
    send: jest.fn(),
  },
};
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => mockResend),
}));

describe('BrevoService', () => {
  let service: BrevoService;
  let configService: ConfigService;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Config padrão do mock, sucesso
    mockResend.emails.send.mockResolvedValue({
      data: { id: 'msgid' },
      error: null,
    });

    configService = {
      get: jest.fn((key: string) => {
        if (key === 'SMTP_USER') return 'smtp@hobbybichos.com';
        if (key === 'SMTP_PASS') return 'senha';
        if (key === 'BREVO_FROM_EMAIL') return 'noreply@hobbybichos.com';
        if (key === 'RESEND_API_KEY') return 're_123';
        return undefined;
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrevoService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();
    service = module.get<BrevoService>(BrevoService);
  });

  it('deve enviar email de boas-vindas sem lançar erro', async () => {
    await expect(service.sendWelcomeEmail('a@a.com')).resolves.toBeUndefined();
    expect(mockResend.emails.send).toHaveBeenCalled();
  });

  it('deve logar erro mas não lançar ao falhar no email de boas-vindas', async () => {
    mockResend.emails.send.mockResolvedValue({
      data: null,
      error: { message: 'Falha API', name: 'error' },
    });
    await expect(service.sendWelcomeEmail('a@a.com')).resolves.toBeUndefined();
  });

  it('deve enviar email de recuperação e retornar info', async () => {
    const info = await service.sendRecoveryCodeEmail(
      'a@a.com',
      'Ana',
      '123456',
    );
    expect(mockResend.emails.send).toHaveBeenCalled();
    expect(info).toHaveProperty('id', 'msgid');
  });

  it('deve lançar erro ao falhar no envio de recuperação', async () => {
    mockResend.emails.send.mockResolvedValue({
      data: null,
      error: { message: 'Falha API', name: 'error' },
    });
    await expect(
      service.sendRecoveryCodeEmail('a@a.com', 'Ana', '123456'),
    ).rejects.toThrow('Falha API');
  });

  it('deve retornar template de email de recuperação', () => {
    const html = (service as any).getRecoveryEmailTemplate('Ana', '123456');
    expect(html).toContain('Ana');
    expect(html).toContain('123456');
    expect(html).toContain('Hobby Bichos');
  });

  it('deve logar aviso e não lançar no método obsoleto', async () => {
    await expect(
      service.sendForgotPasswordEmail('a@a.com', 'token'),
    ).resolves.toBeUndefined();
  });
});

