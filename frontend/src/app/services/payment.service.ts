import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface PaymentItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
}

export interface Payer {
  name: string;
  surname: string;
  email: string;
  phone: {
    area_code: string;
    number: string;
  };
  identification?: {
    type: string;
    number: string;
  };
}

export interface CreateOrderDto {
  items: PaymentItem[];
  payer: Payer;
}

export interface PaymentPreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payment`;

  constructor(private http: HttpClient) {}

  /**
   * Criar preferência de pagamento no Mercado Pago
   */
  createPaymentPreference(orderData: CreateOrderDto): Observable<PaymentPreferenceResponse> {
    return this.http.post<PaymentPreferenceResponse>(`${this.apiUrl}/create-preference`, orderData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Verificar status de um pagamento
   */
  getPaymentStatus(paymentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/status/${paymentId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Processar pagamento do carrinho
   */
  processCartPayment(cartItems: any[], payerInfo: Payer): Observable<PaymentPreferenceResponse> {
    console.log('processCartPayment chamado com:', { cartItems, payerInfo });
    
    const items: PaymentItem[] = cartItems.map(item => ({
      id: item.id.toString(),
      title: item.nome,
      quantity: Number(item.quantidade),
      unit_price: Number(item.preco),
      currency_id: 'BRL'
    }));

    console.log('Items processados:', items);

    const orderData: CreateOrderDto = {
      items,
      payer: payerInfo
    };

    console.log('OrderData:', orderData);

    return this.createPaymentPreference(orderData);
  }

  /**
   * Redirecionar para página de pagamento do Mercado Pago
   */
  redirectToPayment(preferenceId: string, useSandbox: boolean = true): void {
    if (useSandbox) {
      // Em desenvolvimento, usar sandbox
      window.open(`https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`, '_blank');
    } else {
      // Em produção, usar URL real
      window.open(`https://mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`, '_blank');
    }
  }

  /**
   * Tratar erros da API
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Erro desconhecido';

    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do lado do servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Dados inválidos para pagamento';
          break;
        case 401:
          errorMessage = 'Não autorizado para realizar pagamento';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor de pagamento';
          break;
        case 503:
          errorMessage = 'Serviço de pagamento temporariamente indisponível';
          break;
        default:
          errorMessage = `Erro ${error.status}: ${error.message}`;
      }
    }

    console.error('Erro no serviço de pagamento:', error);
    return throwError(() => new Error(errorMessage));
  }
}
