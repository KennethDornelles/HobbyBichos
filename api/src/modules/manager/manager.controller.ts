import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ManagerService } from './manager.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

interface AuthRequest {
  user: { id: string; storeId: string | null; role: string; email: string };
}

@ApiTags('Manager')
@Controller('manager')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles(Role.SUPER_ADMIN, Role.OWNER, Role.MANAGER)
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  // ==================== DASHBOARD ====================

  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard gerencial completo' })
  @ApiQuery({ name: 'storeId', required: false, type: String })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'state', required: false, type: String })
  async getDashboard(
    @Req() req: AuthRequest,
    @Query('storeId') queryStoreId?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
  ) {
    const storeId = await this.managerService.getEffectiveStoreId(
      req.user,
      queryStoreId,
    );
    return this.managerService.getDashboard(storeId, city, state);
  }

  @Get('dashboard/financial')
  @ApiOperation({ summary: 'Dashboard financeiro' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'storeId', required: false, type: String })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'state', required: false, type: String })
  async getFinancialDashboard(
    @Req() req: AuthRequest,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('storeId') queryStoreId?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
  ) {
    const storeId = await this.managerService.getEffectiveStoreId(
      req.user,
      queryStoreId,
    );
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.managerService.getFinancialDashboard(
      storeId,
      start,
      end,
      city,
      state,
    );
  }

  @Get('analytics/benchmarking')
  @ApiOperation({ summary: 'Benchmarking entre lojas' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'state', required: false, type: String })
  async getBenchmarking(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.managerService.getBenchmarking(start, end, city, state);
  }

  // ==================== GESTÃO DE SERVIÇOS ====================

  @Get('services')
  @ApiOperation({ summary: 'Listar todos os serviços da loja' })
  @ApiQuery({ name: 'storeId', required: false, type: String })
  async getServices(
    @Req() req: AuthRequest,
    @Query('storeId') queryStoreId?: string,
  ): Promise<any> {
    const storeId = await this.managerService.getEffectiveStoreId(
      req.user,
      queryStoreId,
    );
    return this.managerService.getServices(storeId);
  }

  @Get('services/:id')
  @ApiOperation({ summary: 'Detalhes de um serviço' })
  @ApiQuery({ name: 'storeId', required: false, type: String })
  async getServiceById(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Query('storeId') queryStoreId?: string,
  ): Promise<any> {
    const storeId = await this.managerService.getEffectiveStoreId(
      req.user,
      queryStoreId,
    );
    return this.managerService.getServiceById(storeId, id);
  }

  @Post('services')
  @ApiOperation({ summary: 'Criar novo serviço' })
  @ApiQuery({ name: 'storeId', required: false, type: String })
  async createService(
    @Req() req: AuthRequest,
    @Body() data: any,
    @Query('storeId') queryStoreId?: string,
  ): Promise<any> {
    const storeId = await this.managerService.getEffectiveStoreId(
      req.user,
      queryStoreId,
    );
    return this.managerService.createService(storeId, data);
  }

  @Put('services/:id')
  @ApiOperation({ summary: 'Atualizar serviço' })
  @ApiQuery({ name: 'storeId', required: false, type: String })
  async updateService(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() data: any,
    @Query('storeId') queryStoreId?: string,
  ): Promise<any> {
    const storeId = await this.managerService.getEffectiveStoreId(
      req.user,
      queryStoreId,
    );
    return this.managerService.updateService(storeId, id, data);
  }

  @Delete('services/:id')
  @ApiOperation({ summary: 'Desativar serviço' })
  @ApiQuery({ name: 'storeId', required: false, type: String })
  async deactivateService(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Query('storeId') queryStoreId?: string,
  ): Promise<any> {
    const storeId = await this.managerService.getEffectiveStoreId(
      req.user,
      queryStoreId,
    );
    return this.managerService.deactivateService(storeId, id);
  }

  @Get('services/:id/stats')
  @ApiOperation({ summary: 'Estatísticas de um serviço' })
  @ApiQuery({ name: 'storeId', required: false, type: String })
  async getServiceStats(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Query('storeId') queryStoreId?: string,
  ) {
    const storeId = await this.managerService.getEffectiveStoreId(
      req.user,
      queryStoreId,
    );
    return this.managerService.getServiceStats(storeId, id);
  }

  // ==================== FINANCEIRO ====================

  @Get('financial/revenue')
  @ApiOperation({ summary: 'Receita por período' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['today', 'week', 'month', 'year'],
  })
  @ApiQuery({ name: 'storeId', required: false, type: String })
  async getRevenue(
    @Req() req: AuthRequest,
    @Query('period') period: string = 'month',
    @Query('storeId') queryStoreId?: string,
  ) {
    const storeId = await this.managerService.getEffectiveStoreId(
      req.user,
      queryStoreId,
    );
    return this.managerService.getRevenue(storeId, period);
  }

  @Get('financial/orders')
  @ApiOperation({ summary: 'Pedidos por período' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['today', 'week', 'month', 'year'],
  })
  @ApiQuery({ name: 'storeId', required: false, type: String })
  async getOrders(
    @Req() req: AuthRequest,
    @Query('period') period: string = 'month',
    @Query('storeId') queryStoreId?: string,
  ) {
    const storeId = await this.managerService.getEffectiveStoreId(
      req.user,
      queryStoreId,
    );
    return this.managerService.getOrders(storeId, period);
  }

  @Get('financial/appointments')
  @ApiOperation({ summary: 'Agendamentos por período' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['today', 'week', 'month', 'year'],
  })
  @ApiQuery({ name: 'storeId', required: false, type: String })
  async getAppointments(
    @Req() req: AuthRequest,
    @Query('period') period: string = 'month',
    @Query('storeId') queryStoreId?: string,
  ) {
    const storeId = await this.managerService.getEffectiveStoreId(
      req.user,
      queryStoreId,
    );
    return this.managerService.getAppointments(storeId, period);
  }

  @Get('financial/top-products')
  @ApiOperation({ summary: 'Produtos mais vendidos' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'storeId', required: false, type: String })
  async getTopProducts(
    @Req() req: AuthRequest,
    @Query('limit') limit: string = '10',
    @Query('storeId') queryStoreId?: string,
  ): Promise<any> {
    const storeId = await this.managerService.getEffectiveStoreId(
      req.user,
      queryStoreId,
    );
    return this.managerService.getTopProducts(storeId, parseInt(limit));
  }

  @Get('financial/top-services')
  @ApiOperation({ summary: 'Serviços mais solicitados' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'storeId', required: false, type: String })
  async getTopServices(
    @Req() req: AuthRequest,
    @Query('limit') limit: string = '10',
    @Query('storeId') queryStoreId?: string,
  ): Promise<any> {
    const storeId = await this.managerService.getEffectiveStoreId(
      req.user,
      queryStoreId,
    );
    return this.managerService.getTopServices(storeId, parseInt(limit));
  }

  // ==================== RELATÓRIOS ====================

  @Get('reports/daily')
  @ApiOperation({ summary: 'Relatório diário' })
  @ApiQuery({ name: 'date', required: false, type: String })
  @ApiQuery({ name: 'storeId', required: false, type: String })
  async getDailyReport(
    @Req() req: AuthRequest,
    @Query('date') date?: string,
    @Query('storeId') queryStoreId?: string,
  ) {
    const storeId = await this.managerService.getEffectiveStoreId(
      req.user,
      queryStoreId,
    );
    const reportDate = date ? new Date(date) : new Date();
    return this.managerService.getDailyReport(storeId, reportDate);
  }

  @Get('reports/employee-performance')
  @ApiOperation({ summary: 'Performance dos funcionários' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'storeId', required: false, type: String })
  async getEmployeePerformance(
    @Req() req: AuthRequest,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('storeId') queryStoreId?: string,
  ) {
    const storeId = await this.managerService.getEffectiveStoreId(
      req.user,
      queryStoreId,
    );
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.managerService.getEmployeePerformance(storeId, start, end);
  }

  // ==================== GESTÃO DE USUÁRIOS ====================

  @Get('users')
  @ApiOperation({ summary: 'Listar usuários (equipe e clientes)' })
  @ApiQuery({ name: 'role', required: false, type: String })
  @ApiQuery({ name: 'storeId', required: false, type: String })
  async getUsers(
    @Req() req: AuthRequest,
    @Query('role') role?: string,
    @Query('storeId') queryStoreId?: string,
  ): Promise<any> {
    const storeId = await this.managerService.getEffectiveStoreId(
      req.user,
      queryStoreId,
    );
    const userRole = req.user.role;
    return this.managerService.getUsers(storeId, userRole, role);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Detalhes de um usuário' })
  @ApiQuery({ name: 'storeId', required: false, type: String })
  async getUserById(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Query('storeId') queryStoreId?: string,
  ): Promise<any> {
    const storeId = await this.managerService.getEffectiveStoreId(
      req.user,
      queryStoreId,
    );
    const userRole = req.user.role;
    return this.managerService.getUserById(storeId, userRole, id);
  }

  @Post('users')
  @ApiOperation({ summary: 'Criar novo usuário (equipe ou cliente)' })
  @ApiQuery({ name: 'storeId', required: false, type: String })
  async createUser(
    @Req() req: AuthRequest,
    @Body() data: any,
    @Query('storeId') queryStoreId?: string,
  ): Promise<any> {
    const storeId = await this.managerService.getEffectiveStoreId(
      req.user,
      queryStoreId,
    );
    const userRole = req.user.role;
    return this.managerService.createUser(storeId, userRole, data);
  }

  @Put('users/:id')
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiQuery({ name: 'storeId', required: false, type: String })
  async updateUser(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() data: any,
    @Query('storeId') queryStoreId?: string,
  ): Promise<any> {
    const storeId = await this.managerService.getEffectiveStoreId(
      req.user,
      queryStoreId,
    );
    const userRole = req.user.role;
    return this.managerService.updateUser(storeId, userRole, id, data);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Desativar/remover usuário' })
  @ApiQuery({ name: 'storeId', required: false, type: String })
  async deleteUser(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Query('storeId') queryStoreId?: string,
  ): Promise<any> {
    const storeId = await this.managerService.getEffectiveStoreId(
      req.user,
      queryStoreId,
    );
    const userRole = req.user.role;
    return this.managerService.deleteUser(storeId, userRole, id);
  }
}
