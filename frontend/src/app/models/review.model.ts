export interface Review {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  title: string;
  content: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  user?: {
    id: number;
    name: string;
    email: string;
  };
  product?: {
    id: number;
    name: string;
  };
}

export interface CreateReviewRequest {
  productId: number;
  rating: number;
  title: string;
  content: string;
}

export interface UpdateReviewRequest extends Partial<CreateReviewRequest> {
  id: number;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}