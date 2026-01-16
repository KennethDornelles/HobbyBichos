/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { PrismaClient } from '@prisma/client';
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

    // 1. Criação das Lojas - Hobby Bichos com coordenadas reais
    const storeData = [
      {
        id: 'hobby_geisel',
        name: 'Hobby Bichos Geisel',
        slug: 'hobby-geisel',
        phone: '(51) 99764-7760',
        whatsappNumber: '5551997647760',
        latitude: -7.1825,
        longitude: -34.8663,
        address: 'R. Abelardo Targino da Fonseca, 670',
        city: 'João Pessoa',
        state: 'PB',
      },
      {
        id: 'hobby_altiplano',
        name: 'Hobby Altiplano',
        slug: 'hobby-altiplano',
        phone: '(51) 99764-7760',
        whatsappNumber: '5551997647760',
        latitude: -7.1304,
        longitude: -34.8259,
        address: 'R. Poe. Targino Teixeira, 251',
        city: 'João Pessoa',
        state: 'PB',
      },
      {
        id: 'minha_cria',
        name: 'Minha Cria 24h',
        slug: 'minha-cria-24h',
        phone: '(51) 99764-7760',
        whatsappNumber: '5551997647760',
        latitude: -7.124,
        longitude: -34.826,
        address: 'R. Dr. Frutuoso Dantas, 63',
        city: 'João Pessoa',
        state: 'PB',
      },
      {
        id: 'hobby_epitacio',
        name: 'Hobby Epitácio',
        slug: 'hobby-epitacio',
        phone: '(51) 99764-7760',
        whatsappNumber: '5551997647760',
        latitude: -7.1193,
        longitude: -34.8331,
        address: 'Av. Pres. Epitácio Pessoa, 4129',
        city: 'João Pessoa',
        state: 'PB',
      },
      {
        id: 'hobby_manaira',
        name: 'Hobby Manaíra',
        slug: 'hobby-manaira',
        phone: '(51) 99764-7760',
        whatsappNumber: '5551997647760',
        latitude: -7.1041,
        longitude: -34.8359,
        address: 'Av. Monteiro da Franca, 1149',
        city: 'João Pessoa',
        state: 'PB',
      },
      {
        id: 'hobby_bessa',
        name: 'Hobby Bessa',
        slug: 'hobby-bessa',
        phone: '(51) 99764-7760',
        whatsappNumber: '5551997647760',
        latitude: -7.0966,
        longitude: -34.8354,
        address: 'Av. Fernando Luiz Henriques dos Santos, 70',
        city: 'João Pessoa',
        state: 'PB',
      },
    ];

    const stores: any[] = [];
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
        role: 'SUPER_ADMIN',
      },
    });

    for (const store of stores) {
      await prisma.user.upsert({
        where: { email: `owner.${store.slug}@hobbybichos.com` },
        update: {
          storeId: store.id,
          role: 'OWNER',
        },
        create: {
          name: `Dono ${store.name}`,
          email: `owner.${store.slug}@hobbybichos.com`,
          password: passwordHash,
          phone: `839${Math.floor(10000000 + Math.random() * 90000000)}`,
          role: 'OWNER',
          storeId: store.id,
        },
      });

      // Criar employee para cada loja
      await prisma.user.upsert({
        where: { email: `employee.${store.slug}@hobbybichos.com` },
        update: {
          storeId: store.id,
          role: 'EMPLOYEE',
        },
        create: {
          name: `Funcionário ${store.name}`,
          email: `employee.${store.slug}@hobbybichos.com`,
          password: passwordHash,
          phone: `839${Math.floor(10000000 + Math.random() * 90000000)}`,
          role: 'EMPLOYEE',
          storeId: store.id,
        },
      });
    }

    // 3. Produtos - Uma variedade de cada categoria
    const productData = [
      // Ração
      {
        name: 'Ração Golden Adulto - 15kg',
        barcode: '7890001',
        basePrice: 189.9,
        category: 'Ração',
      },
      {
        name: 'Ração Royal Canin Small - 7.5kg',
        barcode: '7890002',
        basePrice: 245.5,
        category: 'Ração',
      },
      {
        name: 'Ração Premium Plus - 15kg',
        barcode: '7890003',
        basePrice: 156.8,
        category: 'Ração',
      },
      {
        name: 'Ração Úmida Pedigree - 400g',
        barcode: '7890004',
        basePrice: 22.5,
        category: 'Ração',
      },

      // Higiene
      {
        name: 'Shampoo Neutro - 500ml',
        barcode: '7890005',
        basePrice: 45.0,
        category: 'Higiene',
      },
      {
        name: 'Condicionador Pet - 250ml',
        barcode: '7890006',
        basePrice: 38.9,
        category: 'Higiene',
      },
      {
        name: 'Toalha Banho Pet - Microfibra',
        barcode: '7890007',
        basePrice: 65.5,
        category: 'Higiene',
      },
      {
        name: 'Escova Desembarante - Aço',
        barcode: '7890008',
        basePrice: 32.0,
        category: 'Higiene',
      },

      // Brinquedos
      {
        name: 'Brinquedo Bola com Guizo',
        barcode: '7890009',
        basePrice: 15.9,
        category: 'Brinquedos',
      },
      {
        name: 'Kong Borracha Resistente - P',
        barcode: '7890010',
        basePrice: 42.0,
        category: 'Brinquedos',
      },
      {
        name: 'Corda Trançada - Rope Toy',
        barcode: '7890011',
        basePrice: 28.5,
        category: 'Brinquedos',
      },
      {
        name: 'Frisbee Pet - Plástico',
        barcode: '7890012',
        basePrice: 24.9,
        category: 'Brinquedos',
      },

      // Acessórios
      {
        name: 'Coleira Ajustável - Nylon',
        barcode: '7890013',
        basePrice: 35.0,
        category: 'Acessórios',
      },
      {
        name: 'Coleira Premium - Couro',
        barcode: '7890014',
        basePrice: 89.9,
        category: 'Acessórios',
      },
      {
        name: 'Guia de Passeio - 1.5m',
        barcode: '7890015',
        basePrice: 42.5,
        category: 'Acessórios',
      },
      {
        name: 'Peitoral Confortável - P',
        barcode: '7890016',
        basePrice: 58.0,
        category: 'Acessórios',
      },

      // Medicamentos
      {
        name: 'Vermifugo Broad Spectrum - 10ml',
        barcode: '7890017',
        basePrice: 35.8,
        category: 'Medicamentos',
      },
      {
        name: 'Antipulgas Simparic - 5mg',
        barcode: '7890018',
        basePrice: 125.9,
        category: 'Medicamentos',
      },
      {
        name: 'Protetor Articular - 60 comprimidos',
        barcode: '7890019',
        basePrice: 95.5,
        category: 'Medicamentos',
      },
      {
        name: 'Suplemento Ômega 3 - 60 cápsulas',
        barcode: '7890020',
        basePrice: 52.0,
        category: 'Medicamentos',
      },
    ];

    const products: any[] = [];
    for (const data of productData) {
      const product = await prisma.product.create({ data });
      products.push(product);
    }

    // 4. Estoque - Distribuir todos os produtos em todas as lojas
    console.log('📦 Criando estoque de produtos...');
    for (const product of products) {
      for (const store of stores) {
        await prisma.productStock.upsert({
          where: {
            productId_storeId: {
              productId: product.id,
              storeId: store.id,
            },
          },
          update: {
            quantity: Math.floor(Math.random() * 150) + 10,
          },
          create: {
            productId: product.id,
            storeId: store.id,
            quantity: Math.floor(Math.random() * 150) + 10,
          },
        });
      }
    }

    // Usuário de teste E2E
    await prisma.user.upsert({
      where: { email: 'test@qa.com' },
      update: {},
      create: {
        name: 'QA',
        email: 'test@qa.com',
        password: passwordHash,
        phone: '11999999999',
        role: 'OWNER',
        storeId: 'hobby_geisel',
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
        role: 'CLIENT',
        storeId: 'hobby_geisel',
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
