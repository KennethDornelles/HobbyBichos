import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePetDto {
  @ApiProperty({ example: 'store1', description: 'ID da loja do pet' })
  @IsNotEmpty()
  @IsString()
  storeId: string;
  @ApiProperty({ example: 'Rex', description: 'Nome do pet' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Cachorro', description: 'Espécie do pet' })
  @IsNotEmpty()
  @IsString()
  species: string;

  @ApiProperty({
    example: 'Labrador',
    description: 'Raça do pet',
    required: false,
  })
  @IsOptional()
  @IsString()
  breed?: string;
}
