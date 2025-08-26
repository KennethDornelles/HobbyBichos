## Breakpoints

Os breakpoints são a base do design responsivo do HobbyBichos, garantindo que a interface se adapte de forma elegante a diferentes tamanhos de tela.

### Definições

- **Mobile:** `até 639px`
  - O layout é de coluna única, focado no conteúdo principal.
- **Tablet:** `640px - 1023px`
  - O layout começa a introduzir colunas e elementos lado a lado.
- **Desktop:** `1024px e acima`
  - O layout completo, com navegação lateral e múltiplas colunas.
- **Large Desktop:** `1280px e acima`
  - Para telas maiores, o espaçamento e a largura do container podem ser aumentados para melhor aproveitamento do espaço.

### Uso com Mixins

A maneira mais comum de aplicar estilos responsivos é através dos mixins SCSS. Eles permitem que você escreva os estilos para diferentes breakpoints dentro do mesmo seletor, mantendo o código organizado e legível.

```scss
.meu-componente {
  // Estilos base (mobile-first)
  width: 100%;

  @include tablet {
    // Estilos para tablet
    width: 50%;
  }

  @include desktop {
    // Estilos para desktop
    width: 33.33%;
  }
}
```

### Classes Utilitárias Responsivas

O sistema também fornece classes utilitárias que podem ser usadas para aplicar estilos responsivos diretamente no HTML. O prefixo do breakpoint é adicionado à classe.

**Exemplo:**

- `tablet:grid-cols-2`: Aplica um grid de 2 colunas apenas em telas de tablet e acima.
- `desktop:flex`: Aplica `display: flex` apenas em telas de desktop e acima.
- `mobile:hidden`: Esconde o elemento em telas mobile.

```html
<div class="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4">
  <!-- Itens do grid -->
</div>
```