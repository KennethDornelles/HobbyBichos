import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('pets')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo pet para o usuário autenticado' })
  @ApiResponse({ status: 201, description: 'Pet criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createPetDto: CreatePetDto, @Request() req) {
    return this.petsService.create(createPetDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os pets' })
  @ApiResponse({ status: 200, description: 'Pets retornados com sucesso.' })
  findAll() {
    return this.petsService.findAll();
  }

  @Get('/me')
  @ApiOperation({ summary: 'Lista todos os pets do usuário autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Pets do usuário retornados com sucesso.',
  })
  findMyPets(@Request() req) {
    return this.petsService.findMyPets(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um pet pelo ID' })
  @ApiResponse({ status: 200, description: 'Pet encontrado.' })
  @ApiResponse({ status: 404, description: 'Pet não encontrado.' })
  findOne(@Param('id') id: string) {
    return this.petsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um pet pelo ID' })
  @ApiResponse({ status: 200, description: 'Pet atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Pet não encontrado.' })
  update(
    @Param('id') id: string,
    @Body() updatePetDto: UpdatePetDto,
    @Request() req,
  ) {
    return this.petsService.update(id, updatePetDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um pet pelo ID' })
  @ApiResponse({ status: 200, description: 'Pet removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Pet não encontrado.' })
  remove(@Param('id') id: string, @Request() req) {
    return this.petsService.remove(id, req.user.id);
  }
}
