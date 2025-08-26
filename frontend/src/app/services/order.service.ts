import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/user.model';
import { CheckoutData } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = 'http://localhost:3000/orders';

  constructor(private http: HttpClient) {}

  // Criar pedido
  createOrder(orderData: CheckoutData): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, orderData);
  }

  // Buscar pedidos do usuário
  getUserOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/user`);
  }

  // Buscar pedido por ID
  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  // Acompanhar status do pedido
  getOrderStatus(id: number): Observable<{ status: string; updatedAt: Date }> {
    return this.http.get<{ status: string; updatedAt: Date }>(`${this.apiUrl}/${id}/status`);
  }

  // Cancelar pedido
  cancelOrder(id: number): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/cancel`, {});
  }

  // Admin: Listar todos os pedidos
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  // Admin: Atualizar status do pedido
  updateOrderStatus(id: number, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, { status });
  }
}
