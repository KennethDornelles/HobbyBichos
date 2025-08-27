import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
// import { AddressModule } from './modules/address/address.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { ProductImageModule } from './modules/product-image/product-image.module';
import { OrderModule } from './modules/order/order.module';
import { OrderItemModule } from './modules/order-item/order-item.module';
import { ReviewModule } from './modules/review/review.module';
import { PaymentModule } from './modules/payment/payment.module';
import { PrismaService } from './database/prisma/prisma.service';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    // AddressModule,
    CategoryModule,
    ProductModule,
    ProductImageModule,
    OrderModule,
    OrderItemModule,
    ReviewModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
