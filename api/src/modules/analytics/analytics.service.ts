import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRevenueSummary(storeId: string | undefined, startDate: Date, endDate: Date) {
    const result = await this.prisma.order.aggregate({
      where: {
        ...(storeId ? { storeId } : {}),
        status: 'PAID',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: { total: true },
    });
    return { revenue: Number(result._sum.total || 0) };
  }

  async getSalesAnalytics(storeId: string | undefined, startDate: Date, endDate: Date) {
    // Período atual
    const currentOrders = await this.prisma.order.findMany({
      where: {
        ...(storeId ? { storeId } : {}),
        status: 'PAID',
        createdAt: { gte: startDate, lte: endDate },
      },
      select: { total: true, createdAt: true },
    });

    const currentTotal = currentOrders.reduce((sum, o) => sum + Number(o.total), 0);

    // Período anterior para comparação
    const duration = endDate.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - duration);
    const prevEndDate = new Date(endDate.getTime() - duration);

    const prevOrders = await this.prisma.order.aggregate({
      where: {
        ...(storeId ? { storeId } : {}),
        status: 'PAID',
        createdAt: { gte: prevStartDate, lte: prevEndDate },
      },
      _sum: { total: true },
    });

    const prevTotal = Number(prevOrders._sum.total || 0);
    const growth = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0;

    // Agrupamento por dia (Série temporal rápida)
    const dailySales: Record<string, number> = {};
    currentOrders.forEach((o) => {
      const date = o.createdAt.toISOString().split('T')[0];
      dailySales[date] = (dailySales[date] || 0) + Number(o.total);
    });

    return {
      total: currentTotal,
      previousTotal: prevTotal,
      growthPercent: Number(growth.toFixed(2)),
      dailySales: Object.entries(dailySales).map(([date, value]) => ({ date, value })),
    };
  }

  async getProductPerformance(storeId: string | undefined, startDate: Date, endDate: Date) {
    const items = await this.prisma.orderItem.findMany({
      where: {
        order: {
          ...(storeId ? { storeId } : {}),
          status: 'PAID',
          createdAt: { gte: startDate, lte: endDate },
        },
        productId: { not: null },
      },
      include: { product: { select: { name: true, category: true } } },
    });

    const performance: Record<string, { name: string; category: string; quantity: number; revenue: number }> = {};

    items.forEach((item) => {
      const pId = item.productId!;
      if (!performance[pId]) {
        performance[pId] = {
          name: item.product?.name || 'Inativo',
          category: item.product?.category || 'Desconhecido',
          quantity: 0,
          revenue: 0,
        };
      }
      performance[pId].quantity += item.quantity;
      performance[pId].revenue += Number(item.price) * item.quantity;
    });

    return Object.values(performance).sort((a, b) => b.revenue - a.revenue);
  }

  async getAppointmentInDepth(storeId: string | undefined, startDate: Date, endDate: Date) {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        ...(storeId ? { storeId } : {}),
        startsAt: { gte: startDate, lte: endDate },
      },
    });

    const total = appointments.length;
    const completed = appointments.filter((a) => a.status === 'COMPLETED').length;
    const cancelled = appointments.filter((a) => a.status === 'CANCELLED').length;
    
    // Horários de pico
    const hours: Record<number, number> = {};
    appointments.forEach((a) => {
      const hour = a.startsAt.getHours();
      hours[hour] = (hours[hour] || 0) + 1;
    });

    const peakHours = Object.entries(hours)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count);

    return {
      total,
      completed,
      cancelled,
      cancellationRate: total > 0 ? Number(((cancelled / total) * 100).toFixed(2)) : 0,
      peakHours,
    };
  }

  async getCustomerMetrics(storeId: string | undefined, startDate: Date, endDate: Date) {
    const orders = await this.prisma.order.findMany({
      where: {
        ...(storeId ? { storeId } : {}),
        status: 'PAID',
        createdAt: { gte: startDate, lte: endDate },
      },
      select: { userId: true, total: true },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const uniqueCustomers = new Set(orders.map((o) => o.userId));
    const totalCustomers = uniqueCustomers.size;

    // Cálculo simplificado de retenção: clientes com > 1 pedido no período
    const customerOrderCounts: Record<string, number> = {};
    orders.forEach(o => {
      customerOrderCounts[o.userId] = (customerOrderCounts[o.userId] || 0) + 1;
    });
    const recurrentCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;
    const retentionRate = totalCustomers > 0 ? (recurrentCustomers / totalCustomers) * 100 : 0;

    // Ticket Médio
    const averageTicket = orders.length > 0 ? totalRevenue / orders.length : 0;

    return {
      totalCustomers,
      recurrentCustomers,
      retentionRate,
      totalOrders: orders.length,
      revenue: totalRevenue,
      averageTicket: Number(averageTicket.toFixed(2)),
    };
  }

  async getAppointmentStats(storeId: string | undefined) {
    const stats = await this.prisma.appointment.groupBy({
      by: ['status'],
      where: { ...(storeId ? { storeId } : {}) },
      _count: { status: true },
    });
    return stats.map((s) => ({ status: s.status, count: s._count.status }));
  }

  async getTopServices(storeId: string | undefined) {
    const top = await this.prisma.appointment.groupBy({
      by: ['serviceId'],
      where: { ...(storeId ? { storeId } : {}), status: 'COMPLETED' },
      _count: { serviceId: true },
      orderBy: { _count: { serviceId: 'desc' } },
      take: 5,
    });
    return top;
  }

  async getEmployeePerformance(storeId: string | undefined) {
    const perf = await this.prisma.appointment.groupBy({
      by: ['professionalId'],
      where: { ...(storeId ? { storeId } : {}), status: 'COMPLETED', professionalId: { not: null } },
      _count: { professionalId: true },
      orderBy: { _count: { professionalId: 'desc' } },
    });
    return perf;
  }
}

