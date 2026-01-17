import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsObject, IsUUID } from 'class-validator';

export class EnqueueNotificationDto {
  @ApiProperty({
    description: 'ID do usuário (UUID) que receberá a notificação',
    example: '8b4fdcc4-e85a-4c0d-af69-8c6e7dc52b84',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Título da notificação',
    example: 'Teste de Notificação',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Corpo da mensagem',
    example: 'Isso é um teste enviado pelo Swagger!',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({
    description: 'Dados extras para navegação (opcional)',
    example: { screen: 'home' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}