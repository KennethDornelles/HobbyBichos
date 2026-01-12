import { Prisma, PrismaClient, Service } from '@prisma/client';

export async function seedServices(prisma: PrismaClient, storeIds: string[]) {
  console.log('🐾 Criando serviços para as lojas...');

  const serviceTemplates = [
    {
      name: 'Banho',
      price: new Prisma.Decimal('45.00'),
      durationMin: 60,
    },
    {
      name: 'Tosa',
      price: new Prisma.Decimal('65.00'),
      durationMin: 90,
    },
    {
      name: 'Banho e Tosa',
      price: new Prisma.Decimal('95.00'),
      durationMin: 120,
    },
    {
      name: 'Consulta Veterinária',
      price: new Prisma.Decimal('120.00'),
      durationMin: 45,
    },
    {
      name: 'Vacinação',
      price: new Prisma.Decimal('80.00'),
      durationMin: 30,
    },
    {
      name: 'Banho para Porte Grande',
      price: new Prisma.Decimal('65.00'),
      durationMin: 90,
    },
    {
      name: 'Tosa Higiênica',
      price: new Prisma.Decimal('40.00'),
      durationMin: 45,
    },
    {
      name: 'Hidratação',
      price: new Prisma.Decimal('55.00'),
      durationMin: 60,
    },
  ];

  const services: Service[] = [];

  // Cria os serviços para cada loja
  for (const storeId of storeIds) {
    for (const template of serviceTemplates) {
      const service = await prisma.service.create({
        data: {
          storeId,
          name: template.name,
          price: template.price,
          durationMin: template.durationMin,
          isActive: true,
        },
      });
      services.push(service);
    }
  }

  console.log(
    `✅ ${services.length} serviços criados para ${storeIds.length} lojas`,
  );
  return services;
}
