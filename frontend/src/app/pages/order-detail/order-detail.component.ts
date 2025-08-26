import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="order-detail-page">
      <div class="container">
        <h1>Detalhes do Pedido</h1>
        <p>Página de detalhes do pedido em desenvolvimento...</p>
      </div>
    </div>
  `,
  styles: [`
    .order-detail-page {
      padding: 2rem 0;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    
    h1 {
      color: var(--text-dark);
      margin-bottom: 1rem;
    }
  `]
})
export class OrderDetailComponent {}
