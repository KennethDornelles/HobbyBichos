import { IsStrictEmail } from '@/common/validators/email.validator';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

class TestEmailDto {
  @IsStrictEmail()
  email: string;
}

describe('IsStrictEmail', () => {
  it('deve aceitar emails válidos', async () => {
    const validEmails = [
      'usuario@email.com',
      'nome.sobrenome@dominio.com',
      'user+alias@empresa.org',
      'user123@sub.dominio.net',
    ];
    for (const email of validEmails) {
      const dto = plainToInstance(TestEmailDto, { email });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    }
  });

  it('deve rejeitar emails malformados', async () => {
    const invalidEmails = [
      'usuario@email',
      'usuario@.com',
      'usuario@com',
      'usuario@dominio..com',
      'usuario@@dominio.com',
      'usuario@dominio,com',
      'usuario@dominio com',
      'usuario@dominio<.com',
      'usuario@dominio>.com',
      'usuario@dominio(com',
      'usuario@dominio)com',
      'usuario@dominio[com',
      'usuario@dominio]com',
      'usuario@dominio;com',
      'usuario@dominio:com',
      'usuario@dominio"com',
      'usuario@dominio@com',
      'usuario@dominio .com',
      'usuario@ dominio.com',
      'usuario@dominio.com ',
      ' usuario@dominio.com',
    ];
    for (const email of invalidEmails) {
      const dto = plainToInstance(TestEmailDto, { email });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    }
  });
});
