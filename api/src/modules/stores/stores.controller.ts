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
import { Public } from '../../decorators/public.decorator';

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

  @Get('nearby/search')
  @Public()
  @ApiOperation({ summary: 'Busca lojas próximas a uma localização' })
  @ApiQuery({
    name: 'latitude',
    required: true,
    type: Number,
    description: 'Latitude da posição do usuário',
    example: -7.1664,
  })
  @ApiQuery({
    name: 'longitude',
    required: true,
    type: Number,
    description: 'Longitude da posição do usuário',
    example: -34.8475,
  })
  @ApiQuery({
    name: 'radius',
    required: false,
    type: Number,
    description: 'Raio de busca em quilômetros (padrão: 5)',
    example: 5,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número máximo de lojas a retornar (padrão: 3)',
    example: 3,
  })
  @ApiResponse({
    status: 200,
    description: 'Lojas próximas encontradas com sucesso.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          distance: { type: 'number', description: 'Distância em km' },
          distanceText: { type: 'string', description: 'Distância formatada' },
          durationMinutes: {
            type: 'number',
            description: 'Tempo estimado em minutos',
          },
          latitude: { type: 'number' },
          longitude: { type: 'number' },
          address: { type: 'string' },
          phone: { type: 'string' },
        },
      },
    },
  })
  findNearby(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('radius') radius?: string,
    @Query('limit') limit?: string,
  ) {
    return this.storesService.findNearby(
      parseFloat(latitude),
      parseFloat(longitude),
      radius ? parseFloat(radius) : 5,
      limit ? parseInt(limit) : 3,
    );
  }
}
