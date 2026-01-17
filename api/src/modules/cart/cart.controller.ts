import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { IsArray, IsNotEmpty, IsNumber, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AddItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class UpdateQuantityDto {
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class SyncCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddItemDto) // Reutilizando a estrutura de AddItemDto que já tem productId e quantity
  items: AddItemDto[];
}

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * GET /cart
   * Get user's cart
   */
  @Get()
  async getCart(@CurrentUser('id') userId: string) {
    return this.cartService.getCart(userId);
  }

  /**
   * POST /cart/add
   * Add single item to cart
   */
  @Post('add')
  async addItem(@CurrentUser('id') userId: string, @Body() dto: AddItemDto) {
    return this.cartService.addItem(userId, dto.productId, dto.quantity);
  }

  /**
   * POST /cart/sync
   * Sync cart items from client
   */
  @Post('sync')
  async syncCart(@CurrentUser('id') userId: string, @Body() dto: SyncCartDto) {
    return this.cartService.updateCart(userId, dto.items);
  }

  /**
   * POST /cart/validate
   * Validate stock and prices
   */
  @Post('validate')
  async validateCart(@CurrentUser('id') userId: string) {
    return this.cartService.validateStock(userId);
  }

  /**
   * DELETE /cart/:productId
   * Remove item from cart
   */
  @Delete(':productId')
  async removeItem(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeItem(userId, productId);
  }

  /**
   * DELETE /cart
   * Clear entire cart
   */
  @Delete()
  async clearCart(@CurrentUser('id') userId: string) {
    await this.cartService.clearCart(userId);
    return { message: 'Carrinho limpo com sucesso' };
  }
}
