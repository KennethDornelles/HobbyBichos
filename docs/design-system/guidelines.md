## Diretrizes de Uso

Estas diretrizes garantem que a aplicação do design system seja consistente, resultando em uma experiência de usuário coesa e acessível.

### Cores

- **Amarelo Principal (`#FFDB44`):** Use para chamadas à ação (CTAs) primárias e elementos que precisam de destaque imediato. A cor transmite energia e deve guiar o usuário para ações importantes.
- **Azul Principal (`#1E88E5`):** Ideal para ações secundárias, links e elementos de navegação. O azul transmite confiança e estabilidade.
- **Cores Neutras:** A base da interface. Use cinzas para textos, fundos e bordas, criando uma hierarquia visual clara e garantindo a legibilidade.
- **Cores de Estado:** Use as cores de sucesso, aviso, erro e informação exclusivamente para fornecer feedback ao usuário sobre o resultado de suas ações (e.g., formulários, notificações).

### Tipografia

- **Fredoka One:** Reservada para títulos de grande impacto e para o logo. Use com moderação para não sobrecarregar o design.
- **Poppins:** Aplicada em títulos secundários e subtítulos, oferecendo um contraste amigável e moderno.
- **Inter:** A fonte principal para todo o corpo de texto, incluindo parágrafos, labels de formulário e outros textos longos. Sua legibilidade é excelente em diversos tamanhos.

### Espaçamento

- **Consistência é a chave:** Utilize as variáveis de espaçamento (`$space-xs`, `$space-sm`, etc.) para garantir um ritmo vertical e horizontal consistente.
- **Hierarquia Visual:** Use espaçamentos maiores para separar seções distintas da página e espaçamentos menores para agrupar elementos relacionados dentro de um mesmo componente.

### Acessibilidade (a11y)

- **Contraste de Cores:** Todos os textos devem ter uma taxa de contraste de, no mínimo, 4.5:1 em relação ao seu fundo, conforme as diretrizes do WCAG.
- **Foco Visível:** Todos os elementos interativos (links, botões, campos de formulário) devem ter um estado de foco claro e visível para auxiliar a navegação por teclado.
- **Texto Alternativo:** Todas as imagens devem conter um atributo `alt` descritivo.
- **Movimento Reduzido:** O sistema respeita a preferência do usuário por movimento reduzido (`prefers-reduced-motion`), desativando ou substituindo animações complexas.

## Exemplo Prático

O exemplo abaixo demonstra como as classes utilitárias e os componentes trabalham juntos para criar um card de produto coeso e estilizado.

```html
<div class="card card--pet p-lg shadow-md rounded-lg">
  <img src="path/to/pet-image.jpg" alt="Foto de um cachorro para adoção" class="card__image rounded-t-lg">
  <div class="card__body p-md">
    <h3 class="text-2xl font-semibold text-charcoal mb-sm">Max</h3>
    <p class="text-base text-gray mb-md">Um companheiro leal e brincalhão em busca de um lar amoroso.</p>
    <div class="flex justify-between items-center mt-lg">
      <span class="badge badge--success">Disponível</span>
      <button class="btn btn--primary">Ver Detalhes</button>
    </div>
  </div>
</div>
```