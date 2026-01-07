import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRevenueSummary(storeId: string, startDate: Date, endDate: Date) {
    const result = await this.prisma.order.aggregate({
      where: {
        storeId,
        status: 'PAID',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: { total: true },
    });
    return { revenue: result._sum.total || 0 };
  }

  async getAppointmentStats(storeId: string) {
    const stats = await this.prisma.appointment.groupBy({
      by: ['status'],
      where: { storeId },
      _count: { status: true },
    });
    return stats.map((s) => ({ status: s.status, count: s._count.status }));
  }

  async getTopServices(storeId: string) {
    const top = await this.prisma.appointment.groupBy({
      by: ['serviceId'],
      where: { storeId, status: 'COMPLETED' },
      _count: { serviceId: true },
      orderBy: { _count: { serviceId: 'desc' } },
      take: 5,
    });
    return top;
  }

  async getEmployeePerformance(storeId: string) {
    const perf = await this.prisma.appointment.groupBy({
      by: ['professionalId'],
      where: { storeId, status: 'COMPLETED', professionalId: { not: null } },
      _count: { professionalId: true },
      orderBy: { _count: { professionalId: 'desc' } },
    });
    return perf;
  }
}
