import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PrismaModule } from '../../database/prisma.module';
import { CommissionsModule } from '../commissions/commissions.module';

@Module({
  imports: [PrismaModule, CommissionsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
