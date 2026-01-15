import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Query,
  Param,
  Patch,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { FilterAppointmentsDto } from './dto/filter-appointments.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { EmployeeDashboardDto } from './dto/appointment-dashboard.dto';
import { ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  async create(@Body() dto: CreateAppointmentDto, @Request() req) {
    return this.appointmentsService.create(dto, req.user);
  }

  @Get()
  async findAllByStore(@Query() filter: FilterAppointmentsDto, @Request() req) {
    return this.appointmentsService.findAllByStore(filter, req.user);
  }

  @Get('employee/dashboard')
  @ApiResponse({
    status: 200,
    description: 'Dashboard de agendamentos do employee',
    type: EmployeeDashboardDto,
  })
  async getEmployeeDashboard(@Request() req) {
    return this.appointmentsService.getEmployeeDashboard(req.user);
  }

  @Patch(':id/status')
  @ApiResponse({
    status: 200,
    description: 'Status do agendamento atualizado com sucesso',
  })
  async updateAppointmentStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentStatusDto,
    @Request() req,
  ) {
    return this.appointmentsService.updateAppointmentStatus(id, dto, req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.appointmentsService.findOne(id, req.user);
  }

  // Outros endpoints CRUD podem ser implementados conforme necessário
}
