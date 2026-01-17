import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './database/prisma.module';
import { StoresModule } from './modules/stores/stores.module';
import { PetsModule } from './modules/pets/pets.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { AuthModule } from './modules/auth/auth.module';
import { ServicesModule } from './modules/services/services.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { MailModule } from './modules/mail/mail.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { OrdersModule } from './modules/orders/orders.module'; // ← ADICIONE ESTA LINHA
import { CartModule } from './modules/cart/cart.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { ManagerModule } from './modules/manager/manager.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST') || 'redis',
          port: Number(configService.get('REDIS_PORT')) || 6379,
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('MAIL_HOST'),
          port: config.get('MAIL_PORT'),
          auth: {
            user: config.get('MAIL_USER'),
            pass: config.get('MAIL_PASS'),
          },
        },
        defaults: {
          from: 'Hobby Bichos <no-reply@hobbybichos.com>',
        },
        template: {
          dir: join(__dirname, 'modules', 'mail', 'templates'),
          adapter: new EjsAdapter(),
          options: {
            strict: false,
          },
        },
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    StoresModule,
    PetsModule,
    UsersModule,
    ProductsModule,
    AuthModule,
    ServicesModule,
    AppointmentsModule,
    AnalyticsModule,
    MailModule,
    ReviewsModule,
    OrdersModule, // ← ADICIONE ESTA LINHA
    CartModule,
    LoyaltyModule,
    ManagerModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
