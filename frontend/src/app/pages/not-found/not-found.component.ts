import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="not-found-page min-h-screen bg-gray-50 flex items-center justify-center">
      <div class="text-center px-4">
        <div class="mb-8">
          <h1 class="text-9xl font-bold text-primary-yellow mb-4">404</h1>
          <h2 class="text-2xl font-semibold text-gray-800 mb-2">Página não encontrada</h2>
          <p class="text-gray-600 max-w-md mx-auto">
            Oops! A página que você está procurando não existe ou foi removida.
          </p>
        </div>
        
        <div class="space-y-4">
          <a 
            routerLink="/" 
            class="inline-block bg-primary-yellow text-white font-semibold py-3 px-6 rounded-lg hover:bg-yellow-500 transition-colors"
          >
            Voltar para Home
          </a>
          <br>
          <a 
            routerLink="/products" 
            class="inline-block text-gray-600 hover:text-primary-yellow underline"
          >
            Ver todos os produtos
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-page {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }
  `]
})
export class NotFoundComponent {}
