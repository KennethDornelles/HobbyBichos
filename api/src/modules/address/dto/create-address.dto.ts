import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsPostalCode } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ description: 'Título do endereço', example: 'Casa' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Rua', example: 'Av. Paulista' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ description: 'Número', example: '1000' })
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiProperty({ description: 'Complemento', example: 'Apto 101', required: false })
  @IsString()
  @IsOptional()
  complement?: string;

  @ApiProperty({ description: 'Bairro', example: 'Bela Vista' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({ description: 'Cidade', example: 'São Paulo' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'Estado', example: 'SP' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ description: 'CEP', example: '01310-100' })
  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @ApiProperty({ description: 'Endereço padrão?', example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
