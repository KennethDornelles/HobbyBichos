import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AppointmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create<T extends Prisma.AppointmentInclude>(
    data: Prisma.AppointmentCreateInput,
    include?: T,
  ) {
    return this.prisma.appointment.create({
      data,
      include,
    }) as unknown as Prisma.AppointmentGetPayload<{ include: T }>;
  }

  async findUnique<T extends Prisma.AppointmentInclude>(
    where: Prisma.AppointmentWhereUniqueInput,
    include?: T,
  ) {
    return this.prisma.appointment.findUnique({
      where,
      include,
    }) as unknown as Prisma.AppointmentGetPayload<{ include: T }> | null;
  }

  async findFirst<T extends Prisma.AppointmentInclude>(
    where: Prisma.AppointmentWhereInput,
    include?: T,
  ) {
    return this.prisma.appointment.findFirst({
      where,
      include,
    }) as unknown as Prisma.AppointmentGetPayload<{ include: T }> | null;
  }

  async findMany<T extends Prisma.AppointmentInclude>(params: {
    where?: Prisma.AppointmentWhereInput;
    include?: T;
    orderBy?: Prisma.AppointmentOrderByWithRelationInput;
    take?: number;
  }) {
    return this.prisma.appointment.findMany(params) as unknown as Array<
      Prisma.AppointmentGetPayload<{ include: T }>
    >;
  }

  async update<T extends Prisma.AppointmentInclude>(params: {
    where: Prisma.AppointmentWhereUniqueInput;
    data: Prisma.AppointmentUpdateInput;
    include?: T;
  }) {
    return this.prisma.appointment.update(params) as unknown as Prisma.AppointmentGetPayload<{
      include: T;
    }>;
  }
}

