import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Request as ExpressRequest } from 'express';
import type { AuthUser } from './orders.service';

interface AuthenticatedRequest extends ExpressRequest {
  user?: AuthUser;
}

@ApiBearerAuth()
@ApiTags('orders')
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo pedido' })
  async create(
    @Body() dto: CreateOrderDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const user = req.user as AuthUser;
    const result = await this.ordersService.create(dto, user);
    return result;
  }

  @Get()
  @ApiOperation({ summary: 'Listar pedidos' })
  findAll(@Request() req: AuthenticatedRequest) {
    const user = req.user as AuthUser;
    return this.ordersService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pedido por ID' })
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const user = req.user as AuthUser;
    return this.ordersService.findOne(id, user);
  }

  @Patch(':id/finish')
  @ApiOperation({ summary: 'Finalizar pedido e atualizar estoque' })
  finishOrder(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const user = req.user as AuthUser;
    return this.ordersService.finishOrder(id, user);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancelar pedido' })
  cancelOrder(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const user = req.user as AuthUser;
    return this.ordersService.cancelOrder(id, user);
  }

  @Patch(':id/test-status')
  @ApiOperation({
    summary: 'Atualizar status do pedido para testes (dev only)',
  })
  testUpdateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Request() req: AuthenticatedRequest,
  ) {
    const user = req.user as AuthUser;
    return this.ordersService.testUpdateStatus(id, body.status, user);
  }
}
