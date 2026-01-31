import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateProductDto) {
    return this.prisma.product.create({ data });
  }

  async findAll() {
    return this.prisma.product.findMany({
      include: { stocks: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { stocks: true },
    });
  }

  async update(id: string, data: UpdateProductDto) {
    return this.prisma.product.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }

  async updateProductStock(
    productId: string,
    storeId: string,
    quantity: number,
  ) {
    return this.prisma.productStock.upsert({
      where: { productId_storeId: { productId, storeId } },
      update: { quantity },
      create: { productId, storeId, quantity },
    });
  }

  async findAllByStore(_storeId: string) {
    // Retorna todos os produtos com estoque de todas as lojas
    // (Regra de Estoque Compartilhado: Loja 1 vê estoque da Loja 2, etc.)
    return this.prisma.product.findMany({
      include: { stocks: true },
    });
  }
}
