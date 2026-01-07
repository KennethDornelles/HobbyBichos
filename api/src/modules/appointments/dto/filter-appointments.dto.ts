import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsUUID } from 'class-validator';

export class FilterAppointmentsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  storeId?: string;
}
