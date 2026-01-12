import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { PrismaModule } from '../../database/prisma.module';
import { LoyaltyService } from './services/loyalty.service';
import { LoyaltyCalculatorService } from './services/loyalty-calculator.service';
import { LoyaltyTierService } from './services/loyalty-tier.service';
import { LoyaltyReferralService } from './services/loyalty-referral.service';

import { LoyaltyController } from './controllers/loyalty.controller';
import { LoyaltyAdminController } from './controllers/loyalty-admin.controller';

import { BirthdayPointsJob } from './jobs/birthday-points.job';
import { PointsExpirationJob } from './jobs/points-expiration.job';
import { TierRenewalJob } from './jobs/tier-renewal.job';

import { OrderCompletedListener } from './listeners/order-completed.listener';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
  ],
  controllers: [LoyaltyController, LoyaltyAdminController],
  providers: [
    LoyaltyService,
    LoyaltyCalculatorService,
    LoyaltyTierService,
    LoyaltyReferralService,
    BirthdayPointsJob,
    PointsExpirationJob,
    TierRenewalJob,
    OrderCompletedListener,
  ],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
