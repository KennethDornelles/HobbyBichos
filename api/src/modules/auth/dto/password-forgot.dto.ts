import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { IsStrictEmail } from '../../../common/validators/email.validator';

export class PasswordForgotDto {
  @ApiProperty({
    example: 'usuario@email.com',
    description: 'Email do usuário para recuperação de senha',
  })
  @IsStrictEmail()
  @IsNotEmpty()
  email: string;
}
