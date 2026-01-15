import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Patch,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { Public } from '../../decorators/public.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Interface para tipar o usuário autenticado
  private getUserFromRequest(req: { user?: { id: string; role: Role } }) {
    if (!req.user) throw new ForbiddenException('Usuário não autenticado');
    return req.user;
  }

  @Roles(Role.OWNER, Role.MANAGER)
  @Get('store/:storeId')
  @ApiOperation({ summary: 'Lista todos os usuários de uma loja' })
  @ApiResponse({ status: 200, description: 'Usuários retornados com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  async findAllByStore(@Param('storeId') storeId: string) {
    return this.usersService.findAllByStore(storeId);
  }

  @Public()
  @Get('lookup')
  @ApiOperation({
    summary: 'Busca pública de membro (scanner, sem autenticação)',
  })
  @ApiResponse({ status: 200, description: 'Membro encontrado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Membro não encontrado.' })
  async lookupMember(@Query('email') email?: string, @Query('id') id?: string) {
    if (!email && !id) {
      throw new BadRequestException('Informe email ou id para buscar o membro');
    }

    let user;
    if (email) {
      user = await this.usersService.findByEmail(email);
    } else if (id) {
      user = await this.usersService.findById(id);
    }

    if (!user) {
      throw new NotFoundException('Membro não encontrado');
    }

    return user;
  }

  @Public()
  @Get('code/:code')
  @ApiOperation({ summary: 'Busca usuário por código de membro (público)' })
  @ApiResponse({ status: 200, description: 'Usuário retornado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Código não encontrado.' })
  async findByMemberCode(@Param('code') code: string) {
    const user = await this.usersService.findByMemberCode(code);
    if (!user) {
      throw new NotFoundException('Código não encontrado');
    }
    return user;
  }

  @Get('store/:storeId/employees')
  @ApiOperation({
    summary:
      'Lista funcionários disponíveis de uma loja (público para agendamentos)',
  })
  @ApiResponse({
    status: 200,
    description: 'Funcionários retornados com sucesso.',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async findEmployeesByStore(@Param('storeId') storeId: string) {
    return this.usersService.findEmployeesByStore(storeId);
  }

  @Public()
  @Post('loyalty')
  @ApiOperation({
    summary:
      'Cria/vincula loyalty account para usuário existente (público para testes)',
  })
  @ApiResponse({
    status: 200,
    description: 'Loyalty criado/vinculado com sucesso.',
  })
  async createLoyaltyForUser(@Body() body: { email?: string; id?: string }) {
    return this.usersService.ensureLoyaltyForUser({
      email: body.email,
      id: body.id,
    });
  }

  @Public()
  @Post('code')
  @ApiOperation({
    summary: 'Vincula código de membro a um usuário (público para testes)',
  })
  @ApiResponse({ status: 200, description: 'Código vinculado com sucesso.' })
  async setMemberCode(
    @Body() body: { email?: string; id?: string; code: string },
  ) {
    return this.usersService.assignMemberCode({
      email: body.email,
      id: body.id,
      code: body.code,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Cria um novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  async create(
    @Body() dto: CreateUserDto,
    @Request() req: { user?: { role: Role } },
  ) {
    // Se não estiver autenticado, creatorRole será undefined (ex: cadastro público)
    const creatorRole = req.user?.role;
    return this.usersService.create(dto, creatorRole);
  }

  @Get('me')
  @ApiOperation({ summary: 'Obtém o perfil do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil retornado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async getProfile(@Request() req: { user?: { id: string; role: Role } }) {
    const user = this.getUserFromRequest(req);
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Atualiza o perfil do usuário autenticado (CLIENT)',
  })
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({
    status: 403,
    description: 'Apenas CLIENT pode editar o próprio perfil.',
  })
  async updateProfile(
    @Request() req: { user?: { id: string; role: Role } },
    @Body() dto: UpdateUserDto,
  ) {
    const user = this.getUserFromRequest(req);
    if (user.role !== Role.CLIENT) {
      throw new ForbiddenException(
        'Apenas CLIENT pode editar o próprio perfil',
      );
    }
    return this.usersService.update(user.id, dto);
  }
}
