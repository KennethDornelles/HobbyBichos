import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrinho.component.html',
  styleUrls: ['./carrinho.component.scss']
})
export class CarrinhoComponent {
  
  itensCarrinho = [
    {
      id: 1,
      nome: 'Ração Premium Bobby',
      descricao: 'Ração para cães adultos - 15kg',
      preco: 89.90,
      quantidade: 2,
      imagem: '🥘'
    },
    {
      id: 2,
      nome: 'Brinquedo Corda Luna',
      descricao: 'Brinquedo interativo para gatos',
      preco: 25.90,
      quantidade: 1,
      imagem: '🧸'
    }
  ];

  get totalCarrinho(): number {
    return this.itensCarrinho.reduce((total, item) => 
      total + (item.preco * item.quantidade), 0
    );
  }

  aumentarQuantidade(itemId: number) {
    const item = this.itensCarrinho.find(i => i.id === itemId);
    if (item) {
      item.quantidade++;
    }
  }

  diminuirQuantidade(itemId: number) {
    const item = this.itensCarrinho.find(i => i.id === itemId);
    if (item && item.quantidade > 1) {
      item.quantidade--;
    }
  }

  removerItem(itemId: number) {
    this.itensCarrinho = this.itensCarrinho.filter(item => item.id !== itemId);
  }

  finalizarCompra() {
    alert('Redirecionando para o pagamento...');
  }
}
