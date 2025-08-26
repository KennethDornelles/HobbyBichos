import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { Cart, CartItem } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartSubject = new BehaviorSubject<Cart>({
    items: [],
    total: 0,
    itemCount: 0
  });

  public cart$ = this.cartSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Carregar carrinho do localStorage apenas no browser
    if (isPlatformBrowser(this.platformId)) {
      this.loadCartFromStorage();
    }
  }

  // Adicionar item ao carrinho
  addToCart(product: any, quantity: number = 1): void {
    const currentCart = this.cartSubject.value;
    const existingItemIndex = currentCart.items.findIndex(
      item => item.productId === product.id
    );

    if (existingItemIndex > -1) {
      // Item já existe, atualizar quantidade
      currentCart.items[existingItemIndex].quantity += quantity;
    } else {
      // Novo item
      const newItem: CartItem = {
        id: Date.now(), // ID temporário
        productId: product.id,
        product: {
          id: product.id,
          name: product.name,
          price: product.salePrice || product.price,
          imageUrl: product.images?.[0]?.url || product.imageUrl,
          stock: product.stock
        },
        quantity: quantity,
        price: product.salePrice || product.price
      };
      currentCart.items.push(newItem);
    }

    this.updateCart(currentCart);
  }

  // Remover item do carrinho
  removeFromCart(productId: number): void {
    const currentCart = this.cartSubject.value;
    currentCart.items = currentCart.items.filter(item => item.productId !== productId);
    this.updateCart(currentCart);
  }

  // Atualizar quantidade do item
  updateQuantity(productId: number, quantity: number): void {
    const currentCart = this.cartSubject.value;
    const item = currentCart.items.find(item => item.productId === productId);
    
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        this.updateCart(currentCart);
      }
    }
  }

  // Limpar carrinho
  clearCart(): void {
    const emptyCart: Cart = {
      items: [],
      total: 0,
      itemCount: 0
    };
    this.updateCart(emptyCart);
  }

  // Obter carrinho atual
  getCart(): Cart {
    return this.cartSubject.value;
  }

  // Calcular total do carrinho
  private calculateTotal(cart: Cart): Cart {
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    return cart;
  }

  // Atualizar carrinho
  private updateCart(cart: Cart): void {
    const updatedCart = this.calculateTotal(cart);
    this.cartSubject.next(updatedCart);
    this.saveCartToStorage(updatedCart);
  }

  // Salvar carrinho no localStorage
  private saveCartToStorage(cart: Cart): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('hobby_bichos_cart', JSON.stringify(cart));
    }
  }

  // Carregar carrinho do localStorage
  private loadCartFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedCart = localStorage.getItem('hobby_bichos_cart');
      if (savedCart) {
        try {
          const cart = JSON.parse(savedCart);
          this.cartSubject.next(this.calculateTotal(cart));
        } catch (error) {
          console.error('Erro ao carregar carrinho:', error);
        }
      }
    }
  }

  // Verificar se produto está no carrinho
  isInCart(productId: number): boolean {
    return this.cartSubject.value.items.some(item => item.productId === productId);
  }

  // Obter quantidade do produto no carrinho
  getProductQuantity(productId: number): number {
    const item = this.cartSubject.value.items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  }
}
