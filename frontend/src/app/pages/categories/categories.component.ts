import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Todas as Categorias</h1>
      <p>Página de categorias em desenvolvimento...</p>
    </div>
  `
})
export class CategoriesComponent {
}
