import { ApiProperty } from '@nestjs/swagger';

export class StoreBusinessHourDto {
  @ApiProperty({
    example: 1,
    description: 'Dia da semana (0=Domingo, 6=Sábado)',
  })
  weekday: number;

  @ApiProperty({ example: '08:00', description: 'Horário de abertura' })
  openTime: string;

  @ApiProperty({ example: '18:00', description: 'Horário de fechamento' })
  closeTime: string;
}

export class StoreExclusionDto {
  @ApiProperty({
    example: '2026-01-01',
    description: 'Data de exclusão (feriado ou fechamento)',
  })
  date: string;

  @ApiProperty({
    example: 'Ano Novo',
    description: 'Motivo do fechamento',
    required: false,
  })
  reason?: string;
}
