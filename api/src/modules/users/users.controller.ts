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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
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

  @Post()
  @ApiOperation({ summary: 'Cria um novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
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
