import { PrismaClient, Role, Store, Product } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { seedLoyaltyRewards } from './seeds/loyalty-rewards.seed';

// Carrega as variáveis do .env imediatamente
config();

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL não está definida no arquivo .env');
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('🚀 Iniciando seed do ecossistema Hobby Bichos...');

    // Limpeza de dados
    await prisma.appointment.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.productStock.deleteMany({});
    await prisma.service.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.pet.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.store.deleteMany({});

    // 1. Criação das Lojas
    const storeData = [
      {
        id: 'store1',
        name: 'Loja Teste E2E',
        slug: 'store1',
        phone: '(83) 99999-9999',
        whatsappNumber: '5583999999999',
      },
      { name: 'Bessa', slug: 'bessa', phone: '(83) 99999-0001' },
      { name: 'Manaíra', slug: 'manaira', phone: '(83) 99999-0002' },
      { name: 'Cabo Branco', slug: 'cabo-branco', phone: '(83) 99999-0003' },
      { name: 'Altiplano', slug: 'altiplano', phone: '(83) 99999-0004' },
      { name: 'Intermares', slug: 'intermares', phone: '(83) 99999-0005' },
      { name: 'Bancários', slug: 'bancarios', phone: '(83) 99999-0006' },
    ];

    const stores: Store[] = [];
    for (const data of storeData) {
      const store = await prisma.store.create({ data });
      stores.push(store);
    }

    // 1b. Criação de expediente padrão para store1 (segunda a sexta, 08:00-18:00)
    for (let weekday = 1; weekday <= 5; weekday++) {
      await prisma.storeBusinessHour.create({
        data: {
          storeId: 'store1',
          weekday,
          openTime: '08:00',
          closeTime: '18:00',
        },
      });
    }

    // 2. Usuários
    const passwordHash = await bcrypt.hash('123456', 10);
    await prisma.user.create({
      data: {
        name: 'Super Admin Hobby',
        email: 'admin@hobbybichos.com',
        password: passwordHash,
        phone: '00000000000',
        role: Role.SUPER_ADMIN,
      },
    });

    for (const store of stores) {
      await prisma.user.create({
        data: {
          name: `Dono ${store.name}`,
          email: `owner.${store.slug}@hobbybichos.com`,
          password: passwordHash,
          phone: `839${Math.floor(10000000 + Math.random() * 90000000)}`,
          role: Role.OWNER,
          storeId: store.id,
        },
      });
    }

    // 3. Produtos
    const productData = [
      { id: 'p1', name: 'Ração Adulto', barcode: '7890001', basePrice: 189.9 },
      { name: 'Coleira', barcode: '7890002', basePrice: 45.0 },
    ];

    const products: Product[] = [];
    for (const data of productData) {
      const product = await prisma.product.create({ data });
      products.push(product);
    }

    // 4. Estoque para produto p1 na loja store1
    await prisma.productStock.create({
      data: {
        productId: 'p1',
        storeId: 'store1',
        quantity: 100,
      },
    });

    // Usuário de teste E2E
    await prisma.user.create({
      data: {
        name: 'QA',
        email: 'test@qa.com',
        password: passwordHash,
        phone: '11999999999',
        role: Role.OWNER,
        storeId: 'store1',
      },
    });

    // Usuário CLIENT padrão para E2E
    await prisma.user.create({
      data: {
        name: 'Cliente QA',
        email: 'client@qa.com',
        password: await bcrypt.hash('Senha123!', 10),
        phone: '11999999998',
        role: Role.CLIENT,
        storeId: 'store1',
      },
    });

    // Serviço para a loja store1 com id fixo
    await prisma.service.create({
      data: {
        id: 's1',
        storeId: 'store1',
        name: 'Banho',
        price: 50.0,
        durationMin: 30,
      },
    });

    console.log('✨ Seed finalizado com sucesso!');

    // Seed loyalty rewards
    console.log('🎁 Seeding loyalty system...');
    await seedLoyaltyRewards();
  } catch (error: unknown) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  } finally {
    // Fecha as conexões de forma segura
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error('❌ Erro no seed:', error);
  process.exit(1);
});
