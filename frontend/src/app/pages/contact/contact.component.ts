import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="contact-page">
      <div class="container">
        <h1>Contato</h1>
        <p>Página de contato em desenvolvimento...</p>
      </div>
    </div>
  `,
  styles: [`
    .contact-page {
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
export class ContactComponent {}
