import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductCardComponent],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  filteredProducts: Product[] = [];
  isLoading = true;
  
  // Expor Math para o template
  Math = Math;
  
  // Filtros
  selectedCategory: number | null = null;
  searchTerm = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  sortBy = 'name';
  
  // Paginação
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 0;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;

    // Carregar categorias
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Erro ao carregar categorias:', error);
      }
    });

    // Carregar produtos
    this.loadProducts();
  }

  private loadProducts(): void {
    const filters = {
      categoryId: this.selectedCategory || undefined,
      search: this.searchTerm || undefined,
      minPrice: this.minPrice || undefined,
      maxPrice: this.maxPrice || undefined,
      page: this.currentPage,
      limit: this.itemsPerPage
    };

    this.productService.getProducts(filters).subscribe({
      next: (products) => {
        this.products = products;
        this.applyFiltersAndSort();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.isLoading = false;
      }
    });
  }

  private applyFiltersAndSort(): void {
    let filtered = [...this.products];

    // Ordenação
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'price-low':
          return (a.salePrice || a.price) - (b.salePrice || b.price);
        case 'price-high':
          return (b.salePrice || b.price) - (a.salePrice || a.price);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    this.filteredProducts = filtered;
    this.calculatePagination();
  }

  private calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
  }

  onCategoryChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onPriceFilter(): void {
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  onSortChange(): void {
    this.applyFiltersAndSort();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    window.scrollTo(0, 0);
  }

  clearFilters(): void {
    this.selectedCategory = null;
    this.searchTerm = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.sortBy = 'name';
    this.currentPage = 1;
    this.loadProducts();
  }

  get paginatedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredProducts.slice(start, end);
  }

  get pageNumbers(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
}
