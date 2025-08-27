import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  cpf?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient
  ) {
    // Verificar se existe token no localStorage apenas no browser
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = this.getToken();
      if (token) {
        // Aqui você poderia validar o token com o backend
        this.loadUserFromToken();
      }
    }
  }

  // Login
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials);
  }

  // Register
  register(userData: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, userData);
  }

  // Logout
  logout(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('hobbybichos_token');
      localStorage.removeItem('hobbybichos_user');
    }
    this.currentUserSubject.next(null);
  }

  // Verificar se o usuário está logado
  isLoggedIn(): boolean {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return false;
    }
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  // Obter token do localStorage
  getToken(): string | null {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem('hobbybichos_token');
  }

  // Salvar dados de login
  saveAuthData(response: LoginResponse): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('hobbybichos_token', response.access_token);
      localStorage.setItem('hobbybichos_user', JSON.stringify(response.user));
    }
    this.currentUserSubject.next(response.user);
  }

  // Obter usuário atual
  getCurrentUser(): any {
    return this.currentUserSubject.getValue();
  }

  // Verificar se o token está expirado (implementação básica)
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch (error) {
      return true;
    }
  }

  // Carregar usuário do token
  private loadUserFromToken(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const userStr = localStorage.getItem('hobbybichos_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          this.currentUserSubject.next(user);
        } catch (error) {
          console.error('Erro ao carregar usuário:', error);
          this.logout();
        }
      }
    }
  }

  // Verificar se o usuário é admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user && user.role === 'ADMIN';
  }

  // Verificar se o usuário é customer
  isCustomer(): boolean {
    const user = this.getCurrentUser();
    return user && user.role === 'CUSTOMER';
  }
}
