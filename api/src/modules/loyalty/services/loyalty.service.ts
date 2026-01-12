import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AddPointsDto,
  GetBalanceResponseDto,
  RedeemRewardDto,
} from '../dto/loyalty.dto';
import { PrismaService } from '../../../database/prisma.service';
import {
  LoyaltyAccount,
  LoyaltyRedemption,
  LoyaltyReward,
  LoyaltyTransaction,
  LoyaltyTier,
  RewardType,
  TransactionType,
  RedemptionStatus,
  Prisma,
} from '@prisma/client';
import { LoyaltyCalculatorService } from './loyalty-calculator.service';
import { LoyaltyTierService } from './loyalty-tier.service';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pageCount: number;
  };
}

@Injectable()
export class LoyaltyService {
  private readonly logger = new Logger(LoyaltyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly calculator: LoyaltyCalculatorService,
    private readonly tierService: LoyaltyTierService,
    private readonly events: EventEmitter2,
  ) {}

  async getOrCreateAccount(userId: string): Promise<LoyaltyAccount> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const tierExpiresAt = this.addOneYear();
    return this.prisma.loyaltyAccount.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        tier: LoyaltyTier.BRONZE,
        tierExpiresAt,
      },
    });
  }

  async getBalance(userId: string): Promise<GetBalanceResponseDto> {
    const account = await this.getOrCreateAccount(userId);
    const nextTier = this.calculator.getNextTierRequirement(account.tier);
    const benefits = this.calculator.getTierBenefits(account.tier);
    const tierDetails = this.tierService.getTierDetails(account.tier);
    const progress = this.tierService.getTierProgress(
      account.currentPoints,
      account.tier,
    );

    return new GetBalanceResponseDto({
      currentPoints: account.currentPoints,
      lifetimePoints: account.lifetimePoints,
      tier: account.tier,
      tierName: tierDetails.name,
      nextTierPoints: nextTier.pointsNeeded,
      tierBenefits: benefits,
      progressPercentage: progress.percentage,
    });
  }

  async addPoints(dto: AddPointsDto): Promise<LoyaltyTransaction> {
    const account = await this.getOrCreateAccount(dto.userId);

    const [transaction] = await this.prisma.$transaction([
      this.prisma.loyaltyTransaction.create({
        data: {
          accountId: account.id,
          points: dto.points,
          type: dto.type,
          description: dto.description,
          orderId: dto.orderId,
          referenceId: dto.referenceId,
        },
      }),
      this.prisma.loyaltyAccount.update({
        where: { id: account.id },
        data: {
          currentPoints: { increment: dto.points },
          lifetimePoints: { increment: dto.points },
        },
      }),
    ]);

    await this.tierService.checkAndUpgradeTier(account.id);
    this.events.emit('loyalty.points.earned', {
      accountId: account.id,
      userId: dto.userId,
      points: dto.points,
      type: dto.type,
    });

    return transaction;
  }

  async subtractPoints(
    accountId: string,
    points: number,
    type: TransactionType,
    description: string,
  ): Promise<void> {
    const account = await this.prisma.loyaltyAccount.findUnique({
      where: { id: accountId },
    });
    if (!account) throw new NotFoundException('Conta não encontrada');
    if (account.currentPoints < points) {
      throw new BadRequestException('Pontos insuficientes');
    }

    await this.prisma.$transaction([
      this.prisma.loyaltyTransaction.create({
        data: {
          accountId,
          points: -Math.abs(points),
          type,
          description,
        },
      }),
      this.prisma.loyaltyAccount.update({
        where: { id: accountId },
        data: { currentPoints: { decrement: points } },
      }),
    ]);
  }

  async getTransactionHistory(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<LoyaltyTransaction>> {
    const account = await this.prisma.loyaltyAccount.findUnique({
      where: { userId },
    });
    if (!account) {
      return { data: [], meta: { page, limit, total: 0, pageCount: 0 } };
    }

    const skip = (page - 1) * limit;
    const [total, data] = await this.prisma.$transaction([
      this.prisma.loyaltyTransaction.count({
        where: { accountId: account.id },
      }),
      this.prisma.loyaltyTransaction.findMany({
        where: { accountId: account.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        pageCount: Math.ceil(total / limit),
      },
    };
  }

  async handleOrderCompleted(
    orderId: string,
    userId: string,
    amount: Prisma.Decimal,
  ): Promise<void> {
    const account = await this.getOrCreateAccount(userId);
    const points = this.calculator.calculatePointsFromPurchase(
      amount,
      account.tier,
    );

    const ordersCount = await this.prisma.order.count({ where: { userId } });
    const welcomeBonus = Number(process.env.LOYALTY_WELCOME_BONUS ?? 100);

    await this.addPoints({
      userId,
      points,
      type: TransactionType.PURCHASE,
      description: `Pontos por pedido ${orderId}`,
      orderId,
    });

    if (ordersCount === 1) {
      await this.addPoints({
        userId,
        points: welcomeBonus,
        type: TransactionType.WELCOME_BONUS,
        description: 'Bônus de boas-vindas',
        orderId,
      });
    }
  }

  async getRewards(filter?: {
    minPoints?: number;
    maxPoints?: number;
    type?: RewardType;
  }): Promise<(LoyaltyReward & { availableStock: number | null })[]> {
    const rewards = await this.prisma.loyaltyReward.findMany({
      where: {
        isActive: true,
        pointsCost: {
          gte: filter?.minPoints,
          lte: filter?.maxPoints,
        },
        rewardType: filter?.type,
      },
      orderBy: { pointsCost: 'asc' },
    });

    return rewards.map((reward) => ({
      ...reward,
      availableStock:
        reward.stockLimit !== null && reward.stockLimit !== undefined
          ? reward.stockLimit - reward.usedCount
          : null,
    }));
  }

  async redeemReward(
    userId: string,
    dto: RedeemRewardDto,
  ): Promise<LoyaltyRedemption> {
    const account = await this.getOrCreateAccount(userId);
    const reward = await this.prisma.loyaltyReward.findUnique({
      where: { id: dto.rewardId },
    });

    if (!reward || !reward.isActive) {
      throw new BadRequestException('Recompensa indisponível');
    }

    const availableStock =
      reward.stockLimit !== null && reward.stockLimit !== undefined
        ? reward.stockLimit - reward.usedCount
        : Infinity;

    if (availableStock <= 0) {
      throw new BadRequestException('Recompensa sem estoque');
    }

    if (account.currentPoints < reward.pointsCost) {
      throw new BadRequestException('Pontos insuficientes');
    }

    const code = this.calculator.generateRedemptionCode();
    const redemptionExpiryDays = Number(
      process.env.LOYALTY_REDEMPTION_EXPIRATION_DAYS ?? 30,
    );
    const expiresAt = this.addDays(redemptionExpiryDays);

    const [redemption] = await this.prisma.$transaction([
      this.prisma.loyaltyRedemption.create({
        data: {
          accountId: account.id,
          rewardId: reward.id,
          pointsUsed: reward.pointsCost,
          code,
          status: RedemptionStatus.PENDING,
          expiresAt,
        },
      }),
      this.prisma.loyaltyTransaction.create({
        data: {
          accountId: account.id,
          points: -reward.pointsCost,
          type: TransactionType.REDEMPTION,
          description: `Resgate ${reward.name}`,
        },
      }),
      this.prisma.loyaltyAccount.update({
        where: { id: account.id },
        data: { currentPoints: { decrement: reward.pointsCost } },
      }),
      this.prisma.loyaltyReward.update({
        where: { id: reward.id },
        data: { usedCount: { increment: 1 } },
      }),
    ]);

    return redemption;
  }

  async applyRedemptionCode(
    code: string,
    orderId: string,
  ): Promise<{ discount: Prisma.Decimal; type: RewardType }> {
    const redemption = await this.prisma.loyaltyRedemption.findUnique({
      where: { code },
      include: { reward: true },
    });

    if (!redemption || !redemption.reward) {
      throw new NotFoundException('Código inválido');
    }

    if (redemption.status !== RedemptionStatus.PENDING) {
      throw new BadRequestException('Código já utilizado');
    }

    const now = new Date();
    if (redemption.expiresAt < now) {
      throw new BadRequestException('Código expirado');
    }

    const updated = await this.prisma.loyaltyRedemption.update({
      where: { id: redemption.id },
      data: {
        status: RedemptionStatus.USED,
        usedAt: now,
        orderId,
      },
      include: { reward: true },
    });

    return { discount: updated.reward.value, type: updated.reward.rewardType };
  }

  async getMyRedemptions(userId: string): Promise<LoyaltyRedemption[]> {
    const account = await this.prisma.loyaltyAccount.findUnique({
      where: { userId },
    });
    if (!account) return [];

    return this.prisma.loyaltyRedemption.findMany({
      where: {
        accountId: account.id,
        status: { in: [RedemptionStatus.PENDING, RedemptionStatus.USED] },
      },
      include: { reward: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  private addOneYear(): Date {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date;
  }

  private addDays(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }
}
