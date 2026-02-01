import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateStockTransferDto } from './dto/create-stock-transfer.dto';

@Injectable()
export class StockTransferService {
  constructor(private readonly prisma: PrismaService) {}

  async transferStock(userId: string, data: CreateStockTransferDto) {
    const { productId, fromStoreId, toStoreId, quantity, reason } = data;

    if (fromStoreId === toStoreId) {
      throw new BadRequestException('Loja de origem e destino devem ser diferentes');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Verificar estoque na origem
      const sourceStock = await tx.productStock.findUnique({
        where: { productId_storeId: { productId, storeId: fromStoreId } },
      });

      if (!sourceStock || sourceStock.quantity < quantity) {
        throw new BadRequestException(
          `Estoque insuficiente na loja de origem. Disponível: ${sourceStock?.quantity || 0}`,
        );
      }

      // 2. Decrementar na origem
      await tx.productStock.update({
        where: { id: sourceStock.id },
        data: { quantity: { decrement: quantity } },
      });

      // 3. Incrementar no destino (ou criar se não existir)
      await tx.productStock.upsert({
        where: { productId_storeId: { productId, storeId: toStoreId } },
        update: { quantity: { increment: quantity } },
        create: {
          productId,
          storeId: toStoreId,
          quantity: quantity,
        },
      });

      // 4. Criar log de auditoria
      return tx.stockTransfer.create({
        data: {
          productId,
          fromStoreId,
          toStoreId,
          quantity,
          reason,
          requestedById: userId,
          status: 'COMPLETED',
        },
        include: {
          product: true,
          fromStore: true,
          toStore: true,
          requestedBy: {
            select: { name: true, email: true },
          },
        },
      });
    });
  }

  async findAll(storeId?: string) {
    return this.prisma.stockTransfer.findMany({
      where: storeId
        ? { OR: [{ fromStoreId: storeId }, { toStoreId: storeId }] }
        : {},
      include: {
        product: true,
        fromStore: true,
        toStore: true,
        requestedBy: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const transfer = await this.prisma.stockTransfer.findUnique({
      where: { id },
      include: {
        product: true,
        fromStore: true,
        toStore: true,
        requestedBy: {
          select: { name: true, email: true },
        },
      },
    });

    if (!transfer) throw new NotFoundException('Transferência não encontrada');
    return transfer;
  }
}
