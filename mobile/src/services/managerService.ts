import { api } from './api';

export interface DashboardSummary {
  todayAppointments: number;
  completedToday: number;
  monthOrders: number;
  monthRevenue: number;
  activeServices: number;
  employees: number;
  openOrders?: number;
  outOfStockProducts?: number;
  lowStockProducts?: number;
}

export interface UpcomingAppointment {
  id: string;
  startsAt: string;
  user: {
    name: string;
    phone: string;
  };
  service: {
    name: string;
    price: number;
  };
  pet: {
    name: string;
    species: string;
  };
}

export interface LowStockItem {
  id: string;
  name: string;
  sku: string | null;
  quantity: number;
  minStock: number;
  storeName?: string;
}

export interface ManagerDashboard {
  summary: DashboardSummary;
  upcomingAppointments: UpcomingAppointment[];
  lowStockItems: LowStockItem[];
}

export interface ServiceWithStats {
  id: string;
  name: string;
  price: number;
  durationMin: number;
  isActive: boolean;
  stats: {
    appointmentCount: number;
    totalRevenue: number;
  };
}

export interface FinancialDashboard {
  period: {
    start: string;
    end: string;
  };
  totalRevenue: number;
  totalOrders: number;
  dailyRevenue: Array<{
    date: string;
    total: number;
    count: number;
  }>;
  revenueByCategory: Array<{
    category: string;
    total: number;
  }>;
  revenueByService: Array<{
    service: string;
    total: number;
    count: number;
  }>;
}

export interface RevenueData {
  period: string;
  start: string;
  end: string;
  total: number;
  orderCount: number;
  previousTotal: number;
  growth: string;
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalSold: number;
  revenue: number;
}

export interface TopService {
  serviceId: string;
  serviceName: string;
  totalAppointments: number;
  revenue: number;
}

export interface EmployeePerformance {
  employee: {
    id: string;
    name: string;
    role: string;
  };
  stats: {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    completionRate: number;
    totalReviews: number;
    averageRating: number;
  };
}

export interface SalesAnalytics {
  total: number;
  previousTotal: number;
  growthPercent: number;
  dailySales: Array<{ date: string; value: number }>;
}

export interface ProductPerformance {
  name: string;
  category: string;
  quantity: number;
  revenue: number;
}

export interface AppointmentInDepth {
  total: number;
  completed: number;
  cancelled: number;
  cancellationRate: number;
  peakHours: Array<{ hour: number; count: number }>;
}

export interface CustomerMetrics {
  totalCustomers: number;
  recurrentCustomers: number;
  retentionRate: number;
  averageTicket: number;
}

class ManagerService {
  // ==================== DASHBOARD ====================
  
  async getDashboard(): Promise<ManagerDashboard> {
    const response = await api.get(`/manager/dashboard`);
    return response.data;
  }

  async getFinancialDashboard(startDate?: string, endDate?: string): Promise<FinancialDashboard> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await api.get(`/manager/dashboard/financial`, {
      params,
    });
    return response.data;
  }

  // ==================== GESTÃO DE SERVIÇOS ====================
  
  async getServices(): Promise<ServiceWithStats[]> {
    const response = await api.get(`/manager/services`);
    return response.data;
  }

  async getServiceById(serviceId: string): Promise<ServiceWithStats> {
    const response = await api.get(`/manager/services/${serviceId}`);
    return response.data;
  }

  async createService(data: {
    name: string;
    price: number;
    durationMin?: number;
    isActive?: boolean;
  }): Promise<ServiceWithStats> {
    const response = await api.post(`/manager/services`, data);
    return response.data;
  }

  async updateService(serviceId: string, data: {
    name?: string;
    price?: number;
    durationMin?: number;
    isActive?: boolean;
  }): Promise<ServiceWithStats> {
    const response = await api.put(`/manager/services/${serviceId}`, data);
    return response.data;
  }

  async deactivateService(serviceId: string): Promise<ServiceWithStats> {
    const response = await api.delete(`/manager/services/${serviceId}`);
    return response.data;
  }

  // ==================== FINANCEIRO ====================
  
  async getRevenue(period: 'today' | 'week' | 'month' | 'year' = 'month'): Promise<RevenueData> {
    const response = await api.get(`/manager/financial/revenue`, {
      params: { period },
    });
    return response.data;
  }

  async getTopProducts(limit: number = 10): Promise<TopProduct[]> {
    const response = await api.get(`/manager/financial/top-products`, {
      params: { limit },
    });
    return response.data;
  }

  async getTopServices(limit: number = 10): Promise<TopService[]> {
    const response = await api.get(`/manager/financial/top-services`, {
      params: { limit },
    });
    return response.data;
  }

  async getEmployeePerformance(startDate?: string, endDate?: string): Promise<{
    period: { start: string; end: string };
    employees: EmployeePerformance[];
  }> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await api.get(`/manager/reports/employee-performance`, {
      params,
    });
    return response.data;
  }

  // ==================== ADVANCED ANALYTICS ====================

  async getSalesAnalytics(startDate: string, endDate: string): Promise<SalesAnalytics> {
    const response = await api.get(`/analytics/sales`, {
      params: { startDate, endDate },
    });
    return response.data;
  }

  async getProductPerformance(startDate: string, endDate: string): Promise<ProductPerformance[]> {
    const response = await api.get(`/analytics/products`, {
      params: { startDate, endDate },
    });
    return response.data;
  }

  async getAppointmentInDepth(startDate: string, endDate: string): Promise<AppointmentInDepth> {
    const response = await api.get(`/analytics/appointments-detailed`, {
      params: { startDate, endDate },
    });
    return response.data;
  }

  async getCustomerMetrics(startDate: string, endDate: string): Promise<CustomerMetrics> {
    const response = await api.get(`/analytics/customers`, {
      params: { startDate, endDate },
    });
    return response.data;
  }
}

export const managerService = new ManagerService();
