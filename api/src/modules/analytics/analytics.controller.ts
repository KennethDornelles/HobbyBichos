import { Controller, Get, Query, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AnalyticsQueryDto } from './dto/analytics-filters.dto';

interface AuthRequest {
  user: { id: string; storeId: string | null; role: string };
}

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles(Role.SUPER_ADMIN, Role.OWNER, Role.MANAGER)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  private getEffectiveStoreId(user: AuthRequest['user'], queryStoreId?: string): string {
    if (user.role === Role.SUPER_ADMIN || user.role === Role.OWNER) {
      if (queryStoreId) return queryStoreId;
      if (user.storeId) return user.storeId;
      throw new ForbiddenException('Informe o storeId para consulta administrativa');
    }
    
    if (!user.storeId) {
      throw new ForbiddenException('Usuário sem loja vinculada');
    }
    
    return user.storeId;
  }

  @Get('sales')
  @ApiOperation({ summary: 'Análise detalhada de vendas e faturamento' })
  async getSalesAnalytics(
    @Req() req: AuthRequest,
    @Query() query: AnalyticsQueryDto,
  ) {
    const storeId = this.getEffectiveStoreId(req.user, query.storeId);
    const start = query.startDate ? new Date(query.startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = query.endDate ? new Date(query.endDate) : new Date();

    return this.analyticsService.getSalesAnalytics(storeId, start, end);
  }

  @Get('products')
  @ApiOperation({ summary: 'Ranking de performance de produtos' })
  async getProductPerformance(
    @Req() req: AuthRequest,
    @Query() query: AnalyticsQueryDto,
  ) {
    const storeId = this.getEffectiveStoreId(req.user, query.storeId);
    const start = query.startDate ? new Date(query.startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = query.endDate ? new Date(query.endDate) : new Date();

    return this.analyticsService.getProductPerformance(storeId, start, end);
  }

  @Get('appointments-detailed')
  @ApiOperation({ summary: 'Insights operacionais de agendamentos' })
  async getAppointmentInDepth(
    @Req() req: AuthRequest,
    @Query() query: AnalyticsQueryDto,
  ) {
    const storeId = this.getEffectiveStoreId(req.user, query.storeId);
    const start = query.startDate ? new Date(query.startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = query.endDate ? new Date(query.endDate) : new Date();

    return this.analyticsService.getAppointmentInDepth(storeId, start, end);
  }

  @Get('customers')
  @ApiOperation({ summary: 'Métricas de ticket médio e base de clientes' })
  async getCustomerMetrics(
    @Req() req: AuthRequest,
    @Query() query: AnalyticsQueryDto,
  ) {
    const storeId = this.getEffectiveStoreId(req.user, query.storeId);
    const start = query.startDate ? new Date(query.startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = query.endDate ? new Date(query.endDate) : new Date();

    return this.analyticsService.getCustomerMetrics(storeId, start, end);
  }

  // Mantendo endpoints simplificados para compatibilidade ou widgets rápidos
  @Get('revenue-summary')
  @ApiOperation({ summary: 'Resumo rápido de faturamento' })
  async getRevenueSummary(
    @Req() req: AuthRequest,
    @Query() query: AnalyticsQueryDto,
  ) {
    const storeId = this.getEffectiveStoreId(req.user, query.storeId);
    const start = query.startDate ? new Date(query.startDate) : new Date(new Date().setHours(0,0,0,0));
    const end = query.endDate ? new Date(query.endDate) : new Date();

    return this.analyticsService.getRevenueSummary(storeId, start, end);
  }
}

