import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { NotificationProcessor } from './notification.processor';
import { NotificationService } from './notification.service';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [
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
  providers: [NotificationProcessor, NotificationService],
  exports: [NotificationService],
})
export class NotificationsModule {}
