import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as ejs from 'ejs';

// Mock Resend
const mockResend = {
  emails: {
    send: jest.fn(),
  },
};
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => mockResend),
}));

jest.mock('fs');
jest.mock('ejs');

describe('MailService', () => {
  let service: MailService;
  let configService: ConfigService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'RESEND_API_KEY') return 're_123';
              if (key === 'ALLOWED_EMAIL_DOMAINS') return undefined; // All allowed by default
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    configService = module.get<ConfigService>(ConfigService);

    // Mocks padrão para fs e ejs
    (fs.readFileSync as jest.Mock).mockReturnValue('<html>template</html>');
    (ejs.render as jest.Mock).mockReturnValue('<html>rendered</html>');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve sanitizar email', () => {
    expect((service as any).sanitizeEmail(' TEST@EXAMPLE.COM ')).toBe(
      'test@example.com',
    );
  });

  it('deve aceitar domínio se não houver restrição', () => {
    jest.spyOn(configService, 'get').mockImplementation((key) => {
      if (key === 'ALLOWED_EMAIL_DOMAINS') return '';
      return 'val';
    });
    expect((service as any).validateEmailDomain('a@b.com')).toBe(true);
  });

  describe('sendAppointmentConfirmation', () => {
    it('deve enviar email de confirmação', async () => {
      mockResend.emails.send.mockResolvedValue({
        data: { id: 'msg_123' },
        error: null,
      });

      await service.sendAppointmentConfirmation('a@b.com', 'Loja', {
        clientName: 'Ana',
        date: '2026-01-06',
      });

      expect(mockResend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'a@b.com',
          subject: 'Confirmação de Agendamento',
          html: '<html>rendered</html>',
        }),
      );
    });

    it('deve lançar erro se domínio não permitido', async () => {
      jest.spyOn(configService, 'get').mockImplementation((key) => {
        if (key === 'ALLOWED_EMAIL_DOMAINS') return 'outra.com';
        return 'val';
      });

      await expect(
        service.sendAppointmentConfirmation('a@b.com', 'Loja', {
          clientName: 'Ana',
          date: '2026-01-06',
        }),
      ).rejects.toThrow('Domínio não permitido');
    });

    it('deve propagar erro do Resend', async () => {
      mockResend.emails.send.mockRejectedValue(new Error('Falha API'));

      await expect(
        service.sendAppointmentConfirmation('a@b.com', 'Loja', {
          clientName: 'Ana',
          date: '2026-01-06',
        }),
      ).rejects.toThrow('Falha API');
    });
  });
});
