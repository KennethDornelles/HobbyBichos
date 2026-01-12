import api from './api';

export interface Store {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  whatsappNumber: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const storeService = {
  async getAll(): Promise<Store[]> {
    const response = await api.get<Store[]>('/stores');
    return response.data;
  },

  async getById(id: string): Promise<Store> {
    const response = await api.get<Store>(`/stores/${id}`);
    return response.data;
  },
};
