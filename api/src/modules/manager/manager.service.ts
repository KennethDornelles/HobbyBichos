/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { WorkScheduleDto } from './dto/work-schedule.dto';

@Injectable()
export class ManagerService {
  constructor(private prisma: PrismaService) {}

  /**
   * Resolve o storeId efetivo. Se for SUPER_ADMIN e não tiver storeId,
   * tenta pegar do query ou o primeiro da loja do banco.
   */
  async getEffectiveStoreId(
    user: { id: string; storeId: string | null; role: string },
    queryStoreId?: string,
  ): Promise<string | undefined> {
    const isNetworkAdmin = user.role === 'SUPER_ADMIN' || user.role === 'OWNER';

    // 1. Prioridade para o storeId passado na query (para administradores da rede)
    if (isNetworkAdmin && queryStoreId) {
      if (queryStoreId === 'all') return undefined;
      return queryStoreId;
    }

    // 2. Se o user já tem storeId fixo (MANAGER/EMPLOYEE), usa ele
    if (user.storeId) {
      return user.storeId;
    }

    // 3. Se for admin da rede sem storeId na query, retorna undefined (Vista Global)
    if (isNetworkAdmin) {
      return undefined;
    }

    throw new ForbiddenException(
      'Usuário não está associado a nenhuma loja e não possui privilégios administrativos.',
    );
  }

  // ==================== DASHBOARD ====================

  // ==================== HELPERS ====================

  private buildStoreFilter(
    storeId?: string,
    city?: string,
    state?: string,
  ): any {
    if (storeId) {
      return { storeId };
    }

    if (city || state) {
      return {
        store: {
          ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
          ...(state ? { state: { contains: state, mode: 'insensitive' } } : {}),
        },
      };
    }

    return {};
  }

  // ==================== DASHBOARD ====================

  async getDashboard(storeId?: string, city?: string, state?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const filter = this.buildStoreFilter(storeId, city, state);

    // Agendamentos de hoje
    const todayAppointments = await this.prisma.appointment.count({
      where: {
        ...filter,
        startsAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const completedToday = await this.prisma.appointment.count({
      where: {
        ...filter,
        startsAt: {
          gte: today,
          lt: tomorrow,
        },
        status: 'COMPLETED',
      },
    });

    // Pedidos do mês
    const monthOrders = await this.prisma.order.count({
      where: {
        ...filter,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        status: { not: 'CANCELLED' },
      },
    });

    // Receita do mês
    const monthRevenue = await this.prisma.order.aggregate({
      where: {
        ...filter,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        status: 'PAID',
      },
      _sum: {
        total: true,
      },
    });

    // Serviços ativos
    const activeServices = await this.prisma.service.count({
      where: {
        ...filter,
        isActive: true,
      },
    });

    // Funcionários
    const employees = await this.prisma.user.count({
      where: {
        ...filter,
        role: { in: ['EMPLOYEE', 'MANAGER'] },
      },
    });

    // Pedidos abertos (PENDING)
    const openOrders = await this.prisma.order.count({
      where: {
        ...filter,
        status: 'PENDING',
      },
    });

    // Estudo de Estoque Crítico (quantity <= minStock)
    const lowStockItems = await this.prisma.productStock.findMany({
      where: {
        ...filter,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        store: {
          select: {
            name: true,
          },
        },
      },
    });

    const criticalStock = lowStockItems.filter(
      (item: any) => item.quantity <= item.minStock,
    );
    const outOfStock = criticalStock.filter((item: any) => item.quantity === 0);

    // Próximos agendamentos
    const upcomingAppointments = await this.prisma.appointment.findMany({
      where: {
        ...filter,
        startsAt: {
          gte: new Date(),
        },
        status: 'SCHEDULED',
      },
      take: 5,
      orderBy: {
        startsAt: 'asc',
      },
      include: {
        user: {
          select: {
            name: true,
            phone: true,
          },
        },
        service: {
          select: {
            name: true,
            price: true,
          },
        },
        pet: {
          select: {
            name: true,
            species: true,
          },
        },
        store: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      isGlobal: !storeId,
      summary: {
        todayAppointments,
        completedToday,
        monthOrders,
        monthRevenue: monthRevenue._sum.total || 0,
        activeServices,
        employees,
        openOrders,
        outOfStockProducts: outOfStock.length,
        lowStockProducts: criticalStock.length,
      },
      upcomingAppointments,
      lowStockItems: criticalStock.map((s: any) => ({
        id: s.productId,
        name: s.product.name,
        sku: s.product.sku,
        quantity: s.quantity,
        minStock: s.minStock,
        storeName: s.store?.name,
      })),
    };
  }

  async getFinancialDashboard(
    storeId?: string,
    startDate?: Date,
    endDate?: Date,
    city?: string,
    state?: string,
  ) {
    const start =
      startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate || new Date();

    const filter = this.buildStoreFilter(storeId, city, state);

    // Construção de filtro SQL seguro seria ideal, mas para brevidade/complexidade aqui com raw query:
    // Se tiver city/state, precisamos fazer join com stores.
    // Vamos simplificar: Se tiver filtro regional, buscamos os IDs das stores primeiro.
    let regionalStoreIds: string[] = [];
    if (!storeId && (city || state)) {
        const stores = await this.prisma.store.findMany({
            where: {
                ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
                ...(state ? { state: { contains: state, mode: 'insensitive' } } : {}),
            },
            select: { id: true }
        });
        regionalStoreIds = stores.map(s => s.id);
        
        // Se não achou nenhuma loja com o filtro, retorna vazio
        if (regionalStoreIds.length === 0) {
             return {
                isGlobal: true,
                period: { start, end },
                totalRevenue: 0,
                totalOrders: 0,
                dailyRevenue: [],
                revenueByCategory: [],
                revenueByService: [],
            };
        }
    }

    let storeFilterSql = '';
    if (storeId) {
        storeFilterSql = `AND o."storeId" = '${storeId}'`;
    } else if (regionalStoreIds.length > 0) {
        const ids = regionalStoreIds.map(id => `'${id}'`).join(',');
        storeFilterSql = `AND o."storeId" IN (${ids})`;
    }

    // Receita total (Prisma é mais fácil com o filter object)
    const totalRevenue = await this.prisma.order.aggregate({
      where: {
        ...filter,
        createdAt: {
          gte: start,
          lte: end,
        },
        status: 'PAID',
      },
      _sum: {
        total: true,
      },
      _count: true,
    });

    // Receita por dia
    const dailyRevenue = await this.prisma.$queryRawUnsafe<
      Array<{ date: Date; total: number; count: number }>
    >(`
      SELECT 
        DATE("createdAt") as date,
        SUM(total::numeric) as total,
        COUNT(*) as count
      FROM orders o
      WHERE "createdAt" >= $1
        AND "createdAt" <= $2
        AND status = 'PAID'
        ${storeFilterSql}
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
    `, start, end); // Use alias 'o' in query above to match the filter builder logic

    // Receita por categoria de produto
    const revenueByCategory = await this.prisma.$queryRawUnsafe<
      Array<{ category: string; total: number }>
    >(`
      SELECT 
        p.category,
        SUM(oi.price::numeric * oi.quantity) as total
      FROM order_items oi
      INNER JOIN orders o ON o.id = oi."orderId"
      INNER JOIN products p ON p.id = oi."productId"
      WHERE o."createdAt" >= $1
        AND o."createdAt" <= $2
        AND o.status = 'PAID'
        ${storeFilterSql}
      GROUP BY p.category
      ORDER BY total DESC
    `, start, end);

    // Receita por serviços
    const revenueByService = await this.prisma.$queryRawUnsafe<
      Array<{ service: string; total: number; count: number }>
    >(`
      SELECT 
        s.name as service,
        SUM(oi.price::numeric) as total,
        COUNT(*) as count
      FROM order_items oi
      INNER JOIN orders o ON o.id = oi."orderId"
      INNER JOIN services s ON s.id = oi."serviceId"
      WHERE o."createdAt" >= $1
        AND o."createdAt" <= $2
        AND o.status = 'PAID'
        AND oi."serviceId" IS NOT NULL
        ${storeFilterSql}
      GROUP BY s.name
      ORDER BY total DESC
    `, start, end);

    return {
      isGlobal: !storeId,
      period: {
        start,
        end,
      },
      totalRevenue: totalRevenue._sum.total || 0,
      totalOrders: totalRevenue._count,
      dailyRevenue: dailyRevenue.map((d) => ({
        date: d.date,
        total: Number(d.total),
        count: Number(d.count),
      })),
      revenueByCategory: revenueByCategory.map((r) => ({
        category: r.category,
        total: Number(r.total),
      })),
      revenueByService: revenueByService.map((r) => ({
        service: r.service,
        total: Number(r.total),
        count: Number(r.count),
      })),
    };
  }

  async getBenchmarking(
    startDate?: Date,
    endDate?: Date,
    city?: string,
    state?: string,
  ) {
    const start =
      startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate || new Date();

    // 1. Buscar lojas (com filtro regional, se houver)
    const storeWhere = {
         ...(city ? { city: { contains: city, mode: 'insensitive' as any } } : {}),
         ...(state ? { state: { contains: state, mode: 'insensitive' as any } } : {}),
         isActive: true
    };

    const stores = await this.prisma.store.findMany({
        where: storeWhere,
        select: { id: true, name: true, city: true, state: true }
    });

    // 2. Calcular métricas para cada loja
    const benchmarkData = await Promise.all(stores.map(async (store) => {
        const orderStats = await this.prisma.order.aggregate({
            where: {
                storeId: store.id,
                status: 'PAID',
                createdAt: { gte: start, lte: end }
            },
            _sum: { total: true },
            _count: true
        });

        const appointmentCount = await this.prisma.appointment.count({
            where: {
                storeId: store.id,
                status: 'COMPLETED',
                startsAt: { gte: start, lte: end }
            }
        });

        const totalRevenue = Number(orderStats._sum.total || 0);
        const orderCount = orderStats._count;
        const averageTicket = orderCount > 0 ? totalRevenue / orderCount : 0;

        return {
            storeId: store.id,
            storeName: store.name,
            city: store.city,
            state: store.state,
            totalRevenue,
            orderCount,
            appointmentCount,
            averageTicket
        };
    }));

    // 3. Ordenar por receita decrescente
    return benchmarkData.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  // ==================== GESTÃO DE SERVIÇOS ====================

  async getServices(storeId?: string) {
    const filter = storeId ? { storeId } : {};

    const services = await this.prisma.service.findMany({
      where: filter,
      orderBy: {
        name: 'asc',
      },
    });

    // Buscar estatísticas para cada serviço
    const servicesWithStats = await Promise.all(
      services.map(async (service) => {
        const appointmentCount = await this.prisma.appointment.count({
          where: {
            serviceId: service.id,
            ...filter,
          },
        });

        const revenue = await this.prisma.orderItem.aggregate({
          where: {
            serviceId: service.id,
            order: {
              ...filter,
              status: 'PAID',
            },
          },
          _sum: {
            price: true,
          },
        });

        return {
          ...service,
          stats: {
            appointmentCount,
            totalRevenue: revenue._sum.price || 0,
          },
        };
      }),
    );

    return servicesWithStats;
  }

  async getServiceById(storeId: string | undefined, serviceId: string) {
    const filter = storeId ? { storeId } : {};

    const service = await this.prisma.service.findFirst({
      where: {
        id: serviceId,
        ...filter,
      },
    });

    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }

    const stats = await this.getServiceStats(storeId, serviceId);

    return {
      ...service,
      stats,
    };
  }

  createService(storeId: string | undefined, data: any) {
    const finalStoreId = data.storeId || storeId;

    if (!finalStoreId) {
      throw new ForbiddenException(
        'Informe a loja para a criação deste serviço.',
      );
    }

    return this.prisma.service.create({
      data: {
        storeId: finalStoreId,
        name: data.name,
        price: data.price,
        durationMin: data.durationMin || 30,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  async updateService(
    storeId: string | undefined,
    serviceId: string,
    data: any,
  ) {
    const filter = storeId ? { storeId } : {};

    // Verificar se o serviço pertence à loja
    const service = await this.prisma.service.findFirst({
      where: {
        id: serviceId,
        ...filter,
      },
    });

    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }

    return this.prisma.service.update({
      where: {
        id: serviceId,
      },
      data: {
        name: data.name,
        price: data.price,
        durationMin: data.durationMin,
        isActive: data.isActive,
      },
    });
  }

  async deactivateService(storeId: string | undefined, serviceId: string) {
    const filter = storeId ? { storeId } : {};

    // Verificar se o serviço pertence à loja
    const service = await this.prisma.service.findFirst({
      where: {
        id: serviceId,
        ...filter,
      },
    });

    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }

    return this.prisma.service.update({
      where: {
        id: serviceId,
      },
      data: {
        isActive: false,
      },
    });
  }

  async getServiceStats(storeId: string | undefined, serviceId: string) {
    const filter = storeId ? { storeId } : {};

    const totalAppointments = await this.prisma.appointment.count({
      where: {
        serviceId,
        ...filter,
      },
    });

    const completedAppointments = await this.prisma.appointment.count({
      where: {
        serviceId,
        ...filter,
        status: 'COMPLETED',
      },
    });

    const cancelledAppointments = await this.prisma.appointment.count({
      where: {
        serviceId,
        ...filter,
        status: 'CANCELLED',
      },
    });

    const revenue = await this.prisma.orderItem.aggregate({
      where: {
        serviceId,
        order: {
          ...filter,
          status: 'PAID',
        },
      },
      _sum: {
        price: true,
      },
    });

    // Agendamentos por mês (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const appointmentsByMonth = await this.prisma.$queryRaw<
      Array<{ month: string; count: number }>
    >`
      SELECT 
        TO_CHAR("startsAt", 'YYYY-MM') as month,
        COUNT(*) as count
      FROM appointments
      WHERE "serviceId" = ${serviceId}
        AND "storeId" = ${storeId}
        AND "startsAt" >= ${sixMonthsAgo}
      GROUP BY TO_CHAR("startsAt", 'YYYY-MM')
      ORDER BY month
    `;

    return {
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      completionRate:
        totalAppointments > 0
          ? (completedAppointments / totalAppointments) * 100
          : 0,
      totalRevenue: revenue._sum.price || 0,
      appointmentsByMonth: appointmentsByMonth.map((a) => ({
        month: a.month,
        count: Number(a.count),
      })),
    };
  }

  // ==================== FINANCEIRO ====================

  private getPeriodDates(period: string) {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    switch (period) {
      case 'today':
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        start = new Date(now);
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { start, end };
  }

  async getRevenue(storeId: string | undefined, period: string) {
    const { start, end } = this.getPeriodDates(period);
    const filter = storeId ? { storeId } : {};

    const revenue = await this.prisma.order.aggregate({
      where: {
        ...filter,
        createdAt: {
          gte: start,
          lte: end,
        },
        status: 'PAID',
      },
      _sum: {
        total: true,
      },
      _count: true,
    });

    const previousPeriodEnd = new Date(start);
    const previousPeriodStart = new Date(start);
    const diff = end.getTime() - start.getTime();
    previousPeriodStart.setTime(previousPeriodStart.getTime() - diff);

    const previousRevenue = await this.prisma.order.aggregate({
      where: {
        ...filter,
        createdAt: {
          gte: previousPeriodStart,
          lt: previousPeriodEnd,
        },
        status: 'PAID',
      },
      _sum: {
        total: true,
      },
    });

    const currentTotal = Number(revenue._sum.total || 0);
    const previousTotal = Number(previousRevenue._sum.total || 0);
    const growth =
      previousTotal > 0
        ? ((currentTotal - previousTotal) / previousTotal) * 100
        : 0;

    return {
      period,
      start,
      end,
      total: currentTotal,
      orderCount: revenue._count,
      previousTotal,
      growth: growth.toFixed(2),
    };
  }

  async getOrders(storeId: string | undefined, period: string) {
    const { start, end } = this.getPeriodDates(period);
    const filter = storeId ? { storeId } : {};

    const orders = await this.prisma.order.findMany({
      where: {
        ...filter,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
            service: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const summary = await this.prisma.order.groupBy({
      by: ['status'],
      where: {
        ...filter,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      _count: true,
      _sum: {
        total: true,
      },
    });

    return {
      period,
      orders,
      summary: summary.map((s) => ({
        status: s.status,
        count: s._count,
        total: Number(s._sum.total || 0),
      })),
    };
  }

  async getAppointments(storeId: string | undefined, period: string) {
    const { start, end } = this.getPeriodDates(period);
    const filter = storeId ? { storeId } : {};

    const appointments = await this.prisma.appointment.findMany({
      where: {
        ...filter,
        startsAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        startsAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            phone: true,
          },
        },
        service: {
          select: {
            name: true,
            price: true,
          },
        },
        pet: {
          select: {
            name: true,
            species: true,
          },
        },
        professional: {
          select: {
            name: true,
          },
        },
      },
    });

    const summary = await this.prisma.appointment.groupBy({
      by: ['status'],
      where: {
        ...filter,
        startsAt: {
          gte: start,
          lte: end,
        },
      },
      _count: true,
    });

    return {
      period,
      appointments,
      summary: summary.map((s) => ({
        status: s.status,
        count: s._count,
      })),
    };
  }

  async getTopProducts(storeId: string | undefined, limit: number = 10) {
    const storeFilterSql = storeId ? `AND o."storeId" = '${storeId}'` : '';
    const topProducts = await this.prisma.$queryRawUnsafe<
      Array<{
        product_id: string;
        product_name: string;
        total_sold: number;
        revenue: number;
      }>
    >(`
      SELECT 
        p.id as product_id,
        p.name as product_name,
        SUM(oi.quantity) as total_sold,
        SUM(oi.price::numeric * oi.quantity) as revenue
      FROM order_items oi
      INNER JOIN orders o ON o.id = oi."orderId"
      INNER JOIN products p ON p.id = oi."productId"
      WHERE o.status = 'PAID'
        AND oi."productId" IS NOT NULL
        ${storeFilterSql}
      GROUP BY p.id, p.name
      ORDER BY revenue DESC
      LIMIT $1
    `, limit);

    return topProducts.map((p) => ({
      productId: p.product_id,
      productName: p.product_name,
      totalSold: Number(p.total_sold),
      revenue: Number(p.revenue),
    }));
  }

  async getTopServices(storeId: string | undefined, limit: number = 10) {
    const storeFilterSql = storeId ? `AND o."storeId" = '${storeId}'` : '';
    const topServices = await this.prisma.$queryRawUnsafe<
      Array<{
        service_id: string;
        service_name: string;
        total_appointments: number;
        revenue: number;
      }>
    >(`
      SELECT 
        s.id as service_id,
        s.name as service_name,
        COUNT(*) as total_appointments,
        SUM(oi.price::numeric) as revenue
      FROM order_items oi
      INNER JOIN orders o ON o.id = oi."orderId"
      INNER JOIN services s ON s.id = oi."serviceId"
      WHERE o.status = 'PAID'
        AND oi."serviceId" IS NOT NULL
        ${storeFilterSql}
      GROUP BY s.id, s.name
      ORDER BY revenue DESC
      LIMIT $1
    `, limit);

    return topServices.map((s) => ({
      serviceId: s.service_id,
      serviceName: s.service_name,
      totalAppointments: Number(s.total_appointments),
      revenue: Number(s.revenue),
    }));
  }

  // ==================== RELATÓRIOS ====================

  async getDailyReport(storeId: string | undefined, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const filter = storeId ? { storeId } : {};

    const appointments = await this.prisma.appointment.findMany({
      where: {
        ...filter,
        startsAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        service: true,
        professional: {
          select: {
            name: true,
          },
        },
      },
    });

    const orders = await this.prisma.order.findMany({
      where: {
        ...filter,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
            service: true,
          },
        },
      },
    });

    const totalRevenue = orders
      .filter((o) => o.status === 'PAID')
      .reduce((sum, o) => sum + Number(o.total), 0);

    return {
      date,
      appointments: {
        total: appointments.length,
        completed: appointments.filter((a) => a.status === 'COMPLETED').length,
        cancelled: appointments.filter((a) => a.status === 'CANCELLED').length,
        scheduled: appointments.filter((a) => a.status === 'SCHEDULED').length,
        list: appointments,
      },
      orders: {
        total: orders.length,
        paid: orders.filter((o) => o.status === 'PAID').length,
        pending: orders.filter((o) => o.status === 'PENDING').length,
        cancelled: orders.filter((o) => o.status === 'CANCELLED').length,
        totalRevenue,
        list: orders,
      },
    };
  }

  async getEmployeePerformance(
    storeId: string | undefined,
    startDate?: Date,
    endDate?: Date,
  ) {
    const start =
      startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate || new Date();

    const filter = storeId ? { storeId } : {};

    const employees = await this.prisma.user.findMany({
      where: {
        ...filter,
        role: { in: ['EMPLOYEE', 'MANAGER'] },
      },
      select: {
        id: true,
        name: true,
        role: true,
      },
    });

    const performance = await Promise.all(
      employees.map(async (employee) => {
        const appointments = await this.prisma.appointment.findMany({
          where: {
            professionalId: employee.id,
            startsAt: {
              gte: start,
              lte: end,
            },
          },
        });

        const reviews = await this.prisma.review.findMany({
          where: {
            employeeId: employee.id,
            createdAt: {
              gte: start,
              lte: end,
            },
          },
        });

        const avgRating =
          reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length
            : 0;

        return {
          employee: {
            id: employee.id,
            name: employee.name,
            role: employee.role,
          },
          stats: {
            totalAppointments: appointments.length,
            completedAppointments: appointments.filter(
              (a) => a.status === 'COMPLETED',
            ).length,
            cancelledAppointments: appointments.filter(
              (a) => a.status === 'CANCELLED',
            ).length,
            completionRate:
              appointments.length > 0
                ? (appointments.filter((a) => a.status === 'COMPLETED').length /
                    appointments.length) *
                  100
                : 0,
            totalReviews: reviews.length,
            averageRating: avgRating,
          },
        };
      }),
    );

    return {
      period: {
        start,
        end,
      },
      employees: performance,
    };
  }

  // ==================== GESTÃO DE USUÁRIOS ====================

  private canManageRole(managerRole: string, targetRole: string): boolean {
    // MANAGER pode gerenciar apenas CLIENT e EMPLOYEE
    if (managerRole === 'MANAGER') {
      return ['CLIENT', 'EMPLOYEE'].includes(targetRole);
    }
    // OWNER e SUPER_ADMIN podem gerenciar todos
    if (['OWNER', 'SUPER_ADMIN'].includes(managerRole)) {
      return true;
    }
    return false;
  }

  async getUsers(
    storeId: string | undefined,
    managerRole: string,
    roleFilter?: string,
  ) {
    let allowedRoles: Role[];

    if (managerRole === 'MANAGER') {
      allowedRoles = [Role.CLIENT, Role.EMPLOYEE];
    } else {
      allowedRoles = [Role.CLIENT, Role.EMPLOYEE, Role.MANAGER, Role.OWNER];
    }

    const where: any = {};
    const isNetworkAdmin = ['OWNER', 'SUPER_ADMIN'].includes(managerRole);

    if (storeId) {
      where.OR = [{ storeId }, { role: Role.CLIENT }];
    } else if (!isNetworkAdmin) {
      // Se não for admin de rede e não tiver storeId (não deve acontecer pelo controller/guard), 
      // limita drasticamente
      where.storeId = 'NONE';
    }

    if (roleFilter) {
      where.role = roleFilter as Role;
      if (!allowedRoles.includes(roleFilter as Role)) {
        throw new ForbiddenException(
          'Você não tem permissão para visualizar esses usuários',
        );
      }
    } else {
      where.role = { in: allowedRoles };
    }

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        storeId: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users;
  }

  async getUserById(
    storeId: string | undefined,
    managerRole: string,
    userId: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        storeId: true,
        birthDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (!this.canManageRole(managerRole, user.role)) {
      throw new ForbiddenException(
        'Você não tem permissão para visualizar este usuário',
      );
    }

    const isNetworkAdmin = ['OWNER', 'SUPER_ADMIN'].includes(managerRole);

    // Validar que o usuário pertence à loja (exceto CLIENTs e para administradores de rede)
    if (
      !isNetworkAdmin &&
      user.role !== 'CLIENT' &&
      user.storeId !== storeId
    ) {
      throw new ForbiddenException('Usuário não pertence a esta loja');
    }

    return user;
  }

  async createUser(
    storeId: string | undefined,
    managerRole: string,
    data: any,
  ) {
    const targetRole = data.role as string;

    if (!this.canManageRole(managerRole, targetRole)) {
      throw new ForbiddenException(
        'Você não tem permissão para criar usuários com este papel',
      );
    }

    const isNetworkAdmin = ['OWNER', 'SUPER_ADMIN'].includes(managerRole);
    const finalStoreId = isNetworkAdmin && data.storeId ? data.storeId : storeId;

    if (targetRole !== 'CLIENT' && !finalStoreId) {
      throw new ForbiddenException(
        'Informe a loja para a criação deste usuário.',
      );
    }

    // Verificar se email ou telefone já existe
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { phone: data.phone }],
      },
    });

    if (existing) {
      throw new ForbiddenException('Email ou telefone já está em uso');
    }

    const hashedPassword = await bcrypt.hash(data.password || '123456', 10);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        role: targetRole as Role,
        storeId: targetRole === 'CLIENT' ? null : finalStoreId,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        storeId: true,
        createdAt: true,
      },
    });

    return user;
  }

  async updateUser(
    storeId: string | undefined,
    managerRole: string,
    userId: string,
    data: any,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (!this.canManageRole(managerRole, user.role)) {
      throw new ForbiddenException(
        'Você não tem permissão para editar este usuário',
      );
    }

    const isNetworkAdmin = ['OWNER', 'SUPER_ADMIN'].includes(managerRole);

    // Validar que o usuário pertence à loja (exceto CLIENTs e para administradores de rede)
    if (
      !isNetworkAdmin &&
      user.role !== 'CLIENT' &&
      user.storeId !== storeId
    ) {
      throw new ForbiddenException('Usuário não pertence a esta loja');
    }

    const updateData: any = {
      name: data.name,
      phone: data.phone,
    };

    if (data.birthDate) {
      updateData.birthDate = new Date(data.birthDate);
    }

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    // Permitir mudança de role:
    // - OWNER e SUPER_ADMIN podem alterar qualquer role
    // - MANAGER pode alterar apenas entre EMPLOYEE <-> MANAGER
    if (data.role) {
      const targetRole = data.role as string;
      if (['OWNER', 'SUPER_ADMIN'].includes(managerRole)) {
        if (!this.canManageRole(managerRole, targetRole)) {
          throw new ForbiddenException(
            'Você não tem permissão para atribuir este papel',
          );
        }
        updateData.role = targetRole as Role;
      } else if (managerRole === 'MANAGER') {
        // Só pode promover/demover entre EMPLOYEE e MANAGER
        const allowed = ['EMPLOYEE', 'MANAGER'];
        if (allowed.includes(user.role) && allowed.includes(targetRole)) {
          updateData.role = targetRole as Role;
        } else {
          throw new ForbiddenException(
            'MANAGER só pode promover/demover entre EMPLOYEE e MANAGER',
          );
        }
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        storeId: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  async deleteUser(
    storeId: string | undefined,
    managerRole: string,
    userId: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (!this.canManageRole(managerRole, user.role)) {
      throw new ForbiddenException(
        'Você não tem permissão para remover este usuário',
      );
    }

    const isNetworkAdmin = ['OWNER', 'SUPER_ADMIN'].includes(managerRole);

    // Validar que o usuário pertence à loja (exceto CLIENTs e para administradores de rede)
    if (
      !isNetworkAdmin &&
      user.role !== 'CLIENT' &&
      user.storeId !== storeId
    ) {
      throw new ForbiddenException('Usuário não pertence a esta loja');
    }

    // Soft delete: podemos desativar ou deletar dependendo da regra de negócio
    // Por ora, vamos deletar
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'Usuário removido com sucesso' };
  }
  // ==================== GESTÃO DE ESCALAS ====================

  async getEmployeeSchedule(storeId: string | undefined, userId: string): Promise<WorkScheduleDto[]> {
    // 1. Verificar se o user pertence à loja (ou é o próprio usuário - mas aqui é rota de manager)
    // Para simplificar, verificamos se o user alvo existe e se o manager tem acesso
    // Mas se storeId for undefined (superadmin), pode ver qualquer um.
    
    // 2. Buscar schedules
    const schedules = await this.prisma.workSchedule.findMany({
      where: { userId },
      orderBy: { weekday: 'asc' },
    });

    // 3. Garantir que retornamos todos os dias da semana (0-6)
    // Se não tiver no banco, retornamos um default "padrão" ou vazio
    const fullSchedule: WorkScheduleDto[] = [];
    for (let i = 0; i <= 6; i++) {
        const existing = schedules.find(s => s.weekday === i);
        if (existing) {
            fullSchedule.push({
                weekday: existing.weekday,
                startTime: existing.startTime,
                endTime: existing.endTime,
                startBreak: existing.startBreak || undefined,
                endBreak: existing.endBreak || undefined,
                isDayOff: existing.isDayOff
            });
        } else {
            fullSchedule.push({
                weekday: i,
                startTime: '09:00',
                endTime: '18:00',
                isDayOff: true, // Por padrão, dias sem config podem ser folga ou não, vamos assumir folga para forçar config
                startBreak: undefined,
                endBreak: undefined
            });
        }
    }

    return fullSchedule;
  }

  async updateEmployeeSchedule(
    storeId: string | undefined,
    userId: string,
    schedules: WorkScheduleDto[],
  ) {
    // Validação básica de acesso poderia ser feita aqui (se o user alvo pertence à loja do manager)
    
    // Validate inputs using a transaction
    await this.prisma.$transaction(async (tx) => {
        // Remove existing (clean slate strategy or upsert loop)
        // Upsert loop is safer to keep IDs if needed, but delete/create is simpler for full-week updates.
        // Let's use upsert loop.
        
        for (const schedule of schedules) {
            if (schedule.weekday < 0 || schedule.weekday > 6) continue;

            await tx.workSchedule.upsert({
                where: {
                    userId_weekday: {
                        userId,
                        weekday: schedule.weekday
                    }
                },
                update: {
                    startTime: schedule.startTime,
                    endTime: schedule.endTime,
                    startBreak: schedule.startBreak,
                    endBreak: schedule.endBreak,
                    isDayOff: schedule.isDayOff
                },
                create: {
                    userId,
                    weekday: schedule.weekday,
                    startTime: schedule.startTime || '09:00',
                    endTime: schedule.endTime || '18:00',
                    startBreak: schedule.startBreak,
                    endBreak: schedule.endBreak,
                    isDayOff: schedule.isDayOff || false
                }
            });
        }
    });

    return { success: true };
  }
}
