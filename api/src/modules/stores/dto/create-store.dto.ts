import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsPhoneNumber,
} from 'class-validator';

export class CreateStoreDto {
  @ApiProperty({ example: 'Petshop Central', description: 'Nome da loja' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '(11) 98765-4321',
    description: 'Telefone da loja',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber('BR')
  phone?: string;

  @ApiProperty({
    example: true,
    description: 'Se a loja está ativa',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
