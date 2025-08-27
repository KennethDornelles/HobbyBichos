import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient) {}

  // Listar produtos com filtros opcionais
  getProducts(filters?: {
    categoryId?: number;
    featured?: boolean;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }): Observable<Product[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.categoryId) params = params.set('categoryId', filters.categoryId.toString());
      if (filters.featured) params = params.set('featured', filters.featured.toString());
      if (filters.search) params = params.set('search', filters.search);
      if (filters.minPrice) params = params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params = params.set('maxPrice', filters.maxPrice.toString());
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }
    
    return this.http.get<Product[]>(this.apiUrl, { params });
  }

  // Produtos em destaque
  getFeaturedProducts(): Observable<Product[]> {
    return this.getProducts({ featured: true, limit: 8 });
  }

  // Buscar produto por ID
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  // Produtos por categoria
  getProductsByCategory(categoryId: number): Observable<Product[]> {
    return this.getProducts({ categoryId });
  }

  // Buscar produtos
  searchProducts(searchTerm: string): Observable<Product[]> {
    return this.getProducts({ search: searchTerm });
  }

  // Produtos relacionados
  getRelatedProducts(productId: number, categoryId: number): Observable<Product[]> {
    return this.getProducts({ categoryId, limit: 4 });
  }
}
