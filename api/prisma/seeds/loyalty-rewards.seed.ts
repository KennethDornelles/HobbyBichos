import { Prisma, PrismaClient, RewardType } from '@prisma/client';

async function seedLoyaltyRewards(prisma: PrismaClient) {
  const rewards = [
    {
      name: 'Desconto 5%',
      description: 'Desconto de 5% em sua próxima compra',
      pointsCost: 500,
      rewardType: RewardType.DISCOUNT_PERCENT,
      value: new Prisma.Decimal('5.00'),
      imageUrl: null,
      stockLimit: null,
      validUntil: null,
    },
    {
      name: 'Desconto 10%',
      description: 'Desconto de 10% em sua próxima compra',
      pointsCost: 1000,
      rewardType: RewardType.DISCOUNT_PERCENT,
      value: new Prisma.Decimal('10.00'),
      imageUrl: null,
      stockLimit: null,
      validUntil: null,
    },
    {
      name: 'Desconto 15%',
      description: 'Desconto de 15% em sua próxima compra',
      pointsCost: 1500,
      rewardType: RewardType.DISCOUNT_PERCENT,
      value: new Prisma.Decimal('15.00'),
      imageUrl: null,
      stockLimit: null,
      validUntil: null,
    },
    {
      name: 'Frete Grátis',
      description: 'Frete grátis em sua próxima compra',
      pointsCost: 300,
      rewardType: RewardType.FREE_SHIPPING,
      value: new Prisma.Decimal('0.00'),
      imageUrl: null,
      stockLimit: null,
      validUntil: null,
    },
    {
      name: 'Banho Grátis',
      description: 'Um banho completo gratuito para seu pet',
      pointsCost: 800,
      rewardType: RewardType.FREE_SERVICE,
      value: new Prisma.Decimal('0.00'),
      imageUrl: null,
      stockLimit: null,
      validUntil: null,
    },
    {
      name: 'Produto Grátis',
      description: 'Escolha um produto para levar grátis',
      pointsCost: 2000,
      rewardType: RewardType.FREE_PRODUCT,
      value: new Prisma.Decimal('0.00'),
      imageUrl: null,
      stockLimit: 50,
      validUntil: null,
    },
  ];

  console.log('Seeding loyalty rewards...');

  for (const reward of rewards) {
    const existing = await prisma.loyaltyReward.findFirst({
      where: { name: reward.name },
    });

    if (!existing) {
      await prisma.loyaltyReward.create({
        data: {
          ...reward,
          isActive: true,
          usedCount: 0,
        },
      });
    }
  }

  console.log(`✅ Seeded ${rewards.length} loyalty rewards`);
}

export { seedLoyaltyRewards };
