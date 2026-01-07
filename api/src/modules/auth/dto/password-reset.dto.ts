import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, MinLength } from 'class-validator';
import { IsStrictEmail } from '../../../common/validators/email.validator';

export class PasswordResetDto {
  @ApiProperty({
    example: 'usuario@email.com',
    description: 'Email do usuário',
  })
  @IsStrictEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Código de 6 dígitos enviado por email',
  })
  @IsString()
  @Length(6, 6, { message: 'Código deve ter exatamente 6 dígitos' })
  code: string;

  @ApiProperty({
    example: 'NovaSenha123!',
    description: 'Nova senha do usuário (mínimo 6 caracteres)',
  })
  @IsString()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  newPassword: string;
}
