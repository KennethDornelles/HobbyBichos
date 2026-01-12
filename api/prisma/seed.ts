import { PrismaClient, Role, Store, Product } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { seedLoyaltyRewards } from './seeds/loyalty-rewards.seed';
import { seedServices } from './seeds/services.seed';

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

    // Limpeza de dados (mantém usuários existentes)
    console.log('⚠️  Limpando dados de teste (usuários serão preservados)...');
    await prisma.appointment.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.productStock.deleteMany({});
    await prisma.service.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.pet.deleteMany({});
    // REMOVIDO: await prisma.user.deleteMany({});
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

    // 1b. Criação de expediente padrão para todas as lojas
    // Segunda a Sexta: 07:00-19:00
    // Sábado: 07:00-17:00
    // Domingo: Fechado
    for (const store of stores) {
      // Segunda a sexta (weekday 1-5)
      for (let weekday = 1; weekday <= 5; weekday++) {
        await prisma.storeBusinessHour.create({
          data: {
            storeId: store.id,
            weekday,
            openTime: '07:00',
            closeTime: '19:00',
          },
        });
      }

      // Sábado (weekday 6)
      await prisma.storeBusinessHour.create({
        data: {
          storeId: store.id,
          weekday: 6,
          openTime: '07:00',
          closeTime: '17:00',
        },
      });

      // Domingo (weekday 0) - não cria registro, loja fechada
    }

    // 2. Usuários
    const passwordHash = await bcrypt.hash('123456', 10);
    console.log('👤 Criando usuários do sistema...');

    await prisma.user.upsert({
      where: { email: 'admin@hobbybichos.com' },
      update: {},
      create: {
        name: 'Super Admin Hobby',
        email: 'admin@hobbybichos.com',
        password: passwordHash,
        phone: '00000000000',
        role: Role.SUPER_ADMIN,
      },
    });

    for (const store of stores) {
      await prisma.user.upsert({
        where: { email: `owner.${store.slug}@hobbybichos.com` },
        update: {},
        create: {
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
    await prisma.user.upsert({
      where: { email: 'test@qa.com' },
      update: {},
      create: {
        name: 'QA',
        email: 'test@qa.com',
        password: passwordHash,
        phone: '11999999999',
        role: Role.OWNER,
        storeId: 'store1',
      },
    });

    // Usuário CLIENT padrão para E2E
    await prisma.user.upsert({
      where: { email: 'client@qa.com' },
      update: {},
      create: {
        name: 'Cliente QA',
        email: 'client@qa.com',
        password: await bcrypt.hash('Senha123!', 10),
        phone: '11999999998',
        role: Role.CLIENT,
        storeId: 'store1',
      },
    });

    // Criação de serviços para todas as lojas
    console.log('🐾 Criando serviços...');
    const storeIds = stores.map((store) => store.id);
    await seedServices(prisma, storeIds);

    console.log('✨ Seed finalizado com sucesso!');

    // Seed loyalty rewards
    console.log('🎁 Seeding loyalty system...');
    await seedLoyaltyRewards(prisma);
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
