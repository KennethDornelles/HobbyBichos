import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
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
    role: 'ADMIN' | 'CUSTOMER';
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  cpf?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Verificar se existe token no localStorage apenas no browser
    if (isPlatformBrowser(this.platformId)) {
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

  // Registro
  register(userData: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // Logout
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('current_user');
    }
    this.currentUserSubject.next(null);
  }

  // Verificar se está logado
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Obter token
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  // Salvar token e usuário
  saveAuthData(authData: LoginResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('access_token', authData.access_token);
      localStorage.setItem('current_user', JSON.stringify(authData.user));
    }
    this.currentUserSubject.next(authData.user);
  }

  // Obter usuário atual
  getCurrentUser(): any {
    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem('current_user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  // Carregar usuário do token
  private loadUserFromToken(): void {
    const user = this.getCurrentUser();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  // Verificar se é admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  // Refresh token (se necessário)
  refreshToken(): Observable<any> {
    return this.http.post(`${this.apiUrl}/refresh`, {});
  }
}
