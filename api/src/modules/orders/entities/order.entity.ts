// Definição de type/interface para Order, pois o modelo está no schema.prisma
import { OrderItem } from './order-item.entity';

export interface OrderEntity {
  id: string;
  storeId: string;
  userId: string;
  total: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
}
