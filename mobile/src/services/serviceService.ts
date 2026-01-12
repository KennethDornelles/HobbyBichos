import api from './api';

export interface Service {
  id: string;
  storeId: string;
  name: string;
  price: number;
  durationMin: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  store?: {
    id: string;
    name: string;
  };
}

export interface CreateServiceData {
  name: string;
  price: number;
  durationMin: number;
}

export const serviceService = {
  async getAll(): Promise<Service[]> {
    const response = await api.get<Service[]>('/services');
    return response.data;
  },

  async getById(id: string): Promise<Service> {
    const response = await api.get<Service>(`/services/${id}`);
    return response.data;
  },

  async create(data: CreateServiceData): Promise<Service> {
    const response = await api.post<Service>('/services', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateServiceData>): Promise<Service> {
    const response = await api.patch<Service>(`/services/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/services/${id}`);
  },
};
