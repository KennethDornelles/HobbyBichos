import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Min,
  IsOptional,
} from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'Banho e Tosa', description: 'Nome do serviço' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 49.9, description: 'Preço do serviço' })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ example: 60, description: 'Duração em minutos' })
  @IsNumber()
  @Min(1)
  durationMin: number;

  @ApiProperty({
    example: 'storeId123',
    description: 'ID da loja',
    required: false,
  })
  @IsString()
  @IsOptional()
  storeId?: string;
}
