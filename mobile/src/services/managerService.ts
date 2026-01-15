import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3333';

export interface DashboardSummary {
  todayAppointments: number;
  completedToday: number;
  monthOrders: number;
  monthRevenue: number;
  activeServices: number;
  employees: number;
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

export interface ManagerDashboard {
  summary: DashboardSummary;
  upcomingAppointments: UpcomingAppointment[];
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

class ManagerService {
  private async getAuthToken(): Promise<string> {
    const token = await SecureStore.getItemAsync('authToken');
    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }
    return token;
  }

  // ==================== DASHBOARD ====================
  
  async getDashboard(): Promise<ManagerDashboard> {
    const token = await this.getAuthToken();
    const response = await axios.get(`${API_URL}/manager/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  async getFinancialDashboard(startDate?: string, endDate?: string): Promise<FinancialDashboard> {
    const token = await this.getAuthToken();
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await axios.get(`${API_URL}/manager/dashboard/financial`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });
    return response.data;
  }

  // ==================== GESTÃO DE SERVIÇOS ====================
  
  async getServices(): Promise<ServiceWithStats[]> {
    const token = await this.getAuthToken();
    const response = await axios.get(`${API_URL}/manager/services`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  async getServiceById(serviceId: string): Promise<ServiceWithStats> {
    const token = await this.getAuthToken();
    const response = await axios.get(`${API_URL}/manager/services/${serviceId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  async createService(data: {
    name: string;
    price: number;
    durationMin?: number;
    isActive?: boolean;
  }): Promise<ServiceWithStats> {
    const token = await this.getAuthToken();
    const response = await axios.post(`${API_URL}/manager/services`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  async updateService(serviceId: string, data: {
    name?: string;
    price?: number;
    durationMin?: number;
    isActive?: boolean;
  }): Promise<ServiceWithStats> {
    const token = await this.getAuthToken();
    const response = await axios.put(`${API_URL}/manager/services/${serviceId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  async deactivateService(serviceId: string): Promise<ServiceWithStats> {
    const token = await this.getAuthToken();
    const response = await axios.delete(`${API_URL}/manager/services/${serviceId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  // ==================== FINANCEIRO ====================
  
  async getRevenue(period: 'today' | 'week' | 'month' | 'year' = 'month'): Promise<RevenueData> {
    const token = await this.getAuthToken();
    const response = await axios.get(`${API_URL}/manager/financial/revenue`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { period },
    });
    return response.data;
  }

  async getTopProducts(limit: number = 10): Promise<TopProduct[]> {
    const token = await this.getAuthToken();
    const response = await axios.get(`${API_URL}/manager/financial/top-products`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { limit },
    });
    return response.data;
  }

  async getTopServices(limit: number = 10): Promise<TopService[]> {
    const token = await this.getAuthToken();
    const response = await axios.get(`${API_URL}/manager/financial/top-services`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { limit },
    });
    return response.data;
  }

  async getEmployeePerformance(startDate?: string, endDate?: string): Promise<{
    period: { start: string; end: string };
    employees: EmployeePerformance[];
  }> {
    const token = await this.getAuthToken();
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await axios.get(`${API_URL}/manager/reports/employee-performance`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });
    return response.data;
  }
}

export const managerService = new ManagerService();
