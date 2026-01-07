import { ApiProperty } from '@nestjs/swagger';

export class UserPayloadEntity {
  @ApiProperty({ example: 'user-uuid-123', description: 'ID do usuário' })
  id: string;

  @ApiProperty({
    example: 'usuario@email.com',
    description: 'E-mail do usuário',
  })
  email: string;

  @ApiProperty({
    example: 'admin',
    description: 'Perfil do usuário (admin, user, etc)',
  })
  role: string;

  @ApiProperty({
    example: 'store-uuid-123',
    description: 'ID da loja vinculada',
    required: false,
  })
  storeId: string | null;

  @ApiProperty({
    example: 1672531200,
    description: 'Timestamp de emissão do token',
    required: false,
  })
  iat?: number;

  @ApiProperty({
    example: 1672534800,
    description: 'Timestamp de expiração do token',
    required: false,
  })
  exp?: number;
}
