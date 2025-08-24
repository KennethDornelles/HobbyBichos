import { OrderStatus } from '@prisma/client';
export class UpdateOrderDto {
  orderNumber?: string;
  status?: OrderStatus;
  subtotal?: number;
  shippingCost?: number;
  total?: number;
  paymentMethod?: string;
  notes?: string;
  addressId?: string;
}
