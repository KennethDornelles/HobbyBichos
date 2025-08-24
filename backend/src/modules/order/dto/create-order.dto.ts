import { OrderStatus } from '@prisma/client';
export class CreateOrderDto {
  orderNumber!: string;
  status?: OrderStatus;
  subtotal!: number;
  shippingCost!: number;
  total!: number;
  paymentMethod!: string;
  notes?: string;
  userId!: string;
  addressId!: string;
}
