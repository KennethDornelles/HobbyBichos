export interface Review {
  id: number;
  rating: number;
  comment?: string;
  userId: number;
  productId: number;
  createdAt: Date;
  updatedAt: Date;
}
