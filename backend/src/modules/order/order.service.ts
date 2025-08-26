import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateOrderDto & { userId: number }) {
    return this.prisma.order.create({ 
      data: {
        orderNumber: data.orderNumber,
        status: data.status,
        subtotal: data.subtotal,
        shippingCost: data.shippingCost,
        total: data.total,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        userId: data.userId,
        addressId: data.addressId,
      }
    });
  }

  async findAll() {
    return this.prisma.order.findMany();
  }

  async findOne(id: number) {
    return this.prisma.order.findUnique({ where: { id } });
  }

  async update(id: number, data: UpdateOrderDto) {
    return this.prisma.order.update({ 
      where: { id }, 
      data: {
        orderNumber: data.orderNumber,
        status: data.status,
        subtotal: data.subtotal,
        shippingCost: data.shippingCost,
        total: data.total,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        addressId: data.addressId,
      }
    });
  }

  async remove(id: number) {
    return this.prisma.order.delete({ where: { id } });
  }
}
