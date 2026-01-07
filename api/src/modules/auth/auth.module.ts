import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt-strategies';
import { PrismaModule } from '../../database/prisma.module';
import { PasswordForgotService } from './password-forgot.service';
// import { BrevoService } from './brevo.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.get('JWT_SECRET', 'default_secret_key'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '7d'),
        },
      }),
    }),
    PrismaModule,
    MailModule,
  ],
  // ✅ Removido PasswordForgotController - tudo está no AuthController agora
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PasswordForgotService],
  exports: [AuthService],
})
export class AuthModule {}
