import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() showAddToCart: boolean = true;

  constructor(private cartService: CartService) {}

  addToCart(): void {
    if (this.product && this.product.stock > 0) {
      this.cartService.addToCart(this.product, 1);
    }
  }

  get discountPercentage(): number | null {
    if (this.product.salePrice && this.product.salePrice < this.product.price) {
      return Math.round(((this.product.price - this.product.salePrice) / this.product.price) * 100);
    }
    return null;
  }

  get currentPrice(): number {
    return this.product.salePrice && this.product.salePrice < this.product.price 
      ? this.product.salePrice 
      : this.product.price;
  }

  get isOnSale(): boolean {
    return !!(this.product.salePrice && this.product.salePrice < this.product.price);
  }

  get isInStock(): boolean {
    return this.product.stock > 0;
  }

  get stockStatus(): string {
    if (this.product.stock === 0) {
      return 'Esgotado';
    } else if (this.product.stock <= 5) {
      return `Últimas ${this.product.stock} unidades`;
    }
    return 'Em estoque';
  }

  get primaryImage(): string {
    if (this.product.images && this.product.images.length > 0) {
      const primaryImg = this.product.images.find(img => img.isPrimary);
      return primaryImg?.url || this.product.images[0].url;
    }
    return '/assets/images/product-placeholder.jpg';
  }
}
