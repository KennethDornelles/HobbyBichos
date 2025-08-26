import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Category } from '../../models/category.model';
import { Cart } from '../../models/cart.model';
import { LogoComponent } from '../../shared/logo/logo.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LogoComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  categories: Category[] = [];
  cart: Cart = { items: [], total: 0, itemCount: 0 };
  searchTerm: string = '';
  isMenuOpen = false;
  isUserMenuOpen = false;
  currentUser: any = null;

  constructor(
    private categoryService: CategoryService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Carregar categorias principais
    this.categoryService.getMainCategories().subscribe(
      categories => this.categories = categories
    );

    // Observar mudanças no carrinho
    this.cartService.cart$.subscribe(
      cart => this.cart = cart
    );

    // Observar usuário logado
    this.authService.currentUser$.subscribe(
      user => this.currentUser = user
    );
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      // Implementar navegação para página de busca
      console.log('Buscar por:', this.searchTerm);
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.isUserMenuOpen = false;
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
