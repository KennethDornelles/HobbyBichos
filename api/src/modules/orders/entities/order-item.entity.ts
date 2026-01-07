// Definição de type/interface para OrderItem, pois o modelo está no schema.prisma
export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string;
  serviceId?: string;
  quantity: number;
  price: number;
}
