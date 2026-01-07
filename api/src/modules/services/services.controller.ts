import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('services')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  async create(@Body() dto: CreateServiceDto, @Request() req) {
    return this.servicesService.create(dto, req.user);
  }

  @Get()
  async findAll(@Request() req) {
    return this.servicesService.findAll(req.user.storeId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.servicesService.findOne(id, req.user.storeId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
    @Request() req,
  ) {
    return this.servicesService.update(id, dto, req.user.storeId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.servicesService.remove(id, req.user.storeId);
  }
}
