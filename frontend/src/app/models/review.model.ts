export interface Review {
  id: number;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  productId: number;
  user?: User;
  product?: Product;
}

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  cpf?: string;
  role: 'ADMIN' | 'CUSTOMER';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  categoryId: number;
}
