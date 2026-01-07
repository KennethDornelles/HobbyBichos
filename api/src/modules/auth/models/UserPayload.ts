export interface UserPayload {
  id: string;
  email: string;
  role: string; // ou use 'Role' se estiver usando enum do Prisma
  storeId: string | null;
  iat?: number; // emitido em
  exp?: number; // expira em
}
