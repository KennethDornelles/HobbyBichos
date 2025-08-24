import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';

@Injectable()
export class ProductImageService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateProductImageDto) {
    return this.prisma.productImage.create({ data });
  }

  async findAll() {
    return this.prisma.productImage.findMany();
  }

  async findOne(id: string) {
    return this.prisma.productImage.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateProductImageDto) {
    return this.prisma.productImage.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.productImage.delete({ where: { id } });
  }
}
