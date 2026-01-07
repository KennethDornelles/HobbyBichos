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

@ApiBearerAuth()
@ApiTags('orders')
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo pedido' })
  async create(@Body() dto: CreateOrderDto, @Request() req) {
    const result = await this.ordersService.create(dto, req.user);
    return result;
  }

  @Get()
  @ApiOperation({ summary: 'Listar pedidos da loja' })
  findAll(@Request() req) {
    return this.ordersService.findAll(req.user.storeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pedido por ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.ordersService.findOne(id, req.user.storeId);
  }

  @Patch(':id/finish')
  @ApiOperation({ summary: 'Finalizar pedido e atualizar estoque' })
  finishOrder(@Param('id') id: string, @Request() req) {
    return this.ordersService.finishOrder(id, req.user);
  }
}
