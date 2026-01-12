import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createServiceDto: CreateServiceDto, user: any) {
    let storeId = createServiceDto.storeId;
    if (user.role !== 'SUPER_ADMIN') {
      storeId = user.storeId;
    }
    if (!storeId) throw new ForbiddenException('storeId é obrigatório');
    return this.prisma.service.create({
      data: {
        name: createServiceDto.name,
        price: createServiceDto.price,
        durationMin: createServiceDto.durationMin,
        storeId,
      },
    });
  }

  async findAll(storeId?: string) {
    // Se não tem storeId (cliente sem loja), retorna todos os serviços ativos
    // Se tem storeId (funcionário/loja), retorna apenas os serviços dessa loja
    const where: any = { isActive: true };
    if (storeId) {
      where.storeId = storeId;
    }
    return this.prisma.service.findMany({
      where,
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findOne(id: string, storeId: string) {
    return this.prisma.service.findFirst({ where: { id, storeId } });
  }

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
    storeId: string,
  ) {
    return this.prisma.service.updateMany({
      where: { id, storeId },
      data: updateServiceDto,
    });
  }

  async remove(id: string, storeId: string) {
    return this.prisma.service.deleteMany({ where: { id, storeId } });
  }
}
