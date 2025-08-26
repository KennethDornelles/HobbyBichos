import { Role } from '@prisma/client';

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  phone?: string | null;
  cpf?: string | null;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
