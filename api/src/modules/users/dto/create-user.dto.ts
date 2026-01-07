import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';
import { Role } from '../../../common/enums/role.enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo do usuário',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'joao@email.com', description: 'E-mail do usuário' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Senha123!', description: 'Senha do usuário' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: '(11) 99999-9999',
    description: 'Telefone do usuário',
    required: false,
  })
  @IsPhoneNumber('BR')
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: 'admin',
    description: 'Perfil do usuário (admin, user, etc)',
  })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({
    example: 'storeId123',
    description: 'ID da loja vinculada',
    required: false,
  })
  @IsOptional()
  storeId?: string;
}
