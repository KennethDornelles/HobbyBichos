import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty()
  @IsUUID()
  petId: string;

  @ApiProperty()
  @IsUUID()
  employeeId: string;

  @ApiProperty()
  @IsUUID()
  serviceId: string;

  @ApiProperty()
  @IsDateString()
  startsAt: string;
}
