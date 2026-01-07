import { ApiProperty } from '@nestjs/swagger';

export class Review {
  @ApiProperty()
  id: string;

  @ApiProperty()
  stars: number;

  @ApiProperty({ required: false })
  comment?: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  storeId: string;

  @ApiProperty()
  employeeId: string;

  @ApiProperty()
  appointmentId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
