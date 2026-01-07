import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    // Adicione esta linha para habilitar o comando npx prisma db seed
    seed: 'ts-node prisma/seed.ts',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
