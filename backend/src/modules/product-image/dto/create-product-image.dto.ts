export class CreateProductImageDto {
  url!: string;
  alt!: string;
  isMain?: boolean;
  position?: number;
  productId!: string;
}
