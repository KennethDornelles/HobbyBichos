import { Role } from '@prisma/client';

export class UpdateUserDto {
  email?: string;
  password?: string;
  name?: string;
  phone?: string;
  cpf?: string;
  role?: Role;
  isActive?: boolean;
}
