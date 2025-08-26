import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private apiUrl = 'http://localhost:3000/reviews';

  constructor(private http: HttpClient) {}

  // Buscar reviews por produto
  getReviewsByProduct(productId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/product/${productId}`);
  }

  // Reviews recentes
  getRecentReviews(limit: number = 5): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}?recent=true&limit=${limit}`);
  }

  // Criar review
  createReview(review: Partial<Review>): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, review);
  }

  // Buscar review por ID
  getReviewById(id: number): Observable<Review> {
    return this.http.get<Review>(`${this.apiUrl}/${id}`);
  }

  // Atualizar review
  updateReview(id: number, review: Partial<Review>): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/${id}`, review);
  }

  // Deletar review
  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
