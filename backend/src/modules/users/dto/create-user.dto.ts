import { Role } from '@prisma/client';

export class CreateUserDto {
  email!: string;
  password!: string;
  name!: string;
  phone?: string;
  cpf?: string;
  role?: Role;
}
