import { ApiProperty } from '@nestjs/swagger';

export class UserFromJwtEntity {
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
}
