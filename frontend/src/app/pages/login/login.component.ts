import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="login-page">
      <div class="container">
        <h1>Login</h1>
        <p>Página de login em desenvolvimento...</p>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
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
export class LoginComponent {}
