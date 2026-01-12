import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { LoyaltyService } from './loyalty.service';
import { ReferralStatus, TransactionType } from '@prisma/client';

@Injectable()
export class LoyaltyReferralService {
  private readonly logger = new Logger(LoyaltyReferralService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => LoyaltyService))
    private readonly loyaltyService: LoyaltyService,
  ) {}

  async generateReferralCode(
    userId: string,
  ): Promise<{ code: string; url: string }> {
    const account = await this.loyaltyService.getOrCreateAccount(userId);
    const code = await this.generateUniqueCode();

    await this.prisma.referral.create({
      data: {
        referrerId: account.id,
        code,
        status: ReferralStatus.PENDING,
      },
    });

    const url = `${process.env.APP_URL ?? 'https://hobbybichos.com'}/ref/${code}`;
    return { code, url };
  }

  async processReferralSignup(referralCode: string, newUserId: string) {
    const referral = await this.prisma.referral.findUnique({
      where: { code: referralCode },
    });
    if (!referral) {
      throw new Error('Código de indicação inválido');
    }

    return this.prisma.referral.update({
      where: { id: referral.id },
      data: { refereeId: newUserId, status: ReferralStatus.PENDING },
    });
  }

  async processReferralFirstPurchase(userId: string): Promise<void> {
    const referral = await this.prisma.referral.findFirst({
      where: { refereeId: userId, status: ReferralStatus.PENDING },
    });

    if (!referral) return;

    const referrerAccount = await this.prisma.loyaltyAccount.findUnique({
      where: { id: referral.referrerId },
    });
    if (!referrerAccount) return;

    await this.prisma.$transaction(async () => {
      await this.loyaltyService.addPoints({
        userId: referrerAccount.userId,
        points: 200,
        type: TransactionType.REFERRAL,
        description: 'Bônus por indicação concluída',
        referenceId: referral.id,
      });

      await this.loyaltyService.addPoints({
        userId,
        points: 50,
        type: TransactionType.WELCOME_BONUS,
        description: 'Bônus por indicação',
        referenceId: referral.id,
      });

      await this.prisma.referral.update({
        where: { id: referral.id },
        data: {
          status: ReferralStatus.COMPLETED,
          completedAt: new Date(),
          pointsEarned: 200,
        },
      });
    });
  }

  async getReferralStats(userId: string): Promise<{
    totalReferrals: number;
    completedReferrals: number;
    pendingReferrals: number;
    totalPointsEarned: number;
  }> {
    const account = await this.prisma.loyaltyAccount.findUnique({
      where: { userId },
    });
    if (!account) {
      return {
        totalReferrals: 0,
        completedReferrals: 0,
        pendingReferrals: 0,
        totalPointsEarned: 0,
      };
    }

    const [totalReferrals, completedReferrals, pendingReferrals, pointsSum] =
      await this.prisma.$transaction([
        this.prisma.referral.count({ where: { referrerId: account.id } }),
        this.prisma.referral.count({
          where: { referrerId: account.id, status: ReferralStatus.COMPLETED },
        }),
        this.prisma.referral.count({
          where: { referrerId: account.id, status: ReferralStatus.PENDING },
        }),
        this.prisma.referral.aggregate({
          where: { referrerId: account.id },
          _sum: { pointsEarned: true },
        }),
      ]);

    return {
      totalReferrals,
      completedReferrals,
      pendingReferrals,
      totalPointsEarned: pointsSum._sum.pointsEarned ?? 0,
    };
  }

  private async generateUniqueCode(): Promise<string> {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const buildCode = () =>
      Array.from({ length: 8 })
        .map(() => alphabet[Math.floor(Math.random() * alphabet.length)])
        .join('');

    let code = buildCode();
    let exists = await this.prisma.referral.findUnique({ where: { code } });

    while (exists) {
      code = buildCode();
      exists = await this.prisma.referral.findUnique({ where: { code } });
    }

    return code;
  }
}
