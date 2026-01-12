import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '../../common/enums/role.enum';

import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto, creatorRole?: Role) {
    // Se for criar EMPLOYEE ou MANAGER, precisa de storeId
    if (
      (dto.role === Role.EMPLOYEE || dto.role === Role.MANAGER) &&
      !dto.storeId
    ) {
      throw new BadRequestException('Funcionários precisam de storeId');
    }

    // Se for criar SUPER_ADMIN, só OWNER pode criar
    if (dto.role === Role.SUPER_ADMIN) {
      if (creatorRole !== Role.OWNER) {
        throw new BadRequestException('Apenas OWNER pode criar SUPER_ADMIN');
      }
      // Todo SUPER_ADMIN também é OWNER
      dto.role = Role.OWNER;
    }

    const hashedPassword: string = await bcrypt.hash(dto.password, 10);
    try {
      return await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hashedPassword,
          phone: dto.phone ?? '',
          role: dto.role,
          storeId: dto.storeId,
        },
      });
    } catch (err: any) {
      if (err.code === 'P2002') {
        // Prisma unique constraint failed
        const target = err.meta?.target?.join(', ');
        throw new ConflictException(
          `Já existe usuário com este ${target || 'dado único'}`,
        );
      }
      throw err;
    }
  }

  async findAllByStore(storeId: string) {
    return this.prisma.user.findMany({
      where: { storeId },
    });
  }

  async findEmployeesByStore(storeId: string) {
    return this.prisma.user.findMany({
      where: {
        storeId,
        role: { in: ['EMPLOYEE', 'MANAGER', 'OWNER'] },
      },
      select: {
        id: true,
        name: true,
        role: true,
        email: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { loyaltyAccount: true },
    });
  }

  async update(id: string, data: Partial<CreateUserDto>) {
    if (data.password) {
      data.password = (await bcrypt.hash(data.password, 10)) as string;
    }
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
