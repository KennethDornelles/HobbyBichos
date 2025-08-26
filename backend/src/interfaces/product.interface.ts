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
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
}
