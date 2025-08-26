
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LogoComponent } from '../shared/logo/logo.component';
import { ProductCardComponent } from '../components/product-card/product-card.component';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { ReviewService } from '../services/review.service';
import { Product } from '../models/product.model';
import { Category } from '../models/category.model';
import { Review } from '../models/review.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    DatePipe, 
    RouterModule,
    LogoComponent, 
    ProductCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  categories: Category[] = [];
  recentReviews: Review[] = [];
  isLoading = true;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    this.loadHomeData();
  }

  private loadHomeData(): void {
    this.isLoading = true;

    // Carregar produtos em destaque
    this.productService.getFeaturedProducts().subscribe({
      next: (products) => {
        this.featuredProducts = products;
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Erro ao carregar produtos em destaque:', error);
        this.checkLoadingComplete();
      }
    });

    // Carregar categorias
    this.categoryService.getMainCategories().subscribe({
      next: (categories) => {
        this.categories = categories.slice(0, 8); // Limitar a 8 categorias na home
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Erro ao carregar categorias:', error);
        this.checkLoadingComplete();
      }
    });

    // Carregar reviews recentes
    this.reviewService.getRecentReviews(6).subscribe({
      next: (reviews) => {
        this.recentReviews = reviews;
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Erro ao carregar reviews:', error);
        this.checkLoadingComplete();
      }
    });
  }

  private checkLoadingComplete(): void {
    // Simular um pequeno delay para melhor UX
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }
}
