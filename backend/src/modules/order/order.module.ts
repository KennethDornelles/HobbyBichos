import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { JwtStrategy } from '../../common/jwt.strategy';
import { PrismaService } from '../../database/prisma/prisma.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService, JwtStrategy, PrismaService],
})
export class OrderModule {}
