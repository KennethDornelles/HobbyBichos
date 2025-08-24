import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { JwtStrategy } from '../../common/jwt.strategy';

@Module({
  controllers: [OrderController],
  providers: [OrderService, JwtStrategy],
})
export class OrderModule {}
