import { Component, inject, HostListener, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService, Payer } from '../services/payment.service';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carrinho.component.html',
  styleUrls: ['./carrinho.component.scss']
})
export class CarrinhoComponent {

  private paymentService = inject(PaymentService);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  // Estado do loading para cada item individualmente
  loadingItems = new Set<number>();

  // Dados do comprador com validação
  compradorInfo: Payer = {
    name: '',
    surname: '',
    email: '',
    phone: {
      area_code: '',
      number: ''
    }
  };

  // Estado do checkout
  showCheckoutForm = false;
  isProcessing = false;
  errorMessage = '';
  successMessage = '';

  // Estado para controle de validação
  formSubmitted = false;

  // Cupom de desconto
  cupomCodigo = '';
  cupomAplicado: { codigo: string; desconto: number; tipo: 'percentual' | 'fixo' } | null = null;
  cupomError = '';

  itensCarrinho = [
    {
      id: 1,
      nome: 'Ração Premium Bobby',
      descricao: 'Ração para cães adultos - 15kg',
      preco: 89.90,
      quantidade: 2,
      imagem: '🥘',
      estoque: 10
    },
    {
      id: 2,
      nome: 'Brinquedo Corda Luna',
      descricao: 'Brinquedo interativo para gatos',
      preco: 25.90,
      quantidade: 1,
      imagem: '🧸',
      estoque: 5
    }
  ];

  get totalCarrinho(): number {
    return this.itensCarrinho.reduce((total, item) =>
      total + (item.preco * item.quantidade), 0
    );
  }

  get totalDesconto(): number {
    if (!this.cupomAplicado) return 0;

    if (this.cupomAplicado.tipo === 'percentual') {
      return this.totalCarrinho * (this.cupomAplicado.desconto / 100);
    }
    return this.cupomAplicado.desconto;
  }

  get totalFinal(): number {
    return Math.max(0, this.totalCarrinho - this.totalDesconto);
  }

  // Aumentar quantidade com validação de estoque
  aumentarQuantidade(itemId: number) {
    this.loadingItems.add(itemId);

    // Simula uma pequena latência para feedback visual
    setTimeout(() => {
      const item = this.itensCarrinho.find(i => i.id === itemId);
      if (item && item.quantidade < item.estoque) {
        item.quantidade++;
        this.clearMessages();
      } else if (item) {
        this.showTempMessage('Quantidade máxima em estoque atingida!', 'error');
      }
      this.loadingItems.delete(itemId);
    }, 200);
  }

  // Diminuir quantidade com validação
  diminuirQuantidade(itemId: number) {
    this.loadingItems.add(itemId);

    setTimeout(() => {
      const item = this.itensCarrinho.find(i => i.id === itemId);
      if (item && item.quantidade > 1) {
        item.quantidade--;
        this.clearMessages();
      }
      this.loadingItems.delete(itemId);
    }, 200);
  }

  // Remover item com confirmação
  removerItem(itemId: number) {
    const item = this.itensCarrinho.find(i => i.id === itemId);
    if (item && confirm(`Deseja realmente remover "${item.nome}" do carrinho?`)) {
      this.itensCarrinho = this.itensCarrinho.filter(item => item.id !== itemId);
      this.showTempMessage('Item removido do carrinho', 'success');
    }
  }

  // Aplicar cupom de desconto
  aplicarCupom() {
    if (!this.cupomCodigo.trim()) {
      this.cupomError = 'Digite um código de cupom';
      return;
    }

    // Simula validação de cupom (substitua pela lógica real)
    const cuponsMock = {
      'DESCONTO10': { desconto: 10, tipo: 'percentual' as const },
      'FRETE20': { desconto: 20, tipo: 'fixo' as const },
      'PRIMEIRA15': { desconto: 15, tipo: 'percentual' as const }
    };

    const cupom = cuponsMock[this.cupomCodigo.toUpperCase() as keyof typeof cuponsMock];

    if (cupom) {
      this.cupomAplicado = {
        codigo: this.cupomCodigo.toUpperCase(),
        ...cupom
      };
      this.cupomError = '';
      this.showTempMessage('Cupom aplicado com sucesso!', 'success');
    } else {
      this.cupomError = 'Cupom inválido ou expirado';
    }
  }

  // Remover cupom aplicado
  removerCupom() {
    this.cupomAplicado = null;
    this.cupomCodigo = '';
    this.cupomError = '';
    this.showTempMessage('Cupom removido', 'info');
  }

  // Iniciar processo de checkout
  iniciarCheckout() {
    console.log('iniciarCheckout() chamado');

    if (this.itensCarrinho.length === 0) {
      this.showTempMessage('Carrinho está vazio', 'error');
      return;
    }

    // Verificar disponibilidade de estoque antes de prosseguir
    const itemSemEstoque = this.itensCarrinho.find(item => item.quantidade > item.estoque);
    if (itemSemEstoque) {
      this.showTempMessage(`${itemSemEstoque.nome} não possui estoque suficiente`, 'error');
      return;
    }

    this.showCheckoutForm = true;
    this.clearMessages();
    this.formSubmitted = false;
  }

  // Cancelar checkout
  cancelarCheckout() {
    if (this.isProcessing) {
      if (!confirm('O pagamento está sendo processado. Deseja realmente cancelar?')) {
        return;
      }
    }

    this.showCheckoutForm = false;
    this.clearMessages();
    this.formSubmitted = false;
    this.resetCompradorInfo();
  }

  // Finalizar compra com validações melhoradas
  finalizarCompra() {
    this.formSubmitted = true;
    console.log('finalizarCompra() chamado');

    if (!this.validarDadosComprador()) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios corretamente';
      this.scrollToError();
      return;
    }

    this.isProcessing = true;
    this.clearMessages();

  this.paymentService.processCartPayment(this.itensCarrinho, this.compradorInfo)
      .subscribe({
        next: (response) => {
          console.log('Preferência criada:', response);

          // Salvar dados do pedido antes do redirecionamento
          this.salvarDadosPedido(response);

          // Redirecionar para o Mercado Pago
          this.paymentService.redirectToPayment(response.id, true);

          // Limpar carrinho após redirecionamento bem-sucedido
          setTimeout(() => {
            this.limparCarrinho();
          }, 1000);
        },
        error: (error) => {
          console.error('Erro ao processar pagamento:', error);
          this.errorMessage = this.getErrorMessage(error);
          this.isProcessing = false;
          this.scrollToError();
        }
      });
  }

  // Validar dados do comprador com mais critérios
  private validarDadosComprador(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const isValid = !!(
      this.compradorInfo.name?.trim() &&
      this.compradorInfo.surname?.trim() &&
      this.compradorInfo.email?.trim() &&
      emailRegex.test(this.compradorInfo.email.trim())
    );

    console.log('Validação dos dados:', {
      name: this.compradorInfo.name?.trim(),
      surname: this.compradorInfo.surname?.trim(),
      email: this.compradorInfo.email?.trim(),
      emailValid: emailRegex.test(this.compradorInfo.email?.trim() || ''),
      isValid
    });

    return isValid;
  }

  // Obter mensagem de erro amigável
  private getErrorMessage(error: any): string {
    if (error.status === 0) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
    if (error.status >= 500) {
      return 'Erro interno do servidor. Tente novamente em alguns minutos.';
    }
    if (error.status === 400) {
      return 'Dados inválidos. Verifique as informações e tente novamente.';
    }
    return error.message || 'Erro ao processar pagamento. Tente novamente.';
  }

  // Salvar dados do pedido no localStorage para recuperação
  private salvarDadosPedido(response: any) {
    const pedido = {
      id: response.id,
      itens: this.itensCarrinho,
      comprador: this.compradorInfo,
      total: this.totalFinal,
      data: new Date().toISOString()
    };

    localStorage.setItem('ultimo_pedido', JSON.stringify(pedido));
  }

  // Limpar carrinho
  private limparCarrinho() {
    this.itensCarrinho = [];
    this.showCheckoutForm = false;
    this.resetCompradorInfo();
    this.removerCupom();
    this.isProcessing = false;
    this.showTempMessage('Pedido realizado com sucesso!', 'success');
  }

  // Resetar informações do comprador
  private resetCompradorInfo() {
    this.compradorInfo = {
      name: '',
      surname: '',
      email: '',
      phone: {
        area_code: '',
        number: ''
      }
    };
  }

  // Mostrar mensagem temporária
  private showTempMessage(message: string, type: 'success' | 'error' | 'info') {
    if (type === 'success') {
      this.successMessage = message;
    } else {
      this.errorMessage = message;
    }

    setTimeout(() => {
      this.clearMessages();
    }, 5000);
  }

  // Limpar mensagens
  private clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
    this.cupomError = '';
  }

  // Rolar até o erro para melhor visibilidade
  private scrollToError() {
    setTimeout(() => {
      const errorElement = document.querySelector('.error-message');
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  // Método para validação em tempo real
  isFieldValid(fieldName: string): boolean {
    if (!this.formSubmitted) return true;

    switch (fieldName) {
      case 'name':
        return !!this.compradorInfo.name?.trim();
      case 'surname':
        return !!this.compradorInfo.surname?.trim();
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !!this.compradorInfo.email?.trim() && emailRegex.test(this.compradorInfo.email.trim());
      default:
        return true;
    }
  }

  // Salvar carrinho no localStorage
  salvarCarrinhoLocalStorage() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('carrinho_hobby_bichos', JSON.stringify(this.itensCarrinho));
    }
  }

  // Carregar carrinho do localStorage
  carregarCarrinhoLocalStorage() {
    if (isPlatformBrowser(this.platformId)) {
      const carrinho = localStorage.getItem('carrinho_hobby_bichos');
      if (carrinho) {
        try {
          this.itensCarrinho = JSON.parse(carrinho);
        } catch (error) {
          console.error('Erro ao carregar carrinho:', error);
        }
      }
    }
  }

  ngOnInit() {
    this.carregarCarrinhoLocalStorage();
  }

  ngOnDestroy() {
    this.salvarCarrinhoLocalStorage();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: Event) {
    if (this.showCheckoutForm) {
      this.cancelarCheckout();
    }
  }

  @HostListener('beforeunload', ['$event'])
  onBeforeUnload(event: Event) {
    this.salvarCarrinhoLocalStorage();
  }
}
