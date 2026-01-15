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
  user: { id: string; storeId: string; role: string };
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
  async getDashboard(@Req() req: AuthRequest) {
    const storeId = req.user.storeId;
    if (!storeId) {
      throw new UnauthorizedException(
        'Usuário não está associado a nenhuma loja. Faça logout e login novamente.',
      );
    }
    return this.managerService.getDashboard(storeId);
  }

  @Get('dashboard/financial')
  @ApiOperation({ summary: 'Dashboard financeiro' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getFinancialDashboard(
    @Req() req: AuthRequest,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const storeId = req.user.storeId;
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.managerService.getFinancialDashboard(storeId, start, end);
  }

  // ==================== GESTÃO DE SERVIÇOS ====================

  @Get('services')
  @ApiOperation({ summary: 'Listar todos os serviços da loja' })
  async getServices(@Req() req: AuthRequest): Promise<any> {
    const storeId = req.user.storeId;
    return this.managerService.getServices(storeId);
  }

  @Get('services/:id')
  @ApiOperation({ summary: 'Detalhes de um serviço' })
  async getServiceById(
    @Req() req: AuthRequest,
    @Param('id') id: string,
  ): Promise<any> {
    const storeId = req.user.storeId;
    return this.managerService.getServiceById(storeId, id);
  }

  @Post('services')
  @ApiOperation({ summary: 'Criar novo serviço' })
  async createService(
    @Req() req: AuthRequest,
    @Body() data: any,
  ): Promise<any> {
    const storeId = req.user.storeId;
    return this.managerService.createService(storeId, data);
  }

  @Put('services/:id')
  @ApiOperation({ summary: 'Atualizar serviço' })
  async updateService(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() data: any,
  ): Promise<any> {
    const storeId = req.user.storeId;
    return this.managerService.updateService(storeId, id, data);
  }

  @Delete('services/:id')
  @ApiOperation({ summary: 'Desativar serviço' })
  async deactivateService(
    @Req() req: AuthRequest,
    @Param('id') id: string,
  ): Promise<any> {
    const storeId = req.user.storeId;
    return this.managerService.deactivateService(storeId, id);
  }

  @Get('services/:id/stats')
  @ApiOperation({ summary: 'Estatísticas de um serviço' })
  async getServiceStats(@Req() req: AuthRequest, @Param('id') id: string) {
    const storeId = req.user.storeId;
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
  async getRevenue(
    @Req() req: AuthRequest,
    @Query('period') period: string = 'month',
  ) {
    const storeId = req.user.storeId;
    return this.managerService.getRevenue(storeId, period);
  }

  @Get('financial/orders')
  @ApiOperation({ summary: 'Pedidos por período' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['today', 'week', 'month', 'year'],
  })
  async getOrders(
    @Req() req: AuthRequest,
    @Query('period') period: string = 'month',
  ) {
    const storeId = req.user.storeId;
    return this.managerService.getOrders(storeId, period);
  }

  @Get('financial/appointments')
  @ApiOperation({ summary: 'Agendamentos por período' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['today', 'week', 'month', 'year'],
  })
  async getAppointments(
    @Req() req: AuthRequest,
    @Query('period') period: string = 'month',
  ) {
    const storeId = req.user.storeId;
    return this.managerService.getAppointments(storeId, period);
  }

  @Get('financial/top-products')
  @ApiOperation({ summary: 'Produtos mais vendidos' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTopProducts(
    @Req() req: AuthRequest,
    @Query('limit') limit: string = '10',
  ): Promise<any> {
    const storeId = req.user.storeId;
    return this.managerService.getTopProducts(storeId, parseInt(limit));
  }

  @Get('financial/top-services')
  @ApiOperation({ summary: 'Serviços mais solicitados' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTopServices(
    @Req() req: AuthRequest,
    @Query('limit') limit: string = '10',
  ): Promise<any> {
    const storeId = req.user.storeId;
    return this.managerService.getTopServices(storeId, parseInt(limit));
  }

  // ==================== RELATÓRIOS ====================

  @Get('reports/daily')
  @ApiOperation({ summary: 'Relatório diário' })
  @ApiQuery({ name: 'date', required: false, type: String })
  async getDailyReport(@Req() req: AuthRequest, @Query('date') date?: string) {
    const storeId = req.user.storeId;
    const reportDate = date ? new Date(date) : new Date();
    return this.managerService.getDailyReport(storeId, reportDate);
  }

  @Get('reports/employee-performance')
  @ApiOperation({ summary: 'Performance dos funcionários' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getEmployeePerformance(
    @Req() req: AuthRequest,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const storeId = req.user.storeId;
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.managerService.getEmployeePerformance(storeId, start, end);
  }

  // ==================== GESTÃO DE USUÁRIOS ====================

  @Get('users')
  @ApiOperation({ summary: 'Listar usuários (equipe e clientes)' })
  @ApiQuery({ name: 'role', required: false, type: String })
  async getUsers(
    @Req() req: AuthRequest,
    @Query('role') role?: string,
  ): Promise<any> {
    const storeId = req.user.storeId;
    const userRole = req.user.role;
    return this.managerService.getUsers(storeId, userRole, role);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Detalhes de um usuário' })
  async getUserById(
    @Req() req: AuthRequest,
    @Param('id') id: string,
  ): Promise<any> {
    const storeId = req.user.storeId;
    const userRole = req.user.role;
    return this.managerService.getUserById(storeId, userRole, id);
  }

  @Post('users')
  @ApiOperation({ summary: 'Criar novo usuário (equipe ou cliente)' })
  async createUser(
    @Req() req: AuthRequest,
    @Body() data: any,
  ): Promise<any> {
    const storeId = req.user.storeId;
    const userRole = req.user.role;
    return this.managerService.createUser(storeId, userRole, data);
  }

  @Put('users/:id')
  @ApiOperation({ summary: 'Atualizar usuário' })
  async updateUser(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() data: any,
  ): Promise<any> {
    const storeId = req.user.storeId;
    const userRole = req.user.role;
    return this.managerService.updateUser(storeId, userRole, id, data);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Desativar/remover usuário' })
  async deleteUser(
    @Req() req: AuthRequest,
    @Param('id') id: string,
  ): Promise<any> {
    const storeId = req.user.storeId;
    const userRole = req.user.role;
    return this.managerService.deleteUser(storeId, userRole, id);
  }
}
