import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';

@Injectable()
export class OrderItemService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateOrderItemDto) {
    return this.prisma.orderItem.create({ data });
  }

  async findAll() {
    return this.prisma.orderItem.findMany();
  }

  async findOne(id: string) {
    return this.prisma.orderItem.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateOrderItemDto) {
    return this.prisma.orderItem.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.orderItem.delete({ where: { id } });
  }
}
