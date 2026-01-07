import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { IsDecimal } from '../../../common/validators/is-decimal.validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Ração Golden', description: 'Nome do produto' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '99.90', description: 'Preço base do produto' })
  @IsDecimal()
  basePrice: string;

  @ApiProperty({
    example: '7891234567890',
    description: 'Código de barras do produto',
    required: false,
  })
  @IsOptional()
  @IsString()
  barcode?: string;
}
