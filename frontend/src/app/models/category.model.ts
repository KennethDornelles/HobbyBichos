export interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  products?: Product[];
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  stock: number;
  sku: string;
  weight?: number;
  dimensions?: string;
  brand?: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  categoryId: number;
}
