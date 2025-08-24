export class CreateOrderItemDto {
  quantity!: number;
  price!: number;
  total!: number;
  orderId!: string;
  productId!: string;
}
