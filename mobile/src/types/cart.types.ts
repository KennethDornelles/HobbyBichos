export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  maxStock: number;
  sku: string;
}

export interface CartState {
  items: CartItem[];
  updatedAt?: string;
}

export interface CartResponse {
  userId: string;
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  updatedAt: string;
}

export interface ValidationResult {
  valid: boolean;
  items: CartItem[];
  issues: string[];
  unavailableItems: string[];
  priceChanges: Array<{ productId: string; oldPrice: number; newPrice: number }>;
  stockIssues: Array<{ productId: string; requested: number; available: number }>;
}