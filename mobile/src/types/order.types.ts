export interface OrderItem {
  productId: string;
  serviceId: string | null;
  quantity: number;
  price: number;
}

export interface PaymentAction {
  whatsappLink: string;
  pixKey?: string;
  orderTotal: number;
}

export interface Order {
  id: string;
  storeId: string;
  userId: string;
  status: 'WAITING_PAYMENT' | 'PAID' | 'PROCESSING' | 'DELIVERED' | 'CANCELLED';
  total: number;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  paymentAction?: PaymentAction;
}

export interface CreateOrderRequest {
  storeId: string;
  items: OrderItem[];
}

export interface CreateOrderResponse {
  order: Order;
  paymentAction: PaymentAction;
}

export interface OrderDetailsResponse {
  id: string;
  storeId: string;
  userId: string;
  status: 'WAITING_PAYMENT' | 'PAID' | 'PROCESSING' | 'DELIVERED' | 'CANCELLED';
  total: number;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    productId: string;
    serviceId: string | null;
    quantity: number;
    price: number;
  }>;
  paymentAction?: PaymentAction;
}

export interface OrderListItem {
  id: string;
  status: 'WAITING_PAYMENT' | 'PAID' | 'PROCESSING' | 'DELIVERED' | 'CANCELLED';
  total: number;
  createdAt: string;
}

export interface OrderListResponse {
  orders: OrderListItem[];
  total: number;
  page: number;
  limit: number;
}
