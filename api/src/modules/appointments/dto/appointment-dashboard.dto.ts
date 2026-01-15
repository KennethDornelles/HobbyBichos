import { ApiProperty } from '@nestjs/swagger';

export class AppointmentDashboardDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  startsAt: Date;

  @ApiProperty()
  status: string;

  @ApiProperty()
  petName: string;

  @ApiProperty()
  petSpecies: string;

  @ApiProperty()
  clientName: string;

  @ApiProperty()
  serviceName: string;

  @ApiProperty()
  servicePrice: number;

  @ApiProperty()
  serviceDuration: number;

  @ApiProperty()
  notes?: string;
}

export class EmployeeDashboardDto {
  @ApiProperty()
  employeeId: string;

  @ApiProperty()
  employeeName: string;

  @ApiProperty()
  todayAppointments: AppointmentDashboardDto[];

  @ApiProperty()
  upcomingAppointments: AppointmentDashboardDto[];

  @ApiProperty()
  totalAppointmentsToday: number;

  @ApiProperty()
  completedAppointmentsToday: number;

  @ApiProperty()
  cancelledAppointmentsToday: number;
}
