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

  /**
   * Obtém o dashboard de agendamentos para um employee
   * Retorna agendamentos de hoje e próximos agendamentos
   */
  async getEmployeeDashboard(user: {
    storeId?: string;
    userId?: string;
    id?: string;
    name?: string;
    role?: string;
  }) {
    const userId = user.userId || user.id;

    if (!userId || user.role !== 'EMPLOYEE') {
      throw new ConflictException('Apenas employees podem acessar o dashboard');
    }

    if (!user.storeId) {
      throw new ConflictException('Employee não possui loja associada');
    }

    // Data de hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Próximos 7 dias
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    // Agendamentos de hoje
    const todayAppointments = await this.prisma.appointment.findMany({
      where: {
        storeId: user.storeId,
        startsAt: { gte: today, lt: tomorrow },
        status: {
          in: [AppointmentStatus.SCHEDULED, AppointmentStatus.COMPLETED],
        },
      },
      include: {
        pet: true,
        service: true,
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { startsAt: 'asc' },
    });

    // Próximos agendamentos (excluindo hoje)
    const upcomingAppointments = await this.prisma.appointment.findMany({
      where: {
        storeId: user.storeId,
        startsAt: { gte: tomorrow, lte: nextWeek },
        status: {
          in: [AppointmentStatus.SCHEDULED, AppointmentStatus.COMPLETED],
        },
      },
      include: {
        pet: true,
        service: true,
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { startsAt: 'asc' },
      take: 10,
    });

    const transformAppointment = (apt) => ({
      id: apt.id,
      startsAt: apt.startsAt,
      status: apt.status,
      petName: apt.pet?.name || 'Pet',
      petSpecies: apt.pet?.species || 'N/A',
      clientName: apt.user?.name || 'Cliente',
      serviceName: apt.service?.name || 'Serviço',
      servicePrice: apt.service?.price ? Number(apt.service.price) : 0,
      serviceDuration: apt.service?.durationMin || 30,
      notes: apt.notes,
    });

    const completedToday = todayAppointments.filter(
      (apt) => apt.status === AppointmentStatus.COMPLETED,
    ).length;
    const cancelledToday = todayAppointments.filter(
      (apt) => apt.status === AppointmentStatus.CANCELLED,
    ).length;

    return {
      employeeId: userId,
      employeeName: user.name || 'Employee',
      todayAppointments: todayAppointments.map(transformAppointment),
      upcomingAppointments: upcomingAppointments.map(transformAppointment),
      totalAppointmentsToday: todayAppointments.length,
      completedAppointmentsToday: completedToday,
      cancelledAppointmentsToday: cancelledToday,
    };
  }

  /**
   * Atualiza o status de um agendamento
   * Apenas o employee pode atualizar agendamentos
   */
  async updateAppointmentStatus(
    appointmentId: string,
    updateStatusDto: { status: string; notes?: string },
    user: { storeId?: string; userId?: string; id?: string; role?: string },
  ) {
    const userId = user.userId || user.id;

    // Verifica se o usuário é EMPLOYEE
    if (user.role !== 'EMPLOYEE') {
      throw new ConflictException(
        'Apenas employees podem atualizar agendamentos',
      );
    }

    // Busca o agendamento
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        pet: true,
        service: true,
        user: {
          select: { id: true, name: true, email: true },
        },
        store: {
          select: { id: true, name: true },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    // Verifica se o agendamento pertence à loja do employee
    if (appointment.storeId !== user.storeId) {
      throw new ConflictException(
        'Sem permissão para atualizar este agendamento',
      );
    }

    // Atualiza o agendamento
    const updatedAppointment = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: updateStatusDto.status,
        notes: updateStatusDto.notes || appointment.notes,
        updatedAt: new Date(),
      },
      include: {
        pet: true,
        service: true,
        user: {
          select: { id: true, name: true, email: true },
        },
        store: {
          select: { id: true, name: true },
        },
      },
    });

    // Envia notificação por email ao cliente
    if (
      appointment.user?.email &&
      updateStatusDto.status === AppointmentStatus.COMPLETED
    ) {
      try {
        await this.mailService.sendAppointmentCompleted(
          appointment.user.email,
          {
            clientName: appointment.user.name,
            petName: appointment.pet?.name,
            serviceName: appointment.service?.name,
            storeName: appointment.store?.name,
          },
        );
      } catch (error) {
        console.error('Erro ao enviar email de conclusão:', error);
      }
    }

    return {
      id: updatedAppointment.id,
      startsAt: updatedAppointment.startsAt,
      status: updatedAppointment.status,
      petName: updatedAppointment.pet?.name,
      clientName: updatedAppointment.user?.name,
      serviceName: updatedAppointment.service?.name,
      notes: updatedAppointment.notes,
    };
  }
}
