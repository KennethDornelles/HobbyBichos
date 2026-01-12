import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoyaltyTier, TransactionType, Prisma } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class LoyaltyCalculatorService {
  private readonly logger = new Logger(LoyaltyCalculatorService.name);
  private readonly dailyActionCache = new Map<string, number>();

  constructor(private readonly configService: ConfigService) {}

  calculatePointsFromPurchase(
    amount: Prisma.Decimal | number | string,
    tier: LoyaltyTier,
  ): number {
    const baseRule = Number(
      this.configService.get('LOYALTY_POINTS_PER_REAL') ?? 1,
    );
    const monetaryValue = new Prisma.Decimal(amount);
    const multiplier = this.getTierMultiplier(tier);
    return Math.floor(monetaryValue.mul(baseRule).mul(multiplier).toNumber());
  }

  calculateTierFromLifetimePoints(lifetimePoints: number): LoyaltyTier {
    if (lifetimePoints >= 6000) return LoyaltyTier.DIAMOND;
    if (lifetimePoints >= 3000) return LoyaltyTier.GOLD;
    if (lifetimePoints >= 1000) return LoyaltyTier.SILVER;
    return LoyaltyTier.BRONZE;
  }

  getNextTierRequirement(currentTier: LoyaltyTier): {
    tier: string;
    pointsNeeded: number;
  } {
    switch (currentTier) {
      case LoyaltyTier.BRONZE:
        return { tier: LoyaltyTier.SILVER, pointsNeeded: 1000 };
      case LoyaltyTier.SILVER:
        return { tier: LoyaltyTier.GOLD, pointsNeeded: 3000 };
      case LoyaltyTier.GOLD:
        return { tier: LoyaltyTier.DIAMOND, pointsNeeded: 6000 };
      case LoyaltyTier.DIAMOND:
      default:
        return { tier: LoyaltyTier.DIAMOND, pointsNeeded: 0 };
    }
  }

  getTierMultiplier(tier: LoyaltyTier): number {
    switch (tier) {
      case LoyaltyTier.SILVER:
        return 1.5;
      case LoyaltyTier.GOLD:
        return 2;
      case LoyaltyTier.DIAMOND:
        return 3;
      case LoyaltyTier.BRONZE:
      default:
        return 1;
    }
  }

  getTierBenefits(tier: LoyaltyTier): string[] {
    switch (tier) {
      case LoyaltyTier.SILVER:
        return ['5% de desconto', 'Suporte prioritário'];
      case LoyaltyTier.GOLD:
        return ['10% de desconto', 'Frete grátis', 'Atendimento VIP'];
      case LoyaltyTier.DIAMOND:
        return [
          '15% de desconto',
          'Frete grátis',
          'Brindes exclusivos',
          'Concierge',
        ];
      case LoyaltyTier.BRONZE:
      default:
        return ['Acesso ao programa', 'Ofertas especiais'];
    }
  }

  generateRedemptionCode(): string {
    const random = randomBytes(4)
      .toString('base64')
      .replace(/[^A-Z0-9]/gi, '')
      .slice(0, 6)
      .toUpperCase();
    return `HBC-${random}`;
  }

  validateDailyLimit(
    userId: string,
    actionType: TransactionType,
    maxPerDay: number,
  ): boolean {
    if (!maxPerDay || maxPerDay <= 0) {
      return true;
    }

    const today = new Date().toISOString().slice(0, 10);
    const key = `loyalty:${actionType}:${userId}:${today}`;
    const currentCount = this.dailyActionCache.get(key) ?? 0;

    if (currentCount >= maxPerDay) {
      this.logger.debug(`Daily limit reached for ${key}`);
      return false;
    }

    this.dailyActionCache.set(key, currentCount + 1);
    return true;
  }
}
