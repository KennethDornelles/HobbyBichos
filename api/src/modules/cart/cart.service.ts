/* eslint-disable */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma, Cart, CartItem, Product, ProductStock } from '@prisma/client';

type CartWithItems = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: {
          include: { stocks: true };
        };
      };
    };
  };
}>;
type ProductWithStocks = Prisma.ProductGetPayload<{
  include: {
    stocks: true;
  };
}>;

export interface CartItemResponse {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  maxStock: number;
  sku: string;
}

export interface CartResponse {
  userId: string;
  items: CartItemResponse[];
  subtotal: number;
  totalItems: number;
  updatedAt: string;
}

export interface ValidationResult {
  valid: boolean;
  items: CartItemResponse[];
  issues: string[];
  unavailableItems: string[];
  priceChanges: Array<{
    productId: string;
    oldPrice: number;
    newPrice: number;
  }>;
  stockIssues: Array<{
    productId: string;
    requested: number;
    available: number;
  }>;
}

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get user's cart with items and product details
   */
  async getCart(userId: string): Promise<CartResponse> {
    // Find or create cart
    let cart: CartWithItems | null = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                stocks: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId,
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  stocks: true,
                },
              },
            },
          },
        },
      });
    }

    // Filter out inactive products and calculate stock
    const activeItems = cart.items.filter((item) => item.product.isActive);

    const items: CartItemResponse[] = activeItems.map((item) => {
      const totalStock = item.product.stocks.reduce(
        (sum, stock) => sum + stock.quantity,
        0,
      );

      return {
        id: item.id,
        productId: item.productId,
        name: item.product.name,
        price: parseFloat(item.product.basePrice.toString()),
        quantity: item.quantity,
        image: item.product.images.length > 0 ? item.product.images[0] : null,
        maxStock: totalStock,
        sku: item.product.sku || item.product.barcode || '',
      };
    });

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      userId,
      items,
      subtotal,
      totalItems,
      updatedAt: cart.updatedAt.toISOString(),
    };
  }

  /**
   * Add item to cart
   */
  async addItem(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<CartResponse> {
    // Validate product
    const product: ProductWithStocks | null =
      await this.prisma.product.findUnique({
        where: { id: productId },
        include: { stocks: true },
      });

    if (!product || !product.isActive) {
      throw new NotFoundException('Produto não encontrado ou inativo');
    }

    const totalStock = product.stocks.reduce(
      (sum, stock) => sum + stock.quantity,
      0,
    );

    if (quantity > totalStock) {
      throw new BadRequestException(
        `Estoque insuficiente. Disponível: ${totalStock}`,
      );
    }

    // Find or create cart
    let cart: Cart | null = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    // Check if item already exists
    const existingItem: CartItem | null = await this.prisma.cartItem.findUnique(
      {
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId,
          },
        },
      },
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > totalStock) {
        throw new BadRequestException(
          `Estoque insuficiente. Disponível: ${totalStock}`,
        );
      }

      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    // Update cart timestamp
    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    });

    return this.getCart(userId);
  }

  /**
   * Update item quantity
   */
  async updateItemQuantity(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<CartResponse> {
    if (quantity <= 0) {
      return this.removeItem(userId, productId);
    }

    const cart: Cart | null = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Carrinho não encontrado');
    }

    // Validate stock
    const product: ProductWithStocks | null =
      await this.prisma.product.findUnique({
        where: { id: productId },
        include: { stocks: true },
      });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    const totalStock = product.stocks.reduce(
      (sum, stock) => sum + stock.quantity,
      0,
    );

    if (quantity > totalStock) {
      throw new BadRequestException(
        `Estoque insuficiente. Disponível: ${totalStock}`,
      );
    }

    await this.prisma.cartItem.update({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      data: { quantity },
    });

    // Update cart timestamp
    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    });

    return this.getCart(userId);
  }

  /**
   * Remove item from cart
   */
  async removeItem(userId: string, productId: string): Promise<CartResponse> {
    const cart: Cart | null = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Carrinho não encontrado');
    }

    await this.prisma.cartItem.delete({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    // Update cart timestamp
    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    });

    return this.getCart(userId);
  }

  /**
   * Clear entire cart
   */
  async clearCart(userId: string): Promise<void> {
    const cart: Cart | null = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (cart) {
      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      await this.prisma.cart.update({
        where: { id: cart.id },
        data: { updatedAt: new Date() },
      });
    }
  }

  /**
   * Sync cart items from client
   */
  async updateCart(
    userId: string,
    items: Array<{ productId: string; quantity: number }>,
  ): Promise<CartResponse> {
    // Find or create cart
    let cart: Cart | null = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    // Clear existing items
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // Validate and add new items
    for (const item of items) {
      const product: ProductWithStocks | null =
        await this.prisma.product.findUnique({
          where: { id: item.productId },
          include: { stocks: true },
        });

      // Skip inactive or unavailable products
      if (!product || !product.isActive) {
        continue;
      }

      const totalStock = product.stocks.reduce(
        (sum, stock) => sum + stock.quantity,
        0,
      );

      // Adjust quantity if exceeds stock
      const quantity = Math.min(item.quantity, totalStock);

      if (quantity > 0) {
        await this.prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: item.productId,
            quantity,
          },
        });
      }
    }

    // Update cart timestamp
    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    });

    return this.getCart(userId);
  }

  /**
   * Validate stock and prices
   */
  async validateStock(userId: string): Promise<ValidationResult> {
    const cart: CartWithItems | null = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                stocks: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return {
        valid: true,
        items: [],
        issues: [],
        unavailableItems: [],
        priceChanges: [],
        stockIssues: [],
      };
    }

    const issues: string[] = [];
    const unavailableItems: string[] = [];
    const priceChanges: Array<{
      productId: string;
      oldPrice: number;
      newPrice: number;
    }> = [];
    const stockIssues: Array<{
      productId: string;
      requested: number;
      available: number;
    }> = [];
    const validItems: CartItemResponse[] = [];

    for (const item of cart.items) {
      const product = item.product;

      // Check if product is active
      if (!product.isActive) {
        unavailableItems.push(product.name);
        issues.push(`${product.name} não está mais disponível`);
        continue;
      }

      const totalStock = product.stocks.reduce(
        (sum, stock) => sum + stock.quantity,
        0,
      );

      // Check stock availability
      if (totalStock === 0) {
        unavailableItems.push(product.name);
        issues.push(`${product.name} está fora de estoque`);
        continue;
      }

      // Check if requested quantity exceeds stock
      if (item.quantity > totalStock) {
        stockIssues.push({
          productId: product.id,
          requested: item.quantity,
          available: totalStock,
        });
        issues.push(
          `${product.name}: apenas ${totalStock} disponível(is), você tem ${item.quantity} no carrinho`,
        );
      }

      // Add to valid items
      validItems.push({
        id: item.id,
        productId: product.id,
        name: product.name,
        price: parseFloat(product.basePrice.toString()),
        quantity: item.quantity,
        image: product.images.length > 0 ? product.images[0] : null,
        maxStock: totalStock,
        sku: product.sku || product.barcode || '',
      });
    }

    const valid = issues.length === 0;

    return {
      valid,
      items: validItems,
      issues,
      unavailableItems,
      priceChanges,
      stockIssues,
    };
  }

  /**
   * Reserve stock for checkout
   */
  async reserveStock(userId: string): Promise<void> {
    const validation: ValidationResult = await this.validateStock(userId);

    if (!validation.valid) {
      throw new BadRequestException({
        message: 'Carrinho contém itens inválidos',
        issues: validation.issues,
      });
    }

    const cart: (Cart & { items: CartItem[] }) | null =
      await this.prisma.cart.findUnique({
        where: { userId },
        include: { items: true },
      });

    if (!cart) {
      throw new NotFoundException('Carrinho não encontrado');
    }

    // Reserve stock by decrementing quantities
    for (const item of cart.items) {
      const product: (Product & { stocks: ProductStock[] }) | null =
        await this.prisma.product.findUnique({
          where: { id: item.productId },
          include: { stocks: true },
        });

      if (!product) continue;

      let remaining = item.quantity;

      for (const stock of product.stocks) {
        if (remaining <= 0) break;

        const toDeduct = Math.min(stock.quantity, remaining);

        await this.prisma.productStock.update({
          where: { id: stock.id },
          data: {
            quantity: stock.quantity - toDeduct,
          },
        });

        remaining -= toDeduct;
      }
    }
  }
}
