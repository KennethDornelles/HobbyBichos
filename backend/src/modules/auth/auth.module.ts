import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from '../../common/jwt.strategy';
import { RolesGuard } from '../../common/roles.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({ secret: 'your_jwt_secret', signOptions: { expiresIn: '1d' } }),
    UsersModule,
  ],
  providers: [AuthService, JwtStrategy, RolesGuard],
  controllers: [AuthController],
})
export class AuthModule {}
