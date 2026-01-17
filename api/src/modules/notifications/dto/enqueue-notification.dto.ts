import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsObject,
  IsUUID,
} from 'class-validator';

export class EnqueueNotificationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  storeId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty()
  @IsObject()
  @IsNotEmpty()
  payload: any;
}
