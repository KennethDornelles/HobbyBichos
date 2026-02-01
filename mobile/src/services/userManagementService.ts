import api from './api';

export interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CLIENT' | 'EMPLOYEE' | 'MANAGER' | 'OWNER' | 'SUPER_ADMIN';
  storeId: string | null;
  birthDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StoreData {
  id: string;
  name: string;
  slug: string;
  phone?: string;
  address?: string;
  isActive: boolean;
}

export interface CreateUserDto {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: 'CLIENT' | 'EMPLOYEE' | 'MANAGER' | 'OWNER';
  birthDate?: string;
}

export interface UpdateUserDto {
  name: string;
  phone: string;
  password?: string;
  birthDate?: string;
  role?: 'CLIENT' | 'EMPLOYEE' | 'MANAGER' | 'OWNER';
}

export const userManagementService = {
  async getUsers(roleFilter?: string): Promise<UserData[]> {
    const response = await api.get('/manager/users', {
      params: { role: roleFilter },
    });
    return response.data;
  },

  async getUserById(id: string): Promise<UserData> {
    const response = await api.get(`/manager/users/${id}`);
    return response.data;
  },

  async createUser(data: CreateUserDto): Promise<UserData> {
    const response = await api.post('/manager/users', data);
    return response.data;
  },

  async updateUser(id: string, data: UpdateUserDto): Promise<UserData> {
    const response = await api.put(`/manager/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/manager/users/${id}`);
  },

  async getStores(): Promise<StoreData[]> {
    const response = await api.get('/stores');
    return response.data;
  },
};
