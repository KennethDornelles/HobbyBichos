export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: number;
  weight?: number;
  dimensions?: ProductDimensions;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  category?: {
    id: number;
    name: string;
  };
  images?: ProductImage[];
  reviews?: Review[];
  averageRating?: number;
  totalReviews?: number;
}

export interface ProductImage {
  id: number;
  productId: number;
  url: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  categoryId: number;
  isActive?: boolean;
  isFeatured?: boolean;
  weight?: number;
  dimensions?: ProductDimensions;
  images?: CreateProductImageRequest[];
}

export interface CreateProductImageRequest {
  url: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder?: number;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: number;
}

export interface ProductFilters {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  search?: string;
}

export interface ProductSearchResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Para compatibilidade com outros arquivos, vou re-exportar Review aqui
export interface Review {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  title: string;
  content: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}