import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: MailerService, useValue: { sendMail: jest.fn() } },
      ],
    }).compile();
    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Exemplos de teste para métodos utilitários
  it('deve sanitizar email', () => {
    expect((service as any).sanitizeEmail(' TEST@EXAMPLE.COM ')).toBe(
      'test@example.com',
    );
  });

  it('deve aceitar domínio se não houver restrição', () => {
    process.env.ALLOWED_EMAIL_DOMAINS = '';
    expect((service as any).validateEmailDomain('a@b.com')).toBe(true);
  });

  describe('sendAppointmentConfirmation', () => {
    it('deve enviar email de confirmação', async () => {
      const mailer = { sendMail: jest.fn().mockResolvedValue(undefined) };
      (service as any).mailerService = mailer;
      const spy = jest.spyOn(service as any, 'sanitizeEmail');
      await service.sendAppointmentConfirmation('a@b.com', 'Loja', {
        clientName: 'Ana',
        date: '2026-01-06',
      });
      expect(mailer.sendMail).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });
    it('deve lançar erro se domínio não permitido', async () => {
      process.env.ALLOWED_EMAIL_DOMAINS = 'outra.com';
      await expect(
        service.sendAppointmentConfirmation('a@b.com', 'Loja', {
          clientName: 'Ana',
          date: '2026-01-06',
        }),
      ).rejects.toThrow('Domínio não permitido');
    });
    it('deve propagar erro do MailerService', async () => {
      process.env.ALLOWED_EMAIL_DOMAINS = 'hobbybichos.com';
      const mailer = {
        sendMail: jest.fn().mockRejectedValue(new Error('Falha SMTP')),
      };
      (service as any).mailerService = mailer;
      await expect(
        service.sendAppointmentConfirmation('ana@hobbybichos.com', 'Loja', {
          clientName: 'Ana',
          date: '2026-01-06',
        }),
      ).rejects.toThrow('Falha SMTP');
    });
  });
});
