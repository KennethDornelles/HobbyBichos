import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  role?: 'ADMIN' | 'CUSTOMER';
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  isActive?: boolean;
  role?: 'ADMIN' | 'CUSTOMER';
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  getAllUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: 'ADMIN' | 'CUSTOMER';
    isActive?: boolean;
  }): Observable<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.role) httpParams = httpParams.set('role', params.role);
      if (params.isActive !== undefined) httpParams = httpParams.set('isActive', params.isActive.toString());
    }

    return this.http.get<{
      users: User[];
      total: number;
      page: number;
      totalPages: number;
    }>(this.apiUrl, { params: httpParams });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }

  createUser(userData: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData);
  }

  updateUser(id: number, userData: UpdateUserRequest): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, userData);
  }

  updateProfile(userData: UpdateProfileRequest): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/profile`, userData);
  }

  changePassword(passwordData: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/change-password`, passwordData);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  deactivateUser(id: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  activateUser(id: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/activate`, {});
  }

  // Verificar se email já existe
  checkEmailExists(email: string, excludeUserId?: number): Observable<{ exists: boolean }> {
    let params = new HttpParams().set('email', email);
    if (excludeUserId) {
      params = params.set('excludeUserId', excludeUserId.toString());
    }
    
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/check-email`, { params });
  }

  // Obter estatísticas do usuário (para admin)
  getUserStats(): Observable<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    adminUsers: number;
    customerUsers: number;
    recentRegistrations: number;
  }> {
    return this.http.get<{
      totalUsers: number;
      activeUsers: number;
      inactiveUsers: number;
      adminUsers: number;
      customerUsers: number;
      recentRegistrations: number;
    }>(`${this.apiUrl}/stats`);
  }

  // Upload de avatar (se necessário no futuro)
  uploadAvatar(file: File): Observable<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.http.post<{ avatarUrl: string }>(`${this.apiUrl}/avatar`, formData);
  }
}