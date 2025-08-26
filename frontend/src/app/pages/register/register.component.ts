import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="register-page">
      <div class="container">
        <h1>Cadastrar</h1>
        <p>Página de cadastro em desenvolvimento...</p>
      </div>
    </div>
  `,
  styles: [`
    .register-page {
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
export class RegisterComponent {}
