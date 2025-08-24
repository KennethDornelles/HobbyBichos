export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: string;
  notes?: string;
  userId: string;
  addressId: string;
  createdAt: Date;
  updatedAt: Date;
}
