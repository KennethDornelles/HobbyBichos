import {
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class OrderItemDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  productId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  serviceId?: string;

  @IsNumber()
  @ApiProperty()
  quantity: number;

  @IsNumber()
  @ApiProperty()
  price: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  professionalId?: string;
}

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  storeId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  petId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  appointmentId?: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        productId: { type: 'string', nullable: true },
        serviceId: { type: 'string', nullable: true },
        quantity: { type: 'number' },
        price: { type: 'number' },
        professionalId: { type: 'string', nullable: true },
      },
    },
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'O pedido deve conter pelo menos um item' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  customerPhone?: string;
}
