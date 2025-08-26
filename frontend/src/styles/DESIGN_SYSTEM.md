# HobbyBichos Design System

## Visão Geral

O design system do HobbyBichos foi criado baseado na identidade visual da marca, focando em uma experiência amigável e acolhedora para donos de pets. As cores principais foram extraídas do logo da empresa.

## Paleta de Cores

### Cores Principais

- **Amarelo Principal** (`$primary-yellow: #FFDB44`): Cor de fundo do logo, transmite alegria e energia
- **Azul Principal** (`$primary-blue: #1E88E5`): Cor da coleira do cachorro, confiança e lealdade
- **Azul Secundário** (`$secondary-blue: #0D47A1`): Versão mais escura para acentos
- **Azul do Texto** (`$text-blue: #2C5282`): Cor do texto do logo
- **Laranja Acento** (`$orange-accent: #FF6B35`): Detalhes em laranja/vermelho do logo
- **Marrom Acento** (`$brown-accent: #8B4513`): Cor marrom/bege do cachorro

### Cores Neutras

- **Branco** (`$white: #FFFFFF`)
- **Cinza Claro** (`$light-gray: #F7F7F7`)
- **Cinza Médio** (`$medium-gray: #E2E8F0`)
- **Cinza Escuro** (`$dark-gray: #718096`)
- **Carvão** (`$charcoal: #2D3748`)
- **Preto** (`$black: #1A202C`)

### Cores de Estado

- **Sucesso** (`$success: #48BB78`)
- **Aviso** (`$warning: #ED8936`)
- **Erro** (`$error: #F56565`)
- **Informação** (`$info: $primary-blue`)

## Tipografia

### Fontes

- **Primária**: Inter (corpo do texto, formulários)
- **Secundária**: Poppins (títulos secundários)
- **Acento**: Fredoka One (títulos principais, logo)

### Tamanhos de Fonte

- `text-xs`: 12px
- `text-sm`: 14px
- `text-base`: 16px
- `text-lg`: 18px
- `text-xl`: 20px
- `text-2xl`: 24px
- `text-3xl`: 30px
- `text-4xl`: 36px
- `text-5xl`: 48px
- `text-6xl`: 60px

## Espaçamento

Sistema baseado em múltiplos de 4px:

- `$space-xs`: 4px
- `$space-sm`: 8px
- `$space-md`: 16px
- `$space-lg`: 24px
- `$space-xl`: 32px
- `$space-2xl`: 48px
- `$space-3xl`: 64px
- `$space-4xl`: 96px

## Componentes

### Botões

#### Tipos disponíveis:
- `.btn--primary`: Botão principal com gradiente amarelo
- `.btn--secondary`: Botão secundário com gradiente azul
- `.btn--outline`: Botão com borda azul

#### Tamanhos:
- `.btn--small`: 36px de altura
- Padrão: 44px de altura
- `.btn--large`: 56px de altura

### Cards

#### Tipos:
- `.card`: Card básico
- `.card--hover`: Card com efeito hover
- `.card--pet`: Card específico para pets com bordas especiais

### Formulários

#### Classes principais:
- `.form__group`: Container do campo
- `.form__label`: Label do campo
- `.form__input`: Input básico
- `.form__textarea`: Textarea
- `.form__select`: Select customizado

### Alertas

#### Tipos:
- `.alert--success`: Alerta de sucesso
- `.alert--warning`: Alerta de aviso
- `.alert--error`: Alerta de erro
- `.alert--info`: Alerta informativo

## Utilities

### Espaçamento
- Margin: `.m-{size}`, `.mt-{size}`, `.mb-{size}`, etc.
- Padding: `.p-{size}`, `.pt-{size}`, `.pb-{size}`, etc.

### Cores
- Texto: `.text-primary`, `.text-secondary`, etc.
- Background: `.bg-primary`, `.bg-secondary`, etc.

### Layout
- Flexbox: `.flex`, `.justify-center`, `.items-center`, etc.
- Grid: `.grid`, `.grid-cols-{n}`, etc.
- Display: `.block`, `.hidden`, `.flex`, etc.

### Responsive
- Mobile: `.mobile:hidden`
- Tablet: `.tablet:block`
- Desktop: `.desktop:flex`

## Breakpoints

- Mobile: até 639px
- Tablet: 640px - 1023px
- Desktop: 1024px+
- Large Desktop: 1280px+

## Sombras

- `.shadow-sm`: Sombra sutil
- `.shadow`: Sombra padrão
- `.shadow-lg`: Sombra grande
- `.shadow-brand`: Sombra com cor da marca

## Animações

### Classes de animação:
- `.animate-fade-in`: Fade in suave
- `.animate-fade-in-up`: Fade in com movimento para cima
- `.animate-pulse`: Pulsação contínua
- `.animate-bounce`: Efeito bounce

### Transições:
- `.transition-fast`: 150ms
- `.transition`: 300ms (padrão)
- `.transition-slow`: 500ms

## Mixins Utilitários

### Responsivo
```scss
@include mobile { /* estilos mobile */ }
@include tablet { /* estilos tablet */ }
@include desktop { /* estilos desktop */ }
```

### Flexbox
```scss
@include flex-center; // centraliza horizontal e vertical
@include flex-between; // space-between
```

### Botões
```scss
@include button-primary;
@include button-secondary;
@include button-outline;
```

### Cards
```scss
@include card-base;
@include card-hover;
@include card-pet;
```

## Diretrizes de Uso

### Cores
- Use o amarelo principal para CTAs importantes
- O azul transmite confiança, use para ações secundárias
- Cores neutras para texto e backgrounds
- Cores de estado apenas para feedbacks específicos

### Tipografia
- Fredoka One apenas para títulos principais e logo
- Inter para corpo de texto
- Poppins para títulos secundários

### Espaçamento
- Mantenha consistência usando o sistema de espaçamento
- Use espaçamentos maiores entre seções
- Espaçamentos menores dentro de componentes

### Acessibilidade
- Mantenha contraste mínimo de 4.5:1
- Focus states estão definidos automaticamente
- Suporte a prefers-reduced-motion

## Exemplo de Uso

```html
<div class="card card--pet p-lg">
  <img src="pet.jpg" alt="Pet" class="card__image">
  <div class="card__body">
    <h3 class="text-xl font-semibold text-charcoal mb-sm">Nome do Pet</h3>
    <p class="text-sm text-gray mb-md">Descrição do pet...</p>
    <div class="flex justify-between items-center">
      <span class="badge badge--success">Disponível</span>
      <button class="btn btn--primary">Ver Detalhes</button>
    </div>
  </div>
</div>
```
