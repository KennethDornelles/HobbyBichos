import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private apiUrl = '/api/reviews';

  constructor(private http: HttpClient) {}

  getRecentReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}?recent=true`);
  }
}
