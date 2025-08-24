export interface Product {
  id: string;
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
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}
