import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  street!: string;

  @IsString()
  number!: string;

  @IsOptional()
  @IsString()
  complement?: string;

  @IsString()
  neighborhood!: string;

  @IsString()
  city!: string;

  @IsString()
  state!: string;

  @IsString()
  zipCode!: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsInt()
  userId!: number;
}
