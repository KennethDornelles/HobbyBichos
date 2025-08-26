import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';

@Injectable()
export class ProductImageService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateProductImageDto) {
    return this.prisma.productImage.create({ 
      data: {
        url: data.url,
        alt: data.alt,
        isMain: data.isMain,
        position: data.position,
        productId: data.productId,
      }
    });
  }

  async findAll() {
    return this.prisma.productImage.findMany();
  }

  async findOne(id: number) {
    return this.prisma.productImage.findUnique({ where: { id } });
  }

  async update(id: number, data: UpdateProductImageDto) {
    return this.prisma.productImage.update({ 
      where: { id }, 
      data: {
        url: data.url,
        alt: data.alt,
        isMain: data.isMain,
        position: data.position,
      }
    });
  }

  async remove(id: number) {
    return this.prisma.productImage.delete({ where: { id } });
  }
}
