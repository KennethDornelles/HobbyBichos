## Animações e Transições

As animações e transições são usadas para adicionar movimento e feedback visual à interface, tornando a experiência do usuário mais dinâmica e agradável.

### Animações

As animações são aplicadas através de classes utilitárias. Elas são ideais para chamar a atenção para elementos específicos ou para suavizar o aparecimento de novos elementos na tela.

- **`.animate-fade-in`**: Aplica um efeito de fade-in suave, fazendo o elemento transicionar de `opacity: 0` para `opacity: 1`.
- **`.animate-fade-in-up`**: Combina um fade-in com um leve movimento de baixo para cima. É ideal para elementos que aparecem em sequência, como itens de uma lista.
- **`.animate-pulse`**: Cria uma animação de pulsação contínua, útil para indicar atividade ou chamar a atenção para um elemento de forma sutil.
- **`.animate-bounce`**: Aplica um efeito de "salto" (bounce) ao elemento.

**Uso com Mixins:**

Você também pode aplicar as animações diretamente no seu SCSS usando mixins, o que permite maior controle, como a adição de um `delay`.

- `@include fade-in($delay)`
- `@include fade-in-up($delay)`
- `@include scale-hover`

### Transições

As transições controlam a velocidade das mudanças de estado de um elemento (e.g., `hover`, `focus`).

- **`.transition`**: Aplica uma transição padrão de `300ms` a todas as propriedades.
- **`.transition-fast`**: Aplica uma transição rápida de `150ms`.
- **`.transition-slow`**: Aplica uma transição lenta de `500ms`.

Use `transition-fast` para feedbacks rápidos, como hovers em botões, e `transition` para mudanças de estado mais significativas, como a abertura de um menu lateral.