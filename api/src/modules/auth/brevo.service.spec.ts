jest.mock('nodemailer');
import { Test, TestingModule } from '@nestjs/testing';
import { BrevoService } from './brevo.service';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

describe('BrevoService', () => {
  let service: BrevoService;
  let configService: ConfigService;
  let sendMailMock: jest.Mock;
  let verifyMock: jest.Mock;

  beforeEach(async () => {
    sendMailMock = jest.fn().mockResolvedValue({
      messageId: 'msgid',
      response: 'OK',
      accepted: ['a@a.com'],
      rejected: [],
    });
    verifyMock = jest.fn().mockResolvedValue(true);
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
      verify: verifyMock,
    });

    configService = {
      get: jest.fn((key: string) => {
        if (key === 'SMTP_USER') return 'smtp@hobbybichos.com';
        if (key === 'SMTP_PASS') return 'senha';
        if (key === 'BREVO_FROM_EMAIL') return 'noreply@hobbybichos.com';
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

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve enviar email de boas-vindas sem lançar erro', async () => {
    await expect(service.sendWelcomeEmail('a@a.com')).resolves.toBeUndefined();
    expect(sendMailMock).toHaveBeenCalled();
  });

  it('deve logar erro mas não lançar ao falhar no email de boas-vindas', async () => {
    sendMailMock.mockRejectedValueOnce(new Error('Falha SMTP'));
    await expect(service.sendWelcomeEmail('a@a.com')).resolves.toBeUndefined();
  });

  it('deve enviar email de recuperação e retornar info', async () => {
    const info = await service.sendRecoveryCodeEmail(
      'a@a.com',
      'Ana',
      '123456',
    );
    expect(sendMailMock).toHaveBeenCalled();
    expect(info).toHaveProperty('messageId');
  });

  it('deve lançar erro ao falhar no envio de recuperação', async () => {
    sendMailMock.mockRejectedValueOnce(new Error('Falha SMTP'));
    await expect(
      service.sendRecoveryCodeEmail('a@a.com', 'Ana', '123456'),
    ).rejects.toThrow('Falha SMTP');
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
