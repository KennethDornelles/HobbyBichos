import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsStrictEmail } from '../../../common/validators/email.validator';

export class LoginDto {
  @ApiProperty({
    example: 'usuario@exemplo.com',
    description: 'Email do usuário para login',
  })
  @IsStrictEmail({ message: 'Email inválido' })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  email: string;

  @ApiProperty({
    example: 'Senha123!',
    description: 'Senha do usuário',
  })
  @IsString({ message: 'A senha deve ser uma string' })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  password: string;
}
