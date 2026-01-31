import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';

import { NotificationProcessor } from './notification.processor';
import { NotificationService } from './notification.service';
import { NotificationsController } from './notifications.controller';
import { PushProvider, EmailProvider } from './providers';
import { PrismaModule } from '../../database/prisma.module';

import { AppointmentReminderJob } from './jobs/appointment-reminder.job';
import { PetMissYouJob } from './jobs/pet-miss-you.job';
import { PointsExpirationJob } from './jobs/points-expiration.job';
import { RewardOpportunityJob } from './jobs/reward-opportunity.job';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    ScheduleModule.forRoot(), // Habilita Cron Jobs
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'notification_queue',
    }),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationService,
    NotificationProcessor,
    PushProvider,
    EmailProvider,
    AppointmentReminderJob,
    PetMissYouJob,
    PointsExpirationJob,
    RewardOpportunityJob,
  ],
  exports: [NotificationService, PushProvider, EmailProvider],
})
export class NotificationsModule {}
