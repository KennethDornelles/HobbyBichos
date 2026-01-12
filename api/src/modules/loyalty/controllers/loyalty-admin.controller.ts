import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../decorators/roles.decorator';
import { Role } from '@prisma/client';
import { LoyaltyService } from '../services/loyalty.service';
import {
  CreateRewardDto,
  UpdateRewardDto,
  AddPointsDto,
} from '../dto/loyalty.dto';

@ApiTags('Admin - Programa de Fidelidade')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.OWNER, Role.MANAGER)
@Controller('admin/loyalty')
export class LoyaltyAdminController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('accounts')
  @ApiOperation({ summary: 'Listar todas as contas de fidelidade' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'tier', required: false })
  @ApiQuery({ name: 'minPoints', required: false })
  listAccounts(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('tier') tier?: string,
    @Query('minPoints') minPoints?: number,
  ) {
    try {
      // Implementation would connect to Prisma to fetch accounts with filters
      return {
        message: 'Accounts list functionality to be implemented',
        filters: { page, limit, tier, minPoints },
      };
    } catch {
      throw new InternalServerErrorException('Erro ao buscar contas');
    }
  }

  @Get('accounts/:id')
  @ApiOperation({ summary: 'Detalhes de uma conta de fidelidade' })
  @ApiParam({ name: 'id', description: 'ID da conta' })
  getAccountDetails(@Param('id') id: string) {
    try {
      return {
        message: 'Account details functionality to be implemented',
        accountId: id,
      };
    } catch {
      throw new InternalServerErrorException(
        'Erro ao buscar detalhes da conta',
      );
    }
  }

  @Post('adjust')
  @ApiOperation({ summary: 'Ajustar pontos manualmente' })
  async adjustPoints(@Body() dto: AddPointsDto) {
    try {
      return await this.loyaltyService.addPoints({
        ...dto,
        description: `[ADMIN] ${dto.description}`,
      });
    } catch {
      throw new InternalServerErrorException('Erro ao ajustar pontos');
    }
  }

  @Post('rewards')
  @ApiOperation({ summary: 'Criar nova recompensa' })
  createReward(@Body() dto: CreateRewardDto) {
    try {
      return {
        message: 'Reward creation functionality to be implemented',
        reward: dto,
      };
    } catch {
      throw new InternalServerErrorException('Erro ao criar recompensa');
    }
  }

  @Put('rewards/:id')
  @ApiOperation({ summary: 'Atualizar recompensa' })
  @ApiParam({ name: 'id', description: 'ID da recompensa' })
  updateReward(@Param('id') id: string, @Body() dto: UpdateRewardDto) {
    try {
      return {
        message: 'Reward update functionality to be implemented',
        rewardId: id,
        updates: dto,
      };
    } catch {
      throw new InternalServerErrorException('Erro ao atualizar recompensa');
    }
  }

  @Delete('rewards/:id')
  @ApiOperation({ summary: 'Remover recompensa' })
  @ApiParam({ name: 'id', description: 'ID da recompensa' })
  deleteReward(@Param('id') id: string) {
    try {
      return { message: 'Reward deleted successfully', rewardId: id };
    } catch {
      throw new InternalServerErrorException('Erro ao remover recompensa');
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas do programa' })
  getStats() {
    try {
      return {
        message: 'Statistics functionality to be implemented',
        stats: {
          totalAccounts: 0,
          totalPoints: 0,
          avgPointsPerUser: 0,
          distributionByTier: {},
          topRewards: [],
        },
      };
    } catch {
      throw new InternalServerErrorException('Erro ao buscar estatísticas');
    }
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Ranking de usuários por pontos' })
  @ApiQuery({ name: 'period', required: false })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  getLeaderboard(
    @Query('period') period?: string,
    @Query('limit') limit?: number,
  ) {
    try {
      return {
        message: 'Leaderboard functionality to be implemented',
        filters: { period, limit },
      };
    } catch {
      throw new InternalServerErrorException('Erro ao buscar ranking');
    }
  }
}
