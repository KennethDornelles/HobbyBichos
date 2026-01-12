import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Query,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { LoyaltyService } from '../services/loyalty.service';
import { LoyaltyReferralService } from '../services/loyalty-referral.service';
import { RewardType } from '@prisma/client';
import {
  GetBalanceResponseDto,
  ApplyRedemptionCodeDto,
  RedeemRewardDto,
  GenerateReferralCodeResponseDto,
} from '../dto/loyalty.dto';

interface AuthRequest {
  user: { id: string };
}

@ApiTags('Programa de Fidelidade')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loyalty')
export class LoyaltyController {
  constructor(
    private readonly loyaltyService: LoyaltyService,
    private readonly referralService: LoyaltyReferralService,
  ) {}

  @Get('balance')
  @ApiOperation({ summary: 'Obter saldo de pontos atual' })
  @ApiOkResponse({ type: GetBalanceResponseDto })
  async getBalance(@Req() req: AuthRequest): Promise<GetBalanceResponseDto> {
    try {
      return await this.loyaltyService.getBalance(req.user.id);
    } catch {
      throw new InternalServerErrorException('Erro ao obter saldo');
    }
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Histórico de transações de pontos' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  async getTransactions(
    @Req() req: AuthRequest,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      return await this.loyaltyService.getTransactionHistory(
        req.user.id,
        page || 1,
        limit || 20,
      );
    } catch {
      throw new InternalServerErrorException('Erro ao buscar transações');
    }
  }

  @Get('rewards')
  @ApiOperation({ summary: 'Listar recompensas disponíveis' })
  @ApiQuery({ name: 'minPoints', required: false, example: 0 })
  @ApiQuery({ name: 'maxPoints', required: false })
  @ApiQuery({ name: 'type', required: false })
  async getRewards(
    @Query('minPoints') minPoints?: number,
    @Query('maxPoints') maxPoints?: number,
    @Query('type') type?: string,
  ) {
    try {
      return await this.loyaltyService.getRewards({
        minPoints: minPoints ? Number(minPoints) : undefined,
        maxPoints: maxPoints ? Number(maxPoints) : undefined,
        type: type as RewardType | undefined,
      });
    } catch {
      throw new InternalServerErrorException('Erro ao buscar recompensas');
    }
  }

  @Post('redeem')
  @ApiOperation({ summary: 'Resgatar uma recompensa' })
  @ApiBadRequestResponse({
    description: 'Pontos insuficientes ou recompensa indisponível',
  })
  async redeemReward(@Req() req: AuthRequest, @Body() dto: RedeemRewardDto) {
    try {
      return await this.loyaltyService.redeemReward(req.user.id, dto);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message?.includes('Pontos insuficientes')
      ) {
        throw new BadRequestException('Você não possui pontos suficientes');
      }
      if (error instanceof Error && error.message?.includes('indisponível')) {
        throw new BadRequestException('Esta recompensa não está disponível');
      }
      throw new InternalServerErrorException('Erro ao resgatar recompensa');
    }
  }

  @Get('redemptions')
  @ApiOperation({ summary: 'Meus resgates' })
  async getMyRedemptions(@Req() req: AuthRequest) {
    try {
      return await this.loyaltyService.getMyRedemptions(req.user.id);
    } catch {
      throw new InternalServerErrorException('Erro ao buscar resgates');
    }
  }

  @Post('apply-code')
  @ApiOperation({ summary: 'Aplicar código de reembolso a um pedido' })
  @ApiBadRequestResponse({
    description: 'Código inválido, expirado ou já utilizado',
  })
  async applyRedemptionCode(@Body() dto: ApplyRedemptionCodeDto) {
    try {
      // In a real scenario, orderId would come from context
      return await this.loyaltyService.applyRedemptionCode(dto.code, '');
    } catch (error) {
      if (error instanceof Error && error.message?.includes('inválido')) {
        throw new BadRequestException('Código inválido');
      }
      if (error instanceof Error && error.message?.includes('expirado')) {
        throw new BadRequestException('Código expirado');
      }
      throw new BadRequestException('Código não pode ser utilizado');
    }
  }

  @Post('referral/generate')
  @ApiOperation({ summary: 'Gerar código de indicação' })
  @ApiOkResponse({ type: GenerateReferralCodeResponseDto })
  async generateReferralCode(
    @Req() req: AuthRequest,
  ): Promise<GenerateReferralCodeResponseDto> {
    try {
      const { code, url } = await this.referralService.generateReferralCode(
        req.user.id,
      );
      const stats = await this.referralService.getReferralStats(req.user.id);

      return new GenerateReferralCodeResponseDto({
        code,
        url,
        pointsEarned: stats.totalPointsEarned,
        totalReferrals: stats.totalReferrals,
      });
    } catch {
      throw new InternalServerErrorException(
        'Erro ao gerar código de indicação',
      );
    }
  }

  @Get('referral/stats')
  @ApiOperation({ summary: 'Estatísticas de indicações' })
  async getReferralStats(@Req() req: AuthRequest) {
    try {
      return await this.referralService.getReferralStats(req.user.id);
    } catch {
      throw new InternalServerErrorException(
        'Erro ao buscar estatísticas de indicações',
      );
    }
  }
}
