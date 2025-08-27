import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateAddressDto) {
    return this.prisma.address.create({ data });
  }

  async findAll() {
    return this.prisma.address.findMany();
  }

  async findOne(id: number) {
    return this.prisma.address.findUnique({ where: { id } });
  }

  async update(id: number, data: UpdateAddressDto) {
    return this.prisma.address.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.address.delete({ where: { id } });
  }
}
