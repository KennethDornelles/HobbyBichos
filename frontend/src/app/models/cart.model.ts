export interface CartItem {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  salePrice?: number;
  imageUrl?: string;
  stock: number;
}

export interface CheckoutData {
  userId: number;
  addressId: number;
  items: Array<{
    productId: number;
    quantity: number;
    price: number;
  }>;
  total: number;
}
