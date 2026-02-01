import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { StockMonitorListener } from './listeners/stock-monitor.listener';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule, NotificationsModule, UsersModule],
  controllers: [ProductsController],
  providers: [ProductsService, StockMonitorListener],
  exports: [ProductsService],
})
export class ProductsModule {}
