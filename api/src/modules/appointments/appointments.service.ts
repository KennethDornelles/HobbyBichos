import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service'; // Mantido para StoreExclusion/BusinessHour
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { FilterAppointmentsDto } from './dto/filter-appointments.dto';
import { AppointmentsRepository } from './appointments.repository';

// Prisma não gera enum para status, pois é string no schema. Defina manualmente:
export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}


import { MailService } from '../mail/mail.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService, // Ainda usado para infraestrutura (Loja/Horários)
    private readonly appointmentsRepository: AppointmentsRepository,
    private readonly mailService: MailService,
  ) {}

  async create(
    createDto: CreateAppointmentDto,
    user: { storeId?: string; userId?: string; id?: string },
  ) {
    const userId = user.userId || user.id;
    if (!userId) {
      throw new ConflictException('Usuário não identificado');
    }

    // Busca o serviço
    const service = await this.prisma.service.findUnique({
      where: { id: createDto.serviceId },
    });
    if (!service) throw new ConflictException('Serviço não encontrado');

    const storeId = service.storeId;
    const startsAt = new Date(createDto.startsAt);
    const endsAt = this.calculateEndTime(startsAt, service.durationMin);

    // Validações
    await this.validateStoreExclusion(storeId, startsAt);
    await this.validateBusinessHours(storeId, startsAt, endsAt);
    await this.validateSchedulingConflict(
      createDto.employeeId,
      createDto.petId,
      startsAt,
      endsAt,
    );

    // Criação via Repositório
    const appointment = await this.appointmentsRepository.create(
      {
        pet: { connect: { id: createDto.petId } },
        professional: { connect: { id: createDto.employeeId } },
        service: { connect: { id: createDto.serviceId } },
        startsAt,
        store: { connect: { id: storeId } },
        user: { connect: { id: userId } },
        status: AppointmentStatus.SCHEDULED,
        notes: '',
      },
      {
        user: true,
        store: true,
      },
    );

    // Envia e-mail (não-bloqueante)
    if (appointment.user?.email && appointment.store?.name) {
      this.notifyAppointmentConfirmation(appointment);
    }

    return appointment;
  }

  // --- Métodos Privados de Lógica de Negócio ---

  private calculateEndTime(startsAt: Date, durationMin: number): Date {
    return new Date(startsAt.getTime() + durationMin * 60000);
  }

  private async validateStoreExclusion(storeId: string, date: Date) {
    const exclusion = await this.prisma.storeExclusion.findFirst({
      where: {
        storeId: storeId,
        date: {
          gte: new Date(date.toDateString()),
          lt: new Date(
            new Date(date.toDateString()).getTime() + 24 * 60 * 60 * 1000,
          ),
        },
      },
    });
    if (exclusion) {
      throw new ConflictException('A loja estará fechada nesta data.');
    }
  }

  private async validateBusinessHours(
    storeId: string,
    startsAt: Date,
    endsAt: Date,
  ) {
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

    const [openH, openM] = businessHour.openTime.split(':').map(Number);
    const [closeH, closeM] = businessHour.closeTime.split(':').map(Number);
    const openDate = new Date(startsAt);
    openDate.setHours(openH, openM, 0, 0);
    const closeDate = new Date(startsAt);
    closeDate.setHours(closeH, closeM, 0, 0);

    if (startsAt < openDate || endsAt > closeDate) {
      throw new ConflictException('Horário fora do expediente da loja.');
    }
  }

  private async validateSchedulingConflict(
    employeeId: string,
    petId: string,
    start: Date,
    end: Date,
  ) {
    const conflict = await this.appointmentsRepository.findFirst({
      OR: [{ professionalId: employeeId }, { petId: petId }],
      startsAt: { gte: start, lt: end },
      status: {
        in: [AppointmentStatus.SCHEDULED, AppointmentStatus.COMPLETED],
      },
    });
    if (conflict) {
      throw new ConflictException('Horário já agendado');
    }
  }

  private async notifyAppointmentConfirmation(appointment: any) {
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
    }
  }

  // --- Fim Métodos Privados ---

  async findAllByStore(
    filter: FilterAppointmentsDto,
    user: { storeId: string; userId?: string; id?: string; role?: string },
  ) {
    const userId = user.userId || user.id;

    const where: any = {};

    if (user.role === 'CLIENT') {
      where.userId = userId;
    } else if (user.storeId) {
      const storeId = filter.storeId || user.storeId;
      where.storeId = storeId;
    } else {
      return [];
    }

    if (filter.date) {
      const date = new Date(filter.date);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      where.startsAt = { gte: date, lt: nextDay };
    }

    return this.appointmentsRepository.findMany({
      where,
      include: {
        store: { select: { id: true, name: true } },
        pet: { select: { id: true, name: true } },
        service: { select: { id: true, name: true, price: true } },
        professional: { select: { id: true, name: true } },
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

    const appointment = await this.appointmentsRepository.findUnique(
      { id },
      {
        store: { select: { id: true, name: true } },
        pet: { select: { id: true, name: true } },
        service: { select: { id: true, name: true, price: true } },
        professional: { select: { id: true, name: true } },
      },
    );

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    if (user.role === 'CLIENT' && appointment.userId !== userId) {
      throw new NotFoundException('Agendamento não encontrado');
    } else if (user.storeId && appointment.storeId !== user.storeId) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    return appointment;
  }

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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    // Agendamentos de hoje via Repository
    const todayAppointments = await this.appointmentsRepository.findMany({
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
        user: { select: { id: true, name: true } },
      },
      orderBy: { startsAt: 'asc' },
    });

    // Próximos agendamentos via Repository
    const upcomingAppointments = await this.appointmentsRepository.findMany({
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
        user: { select: { id: true, name: true } },
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

  async updateAppointmentStatus(
    appointmentId: string,
    updateStatusDto: { status: string; notes?: string },
    user: { storeId?: string; userId?: string; id?: string; role?: string },
  ) {
    if (user.role !== 'EMPLOYEE') {
      throw new ConflictException(
        'Apenas employees podem atualizar agendamentos',
      );
    }

    const appointment = await this.appointmentsRepository.findUnique(
      { id: appointmentId },
      {
        pet: true,
        service: true,
        user: { select: { id: true, name: true, email: true } },
        store: { select: { id: true, name: true } },
      },
    );

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    if (appointment.storeId !== user.storeId) {
      throw new ConflictException(
        'Sem permissão para atualizar este agendamento',
      );
    }

    const updatedAppointment = await this.appointmentsRepository.update({
      where: { id: appointmentId },
      data: {
        status: updateStatusDto.status,
        notes: updateStatusDto.notes || appointment.notes,
        updatedAt: new Date(),
      },
      include: {
        pet: true,
        service: true,
        user: { select: { id: true, name: true, email: true } },
        store: { select: { id: true, name: true } },
      },
    });

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
