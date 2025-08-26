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
  category?: Category;
  images: ProductImage[];
  reviews: Review[];
  orderItems?: OrderItem[];
}

export interface ProductImage {
  id: number;
  url: string;
  altText?: string;
  isPrimary: boolean;
  productId: number;
}

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
  addresses?: Address[];
  orders?: Order[];
  reviews?: Review[];
}

export interface Address {
  id: number;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
  userId: number;
  user?: User;
  orders?: Order[];
}

export interface Order {
  id: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  addressId: number;
  user?: User;
  address?: Address;
  orderItems: OrderItem[];
}

export interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  orderId: number;
  productId: number;
  order?: Order;
  product?: Product;
}
