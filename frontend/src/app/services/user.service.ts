import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, Address } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:3000/users';
  private addressUrl = 'http://localhost:3000/address';

  constructor(private http: HttpClient) {}

  // Perfil do usuário
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }

  // Atualizar perfil
  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/profile`, userData);
  }

  // Endereços do usuário
  getUserAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.addressUrl}/user`);
  }

  // Criar endereço
  createAddress(address: Partial<Address>): Observable<Address> {
    return this.http.post<Address>(this.addressUrl, address);
  }

  // Atualizar endereço
  updateAddress(id: number, address: Partial<Address>): Observable<Address> {
    return this.http.patch<Address>(`${this.addressUrl}/${id}`, address);
  }

  // Deletar endereço
  deleteAddress(id: number): Observable<void> {
    return this.http.delete<void>(`${this.addressUrl}/${id}`);
  }

  // Definir endereço padrão
  setDefaultAddress(id: number): Observable<Address> {
    return this.http.patch<Address>(`${this.addressUrl}/${id}/default`, {});
  }

  // Pedidos do usuário
  getUserOrders(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:3000/orders/user`);
  }
}
