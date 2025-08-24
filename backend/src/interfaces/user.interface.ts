export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  cpf?: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
