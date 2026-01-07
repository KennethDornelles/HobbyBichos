import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import {
  ApiQuery,
  ApiOkResponse,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  StoreBusinessHourDto,
  StoreExclusionDto,
} from './dto/store-availability.dto';
import { StoresService } from './stores.service';

import { CreateStoreDto } from './dto/create-store.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('stores')
@ApiBearerAuth('JWT-auth')
@ApiExtraModels(StoreBusinessHourDto, StoreExclusionDto)
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}
  @Get(':id/availability')
  @ApiOperation({
    summary: 'Retorna os horários disponíveis da loja para um dia',
  })
  @ApiQuery({
    name: 'date',
    required: true,
    type: String,
    description: 'Data no formato YYYY-MM-DD',
  })
  @ApiOkResponse({
    description: 'Lista de horários disponíveis',
    schema: {
      type: 'object',
      properties: {
        slots: { type: 'array', items: { type: 'string', example: '09:00' } },
        businessHour: { $ref: getSchemaPath(StoreBusinessHourDto) },
        exclusions: {
          type: 'array',
          items: { $ref: getSchemaPath(StoreExclusionDto) },
        },
      },
    },
  })
  async getAvailability(@Param('id') id: string, @Query('date') date: string) {
    return this.storesService.getAvailability(id, date);
  }

  @Post()
  @ApiOperation({ summary: 'Cria uma nova loja' })
  @ApiResponse({ status: 201, description: 'Loja criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as lojas' })
  @ApiResponse({ status: 200, description: 'Lojas retornadas com sucesso.' })
  findAll() {
    return this.storesService.findAll();
  }
}
