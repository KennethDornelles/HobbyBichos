// Enum definido manualmente para status
export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class Appointment {
  id: string;
  petId: string;
  professionalId: string;
  serviceId: string;
  storeId: string;
  userId: string;
  startsAt: Date;
  endsAt: Date;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
}
