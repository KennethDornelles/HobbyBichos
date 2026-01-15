export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  fullName: string;
  password: string;
}

// Appointment Types
export interface AppointmentDashboard {
  id: string;
  startsAt: Date;
  status: string;
  petName: string;
  petSpecies: string;
  clientName: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  notes?: string;
}

// Google Maps Types
export * from './googlemaps.types';