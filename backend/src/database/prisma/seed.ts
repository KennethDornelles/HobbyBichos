import { PrismaClient, Role, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Usuários
  

  const customer = await prisma.user.create({
    data: {
      email: 'cliente@hobbybichos.com',
      password: 'cliente123',
      name: 'Cliente',
      role: Role.CUSTOMER,
      isActive: true,
    },
  });

  // Endereço
  const address = await prisma.address.create({
    data: {
      street: 'Rua das Flores',
      number: '123',
      neighborhood: 'Centro',
      city: 'Cidade',
      state: 'RS',
      zipCode: '90000-000',
      isDefault: true,
      userId: customer.id,
    },
  });

  // Categoria
  const category = await prisma.category.create({
    data: {
      name: 'Brinquedos',
      description: 'Brinquedos para pets',
      isActive: true,
    },
  });

  // Produto
  const product = await prisma.product.create({
    data: {
      name: 'Bola de Borracha',
      description: 'Bola resistente para cães',
      price: 29.9,
      stock: 100,
      sku: 'BOLA-001',
      isActive: true,
      isFeatured: true,
      categoryId: category.id,
    },
  });

  // Imagem do Produto
  await prisma.productImage.create({
    data: {
      url: 'https://hobbybichos.com/images/bola.jpg',
      alt: 'Bola de Borracha',
      isMain: true,
      position: 1,
      productId: product.id,
    },
  });

  // Pedido
  const order = await prisma.order.create({
    data: {
      orderNumber: 'ORD-001',
      status: OrderStatus.PENDING,
      subtotal: 29.9,
      shippingCost: 10,
      total: 39.9,
      paymentMethod: 'Cartão',
      userId: customer.id,
      addressId: address.id,
    },
  });

  // Item do Pedido
  await prisma.orderItem.create({
    data: {
      quantity: 1,
      price: 29.9,
      total: 29.9,
      orderId: order.id,
      productId: product.id,
    },
  });

  // Review
  await prisma.review.create({
    data: {
      rating: 5,
      comment: 'Ótimo produto!',
      userId: customer.id,
      productId: product.id,
    },
  });
}

async function runSeed() {
  try {
    await main();
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void runSeed();
