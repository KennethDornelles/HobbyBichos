import { IsString, IsInt, IsPositive, IsOptional, Min } from 'class-validator';

export class CreateStockTransferDto {
  @IsString()
  productId: string;

  @IsString()
  fromStoreId: string;

  @IsString()
  toStoreId: string;

  @IsInt()
  @IsPositive()
  @Min(1)
  quantity: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
