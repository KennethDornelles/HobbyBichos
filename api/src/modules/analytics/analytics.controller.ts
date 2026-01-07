import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
// Ajuste os imports dos guards conforme seu projeto
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

interface AuthRequest {
  user: { storeId: string };
}

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.OWNER, Role.MANAGER)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('revenue-summary')
  @ApiOperation({ summary: 'Resumo de faturamento da loja' })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  async getRevenueSummary(
    @Req() req: AuthRequest,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const storeId = req.user.storeId;
    return this.analyticsService.getRevenueSummary(
      storeId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('appointment-stats')
  @ApiOperation({ summary: 'Estatísticas de agendamentos por status' })
  async getAppointmentStats(@Req() req: AuthRequest) {
    const storeId = req.user.storeId;
    return this.analyticsService.getAppointmentStats(storeId);
  }

  @Get('top-services')
  @ApiOperation({ summary: 'Top 5 serviços mais agendados' })
  async getTopServices(@Req() req: AuthRequest) {
    const storeId = req.user.storeId;
    return this.analyticsService.getTopServices(storeId);
  }

  @Get('employee-performance')
  @ApiOperation({ summary: 'Performance dos funcionários' })
  async getEmployeePerformance(@Req() req: AuthRequest) {
    const storeId = req.user.storeId;
    return this.analyticsService.getEmployeePerformance(storeId);
  }
}
