import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateAppointmentStatusDto {
  @ApiProperty({
    description: 'Status do agendamento',
    enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
    example: 'COMPLETED',
  })
  @IsIn(['SCHEDULED', 'COMPLETED', 'CANCELLED'])
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

  @ApiProperty({
    description: 'Notas ou observações sobre o agendamento',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
