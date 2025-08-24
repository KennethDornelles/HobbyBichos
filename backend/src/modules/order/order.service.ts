import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateOrderDto) {
    return this.prisma.order.create({ data });
  }

  async findAll() {
    return this.prisma.order.findMany();
  }

  async findOne(id: string) {
    return this.prisma.order.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateOrderDto) {
    return this.prisma.order.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.order.delete({ where: { id } });
  }
}
