import api from './api';

export interface Appointment {
  id: string;
  storeId: string;
  startsAt: string;
  professionalId: string | null;
  userId: string;
  petId: string;
  serviceId: string;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  store?: {
    id: string;
    name: string;
  };
  pet?: {
    id: string;
    name: string;
  };
  service?: {
    id: string;
    name: string;
    price: number;
  };
  professional?: {
    id: string;
    name: string;
  };
}

export interface CreateAppointmentData {
  petId: string;
  employeeId: string;
  serviceId: string;
  startsAt: string;
}

export interface FilterAppointmentsParams {
  date?: string;
  storeId?: string;
}

export const appointmentService = {
  async getAll(params?: FilterAppointmentsParams): Promise<Appointment[]> {
    const response = await api.get<Appointment[]>('/appointments', { params });
    return response.data;
  },

  async getById(id: string): Promise<Appointment> {
    const response = await api.get<Appointment>(`/appointments/${id}`);
    return response.data;
  },

  async create(data: CreateAppointmentData): Promise<Appointment> {
    const response = await api.post<Appointment>('/appointments', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateAppointmentData>): Promise<Appointment> {
    const response = await api.patch<Appointment>(`/appointments/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/appointments/${id}`);
  },
};
