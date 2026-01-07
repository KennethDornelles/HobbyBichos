import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createReviewDto: CreateReviewDto, userId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: createReviewDto.appointmentId },
      include: { pet: true },
    });

    if (!appointment) throw new NotFoundException('Agendamento não encontrado');
    if (appointment.status !== 'COMPLETED')
      throw new ForbiddenException(
        'Só é possível avaliar agendamentos concluídos',
      );
    if (appointment.pet.ownerId !== userId)
      throw new ForbiddenException('Você não pode avaliar este agendamento');

    // Herdar storeId e employeeId do agendamento
    const { storeId, professionalId } = appointment;
    if (!professionalId) {
      throw new ForbiddenException(
        'Agendamento não possui profissional vinculado.',
      );
    }
    return this.prisma.review.create({
      data: {
        stars: createReviewDto.stars,
        comment: createReviewDto.comment,
        userId,
        storeId,
        employeeId: professionalId,
        appointmentId: createReviewDto.appointmentId,
      },
    });
  }

  async averageForStore(storeId: string) {
    const result = await this.prisma.review.aggregate({
      where: { storeId },
      _avg: { stars: true },
    });
    return result._avg.stars ?? 0;
  }

  async averageForEmployee(employeeId: string) {
    const result = await this.prisma.review.aggregate({
      where: { employeeId },
      _avg: { stars: true },
    });
    return result._avg.stars ?? 0;
  }
}
