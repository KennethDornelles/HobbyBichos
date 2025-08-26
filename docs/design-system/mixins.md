## Mixins SCSS

Os mixins são uma parte fundamental do design system do HobbyBichos, permitindo reutilizar estilos complexos de forma eficiente e manter o código SCSS limpo e organizado.

### Breakpoints Responsivos

Use estes mixins para aplicar estilos específicos para diferentes tamanhos de tela.

- `@include mobile`: Estilos para telas de até 639px.
- `@include tablet`: Estilos para telas entre 640px e 1023px.
- `@include desktop`: Estilos para telas a partir de 1024px.
- `@include large-desktop`: Estilos para telas a partir de 1280px.

### Flexbox

Atalhos para layouts flexbox comuns.

- `@include flex-center`: Centraliza itens nos eixos horizontal e vertical.
- `@include flex-between`: Alinha itens com espaço entre eles.
- `@include flex-column-center`: Centraliza itens em uma coluna.

### Botões

Estilos base para os botões da aplicação.

- `@include button-base`: Aplica o estilo fundamental de um botão.
- `@include button-primary`: Cria um botão primário com gradiente amarelo.
- `@include button-secondary`: Cria um botão secundário com gradiente azul.
- `@include button-outline`: Cria um botão com borda azul.

### Cards

- `@include card-base`: Estilo base para todos os cards.
- `@include card-hover`: Adiciona um efeito de `hover` ao card.

### Animações

- `@include fade-in-up($delay)`: Animação de fade in com movimento para cima.
- `@include fade-in($delay)`: Animação de fade in.
- `@include scale-hover`: Efeito de escala no `hover`.

### Texto

- `@include text-gradient($gradient)`: Aplica um gradiente ao texto.
- `@include text-shadow($color)`: Adiciona uma sombra ao texto.

### Formulários

- `@include form-input`: Estiliza campos de input.
- `@include form-label`: Estiliza labels de formulário.

### Utilitários

- `@include sr-only`: Esconde um elemento visualmente, mas o mantém acessível para leitores de tela.
- `@include clearfix`: Limpa floats.
- `@include aspect-ratio($width, $height)`: Mantém a proporção de um elemento.

### Gradientes

- `@include gradient-brand`: Gradiente com as cores da marca.
- `@include gradient-blue`: Gradiente com tons de azul.
- `@include gradient-accent`: Gradiente com cores de destaque.

### Espaçamento

- `@include container`: Cria um container com largura máxima e centralizado.

### Grid

- `@include grid($columns, $gap)`: Cria um grid com um número customizado de colunas e espaçamento.
- `@include grid-responsive($mobile, $tablet, $desktop)`: Cria um grid responsivo com um número de colunas diferente para cada breakpoint.