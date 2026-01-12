import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LoyaltyTier } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { LoyaltyCalculatorService } from './loyalty-calculator.service';

interface TierDetails {
  name: string;
  benefits: string[];
  multiplier: number;
  color: string;
}

@Injectable()
export class LoyaltyTierService {
  private readonly logger = new Logger(LoyaltyTierService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly calculator: LoyaltyCalculatorService,
    private readonly events: EventEmitter2,
  ) {}

  async checkAndUpgradeTier(
    accountId: string,
  ): Promise<{ upgraded: boolean; newTier?: LoyaltyTier }> {
    const account = await this.prisma.loyaltyAccount.findUnique({
      where: { id: accountId },
    });
    if (!account) {
      throw new NotFoundException('Conta de fidelidade não encontrada');
    }

    const nextTier = this.calculator.calculateTierFromLifetimePoints(
      account.lifetimePoints,
    );
    if (nextTier !== account.tier) {
      const tierExpiresAt = this.addOneYear();
      await this.prisma.loyaltyAccount.update({
        where: { id: accountId },
        data: { tier: nextTier, tierExpiresAt },
      });
      this.events.emit('loyalty.tier.upgraded', { accountId, tier: nextTier });
      this.logger.log(`Tier upgraded for account ${accountId} to ${nextTier}`);
      return { upgraded: true, newTier: nextTier };
    }
    return { upgraded: false };
  }

  getTierProgress(
    currentPoints: number,
    currentTier: LoyaltyTier,
  ): { current: number; target: number; percentage: number } {
    const thresholds: Record<LoyaltyTier, number> = {
      [LoyaltyTier.BRONZE]: 0,
      [LoyaltyTier.SILVER]: 1000,
      [LoyaltyTier.GOLD]: 3000,
      [LoyaltyTier.DIAMOND]: 6000,
    };

    const nextTier = this.calculator.getNextTierRequirement(currentTier);
    const base = thresholds[currentTier];
    const target = nextTier.pointsNeeded > 0 ? nextTier.pointsNeeded - base : 0;
    const progress = Math.max(0, currentPoints - base);
    const percentage =
      target > 0 ? Math.min(100, Math.floor((progress / target) * 100)) : 100;

    return { current: progress, target, percentage };
  }

  getTierDetails(tier: LoyaltyTier): TierDetails {
    const benefits = this.calculator.getTierBenefits(tier);
    const multiplier = this.calculator.getTierMultiplier(tier);
    const palette: Record<LoyaltyTier, string> = {
      [LoyaltyTier.BRONZE]: '#b08d57',
      [LoyaltyTier.SILVER]: '#c0c0c0',
      [LoyaltyTier.GOLD]: '#d4af37',
      [LoyaltyTier.DIAMOND]: '#b9f2ff',
    };

    const nameMap: Record<LoyaltyTier, string> = {
      [LoyaltyTier.BRONZE]: 'Bronze',
      [LoyaltyTier.SILVER]: 'Silver',
      [LoyaltyTier.GOLD]: 'Gold',
      [LoyaltyTier.DIAMOND]: 'Diamond',
    };

    return {
      name: nameMap[tier],
      benefits,
      multiplier,
      color: palette[tier],
    };
  }

  async scheduleTierRenewal(accountId: string): Promise<void> {
    const account = await this.prisma.loyaltyAccount.findUnique({
      where: { id: accountId },
    });
    if (!account) return;

    const now = new Date();
    if (account.tierExpiresAt && account.tierExpiresAt > now) {
      return;
    }

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

    const lastYearPoints = await this.prisma.loyaltyTransaction.aggregate({
      where: {
        accountId,
        createdAt: { gte: twelveMonthsAgo },
        points: { gt: 0 },
      },
      _sum: { points: true },
    });

    const recalculatedTier = this.calculator.calculateTierFromLifetimePoints(
      lastYearPoints._sum.points ?? 0,
    );

    await this.prisma.loyaltyAccount.update({
      where: { id: accountId },
      data: {
        tier: recalculatedTier,
        tierExpiresAt: this.addOneYear(),
      },
    });

    this.logger.log(
      `Tier renewal processed for account ${accountId} -> ${recalculatedTier}`,
    );
  }

  private addOneYear(): Date {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date;
  }
}
