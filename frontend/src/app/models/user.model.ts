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

export interface Product {
  id: number;
  name: string;
  price: number;
  salePrice?: number;
  imageUrl?: string;
}

export interface Review {
  id: number;
  rating: number;
  comment?: string;
  createdAt: Date;
  productId: number;
}
