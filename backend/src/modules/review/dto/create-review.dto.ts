export class CreateReviewDto {
  rating!: number;
  comment?: string;
  userId!: string;
  productId!: string;
}
