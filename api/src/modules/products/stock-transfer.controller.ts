import { Controller, Post, Get, Body, Param, UseGuards, Query } from '@nestjs/common';
import { StockTransferService } from './stock-transfer.service';
import { CreateStockTransferDto } from './dto/create-stock-transfer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../decorators/current-user.decorator';
import type { UserFromJwt } from '../auth/models/UserFromJwt';

@Controller('products/transfers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockTransferController {
  constructor(private readonly stockTransferService: StockTransferService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.OWNER, Role.MANAGER)
  async create(
    @CurrentUser() user: UserFromJwt,
    @Body() createDto: CreateStockTransferDto,
  ) {
    return this.stockTransferService.transferStock(user.id, createDto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.OWNER, Role.MANAGER)
  async findAll(@Query('storeId') storeId?: string) {
    return this.stockTransferService.findAll(storeId);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.OWNER, Role.MANAGER)
  async findOne(@Param('id') id: string) {
    return this.stockTransferService.findOne(id);
  }
}
