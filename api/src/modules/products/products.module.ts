import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { StockTransferController } from './stock-transfer.controller';
import { StockMonitorListener } from './listeners/stock-monitor.listener';
import { StockTransferService } from './stock-transfer.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule, NotificationsModule, UsersModule],
  controllers: [ProductsController, StockTransferController],
  providers: [ProductsService, StockTransferService, StockMonitorListener],
  exports: [ProductsService, StockTransferService],
})
export class ProductsModule {}
