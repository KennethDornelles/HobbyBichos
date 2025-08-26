export interface Order {
  id: number;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: string;
  notes?: string;
  userId: number;
  addressId: number;
  createdAt: Date;
  updatedAt: Date;
}
