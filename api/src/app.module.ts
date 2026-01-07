import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
