import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../database/prisma.service';
import { LoyaltyTierService } from '../services/loyalty-tier.service';

@Injectable()
export class TierRenewalJob {
  private readonly logger = new Logger(TierRenewalJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tierService: LoyaltyTierService,
  ) {}

  @Cron('0 2 * * 1')
  async handleTierRenewal(): Promise<void> {
    try {
      const now = new Date();
      const accountsToRenew = await this.prisma.loyaltyAccount.findMany({
        where: {
          tierExpiresAt: { lt: now },
        },
      });

      let renewedCount = 0;

      for (const account of accountsToRenew) {
        try {
          await this.tierService.scheduleTierRenewal(account.id);
          renewedCount++;
        } catch (error) {
          this.logger.error(
            `Failed to renew tier for account ${account.id}`,
            error,
          );
        }
      }

      this.logger.log(`Tier renewal processed for ${renewedCount} accounts`);
    } catch (error) {
      this.logger.error('Tier renewal job failed', error);
    }
  }
}
