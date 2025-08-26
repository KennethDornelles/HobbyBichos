
import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { LogoComponent } from '../shared/logo/logo.component';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { ReviewService } from '../services/review.service';
import { Product } from '../models/product.model';
import { Category } from '../models/category.model';
import { Review } from '../models/review.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, DecimalPipe, DatePipe, LogoComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [ProductService, CategoryService, ReviewService]
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  reviews: Review[] = [];


  constructor(
    public productService: ProductService,
    public categoryService: CategoryService,
    public reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    this.productService.getFeaturedProducts().subscribe((p: Product[]) => this.products = p);
    this.categoryService.getCategories().subscribe((c: Category[]) => this.categories = c);
    this.reviewService.getRecentReviews().subscribe((r: Review[]) => this.reviews = r);
  }
}
