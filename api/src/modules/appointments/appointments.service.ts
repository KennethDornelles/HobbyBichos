import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { FilterAppointmentsDto } from './dto/filter-appointments.dto';

// Prisma não gera enum para status, pois é string no schema. Defina manualmente:
export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

import { ServicesService } from '../services/services.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly servicesService: ServicesService,
    private readonly mailService: MailService,
  ) {}

  async create(
    createDto: CreateAppointmentDto,
    user: { storeId?: string; userId?: string; id?: string },
  ) {
    // CORREÇÃO: user pode ter 'id' ou 'userId' dependendo do contexto
    const userId = user.userId || user.id;

    if (!userId) {
      throw new ConflictException('Usuário não identificado');
    }

    // Busca o serviço diretamente para obter seu storeId
    const service = await this.prisma.service.findUnique({
      where: { id: createDto.serviceId },
    });
    if (!service) throw new ConflictException('Serviço não encontrado');

    const storeId = service.storeId;
    const startsAt = new Date(createDto.startsAt);
    const endsAt = new Date(startsAt.getTime() + service.durationMin * 60000);

    // 1. Verifica se é data de exclusão
    const exclusion = await this.prisma.storeExclusion.findFirst({
      where: {
        storeId: storeId,
        date: {
          gte: new Date(startsAt.toDateString()),
          lt: new Date(
            new Date(startsAt.toDateString()).getTime() + 24 * 60 * 60 * 1000,
          ),
        },
      },
    });
    if (exclusion) {
      throw new ConflictException('A loja estará fechada nesta data.');
    }

    // 2. Verifica horário de funcionamento
    const weekday = startsAt.getDay();
    const businessHour = await this.prisma.storeBusinessHour.findFirst({
      where: {
        storeId: storeId,
        weekday,
      },
    });
    if (!businessHour) {
      throw new ConflictException('A loja não possui expediente neste dia.');
    }
    // Checa se horário está dentro do expediente
    const [openH, openM] = businessHour.openTime.split(':').map(Number);
    const [closeH, closeM] = businessHour.closeTime.split(':').map(Number);
    const openDate = new Date(startsAt);
    openDate.setHours(openH, openM, 0, 0);
    const closeDate = new Date(startsAt);
    closeDate.setHours(closeH, closeM, 0, 0);
    if (startsAt < openDate || endsAt > closeDate) {
      throw new ConflictException('Horário fora do expediente da loja.');
    }

    // 3. Checa conflito de agendamento
    const conflict = await this.prisma.appointment.findFirst({
      where: {
        OR: [
          { professionalId: createDto.employeeId },
          { petId: createDto.petId },
        ],
        startsAt: { gte: startsAt, lt: endsAt },
        status: {
          in: [AppointmentStatus.SCHEDULED, AppointmentStatus.COMPLETED],
        },
      },
    });
    if (conflict) {
      throw new ConflictException('Horário já agendado');
    }

    // CORREÇÃO: usar userId extraído corretamente
    const appointment = await this.prisma.appointment.create({
      data: {
        petId: createDto.petId,
        professionalId: createDto.employeeId,
        serviceId: createDto.serviceId,
        startsAt,
        storeId: storeId, // Usar storeId do serviço
        userId: userId, // CORRIGIDO: usar a variável extraída
        status: AppointmentStatus.SCHEDULED,
      },
      include: {
        user: true,
        store: true,
      },
    });

    // Envia e-mail de confirmação para o cliente (não-bloqueante)
    if (appointment.user?.email && appointment.store?.name) {
      try {
        await this.mailService.sendAppointmentConfirmation(
          appointment.user.email,
          appointment.store.name,
          {
            clientName: appointment.user.name,
            date: appointment.startsAt.toLocaleString('pt-BR'),
          },
        );
      } catch (emailError) {
        console.error('Erro ao enviar email de confirmação:', emailError);
        // Não lança exceção - o agendamento já foi criado com sucesso
      }
    }

    return appointment;
  }

  async findAllByStore(
    filter: FilterAppointmentsDto,
    user: { storeId: string; userId?: string; id?: string; role?: string },
  ) {
    const userId = user.userId || user.id;

    // Se o usuário for CLIENT, busca os appointments dele
    // Se for STORE/ADMIN, busca os appointments da loja
    const where: {
      userId?: string;
      storeId?: string;
      startsAt?: { gte: Date; lt: Date };
    } = {};

    if (user.role === 'CLIENT') {
      // Cliente vê apenas seus próprios agendamentos
      where.userId = userId;
    } else if (user.storeId) {
      // Store/Admin vê os agendamentos da loja
      const storeId = filter.storeId || user.storeId;
      where.storeId = storeId;
    } else {
      // Se não tem role CLIENT nem storeId, retorna vazio
      return [];
    }

    if (filter.date) {
      const date = new Date(filter.date);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      where.startsAt = { gte: date, lt: nextDay };
    }

    return this.prisma.appointment.findMany({
      where,
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
        pet: {
          select: {
            id: true,
            name: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        professional: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        startsAt: 'desc',
      },
    });
  }

  async findOne(
    id: string,
    user: { storeId?: string; userId?: string; id?: string; role?: string },
  ) {
    const userId = user.userId || user.id;

    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
        pet: {
          select: {
            id: true,
            name: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        professional: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    // Verifica permissões: CLIENT vê apenas seus próprios, STORE/ADMIN vê os da loja
    if (user.role === 'CLIENT' && appointment.userId !== userId) {
      throw new NotFoundException('Agendamento não encontrado');
    } else if (user.storeId && appointment.storeId !== user.storeId) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    return appointment;
  }
}
