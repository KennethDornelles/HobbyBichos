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

  async create(dto: CreateUserDto) {
    if (
      (dto.role === Role.EMPLOYEE || dto.role === Role.MANAGER) &&
      !dto.storeId
    ) {
      throw new BadRequestException('Funcionários precisam de storeId');
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

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
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
