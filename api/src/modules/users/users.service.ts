import {
  Injectable,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '../../common/enums/role.enum';

import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

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
          birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
        },
      });
    } catch (err) {
      const error = err as { code?: string; meta?: { target?: string[] } };
      if (error.code === 'P2002') {
        // Prisma unique constraint failed
        const target = error.meta?.target?.join(', ');
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
      include: { loyaltyAccount: true },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { loyaltyAccount: true },
    });
  }

  async findByMemberCode(code: string) {
    this.logger.debug(`[MemberCode] 🎫 Buscando código: "${code}"`);
    const normalized = code.trim().toUpperCase();
    this.logger.debug(`[MemberCode] 🎫 Código normalizado: "${normalized}"`);

    // CITEXT no PostgreSQL é case-insensitive automaticamente
    // A busca funciona independente do case fornecido
    const mc = await this.prisma.memberCode.findUnique({
      where: { code: normalized },
      include: { user: { include: { loyaltyAccount: true } } },
    });

    if (!mc) {
      this.logger.debug(
        `[MemberCode] ❌ Código não encontrado: "${normalized}"`,
      );
      return null;
    }

    this.logger.debug(
      `[MemberCode] ✅ Código encontrado para usuário: ${mc.userId}`,
    );
    return mc?.user ?? null;
  }

  async ensureLoyaltyForUser(params: { email?: string; id?: string }) {
    const { email, id } = params;
    if (!email && !id) {
      throw new BadRequestException('Informe email ou id');
    }

    const user = email
      ? await this.findByEmail(email)
      : await this.findById(id as string);

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    if (user.loyaltyAccount) {
      return user.loyaltyAccount;
    }

    const account = await this.prisma.loyaltyAccount.create({
      data: { userId: user.id },
    });
    return account;
  }

  async assignMemberCode(params: {
    email?: string;
    id?: string;
    code: string;
  }) {
    const { email, id, code } = params;
    if (!code) {
      throw new BadRequestException('Informe o código');
    }

    // Normalizar o código logo no início do método para garantir consistência
    const normalizedCode = code.trim().toUpperCase();
    this.logger.debug(
      `[MemberCode] 🎫 Atribuindo código: original="${code}" → normalizado="${normalizedCode}"`,
    );

    const user = email
      ? await this.findByEmail(email)
      : await this.findById(id as string);
    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    // Garante loyalty account
    if (!user.loyaltyAccount) {
      await this.ensureLoyaltyForUser({ email, id });
    }

    // Verificar se código já existe e pertence a outro usuário (usando código normalizado)
    const existing = await this.prisma.memberCode.findUnique({
      where: { code: normalizedCode },
    });

    if (existing && existing.userId !== user.id) {
      this.logger.warn(
        `[MemberCode] ⚠️ Conflito: código "${normalizedCode}" já vinculado ao usuário ${existing.userId}`,
      );
      throw new BadRequestException('Código já está vinculado a outro usuário');
    }

    // Usar código normalizado em todas as operações (upsert)
    const mc = await this.prisma.memberCode.upsert({
      where: { code: normalizedCode },
      update: { userId: user.id },
      create: { code: normalizedCode, userId: user.id },
    });

    this.logger.debug(
      `[MemberCode] ✅ Código atribuído com sucesso ao usuário ${user.id}: "${normalizedCode}"`,
    );

    return mc;
  }

  async update(id: string, data: Partial<CreateUserDto>) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
