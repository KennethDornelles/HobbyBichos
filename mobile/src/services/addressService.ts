import api from './api';

export interface Address {
  id: string;
  title: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface CreateAddressData {
  title: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault?: boolean;
}

export const addressService = {
  async getAddresses(): Promise<Address[]> {
    const response = await api.get<Address[]>('/addresses');
    return response.data;
  },

  async createAddress(data: CreateAddressData): Promise<Address> {
    const response = await api.post<Address>('/addresses', data);
    return response.data;
  },

  async updateAddress(id: string, data: Partial<CreateAddressData>): Promise<Address> {
    const response = await api.put<Address>(`/addresses/${id}`, data);
    return response.data;
  },

  async deleteAddress(id: string): Promise<void> {
    await api.delete(`/addresses/${id}`);
  }
};
