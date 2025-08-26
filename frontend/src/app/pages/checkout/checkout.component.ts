import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="checkout-page">
      <div class="container">
        <h1>Checkout</h1>
        <p>Página de checkout em desenvolvimento...</p>
      </div>
    </div>
  `,
  styles: [`
    .checkout-page {
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
export class CheckoutComponent {}
