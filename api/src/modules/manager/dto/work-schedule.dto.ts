import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WorkScheduleDto {
  @ApiProperty({ example: 0, description: 'Dia da semana (0=Domingo, 6=Sábado)' })
  @IsInt()
  @Min(0)
  @Max(6)
  weekday: number;

  @ApiProperty({ example: '09:00', description: 'Horário de início (HH:mm)' })
  @IsString()
  @IsOptional()
  startTime: string;

  @ApiProperty({ example: '18:00', description: 'Horário de término (HH:mm)' })
  @IsString()
  @IsOptional()
  endTime: string;

  @ApiProperty({ example: '12:00', description: 'Início do intervalo (HH:mm)', required: false })
  @IsString()
  @IsOptional()
  startBreak?: string;

  @ApiProperty({ example: '13:00', description: 'Fim do intervalo (HH:mm)', required: false })
  @IsString()
  @IsOptional()
  endBreak?: string;

  @ApiProperty({ example: false, description: 'Se é dia de folga' })
  @IsBoolean()
  @IsOptional()
  isDayOff: boolean;
}
