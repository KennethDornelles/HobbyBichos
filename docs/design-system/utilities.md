## Classes Utilitárias

O HobbyBichos utiliza um conjunto de classes utilitárias para agilizar o desenvolvimento e manter a consistência visual. Essas classes são inspiradas no Tailwind CSS e permitem aplicar estilos diretamente no HTML.

### Espaçamento

Classes para controlar margens e preenchimentos.

- **Margin:** `m-{size}`, `mt-{size}`, `mb-{size}`, `ml-{size}`, `mr-{size}`, `mx-auto`
- **Padding:** `p-{size}`, `pt-{size}`, `pb-{size}`, `pl-{size}`, `pr-{size}`, `py-{size}`

Onde `{size}` pode ser: `0`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl`.

### Texto

Classes para estilização de texto.

- **Tamanho da Fonte:** `text-{size}` (`xs` a `5xl`)
- **Peso da Fonte:** `font-{weight}` (`light`, `normal`, `medium`, `semibold`, `bold`)
- **Alinhamento:** `text-left`, `text-center`, `text-right`, `text-justify`

### Cores

- **Cor do Texto:** `text-{color}` (e.g., `text-primary`, `text-charcoal`, `text-success`)
- **Cor de Fundo:** `bg-{color}` (e.g., `bg-primary`, `bg-white`, `bg-light`)
- **Gradientes:** `bg-gradient-{direction}` (e.g., `bg-gradient-primary`)

### Flexbox

- **Display:** `.flex`
- **Direção:** `.flex-row`, `.flex-col`
- **Alinhamento:** `.items-center`, `.items-start`, etc.
- **Justificação:** `.justify-center`, `.justify-between`, etc.
- **Gap:** `gap-{size}`

### Grid

- **Display:** `.grid`
- **Colunas:** `grid-cols-{n}` (e.g., `grid-cols-1`, `grid-cols-4`, `grid-cols-12`)
- **Responsivo:** `tablet:grid-cols-{n}`, `desktop:grid-cols-{n}`

### Posicionamento

- **Position:** `.static`, `.relative`, `.absolute`, `.fixed`, `.sticky`
- **Coordenadas:** `top-0`, `right-0`, `bottom-0`, `left-0`

### Display

- `.block`, `.inline`, `.inline-block`, `.hidden`

### Tamanho

- **Largura:** `w-full`, `w-auto`
- **Altura:** `h-full`, `h-auto`
- **Largura Máxima:** `max-w-{size}`
- **Altura Mínima:** `min-h-screen`

### Bordas

- **Largura:** `border`, `border-0`, `border-2`
- **Cor:** `border-primary`, `border-secondary`
- **Raio:** `rounded`, `rounded-sm`, `rounded-lg`, `rounded-full`

### Sombras

- `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`

### Opacidade

- `opacity-0`, `opacity-25`, `opacity-50`, `opacity-75`, `opacity-100`

### Transições

- `transition`, `transition-fast`

### Z-Index

- `z-0`, `z-10`, `z-20`, `z-30`, `z-40`, `z-50`

### Animações

- `animate-fade-in-up`, `animate-fade-in`, `animate-scale-hover`

### Container

- `.container`: Centraliza o conteúdo e aplica uma largura máxima.

### Acessibilidade

- `.sr-only`: Torna o elemento acessível apenas para leitores de tela.

### Hover

- `hover:scale-105`, `hover:shadow-lg`, `hover:bg-primary`, `hover:text-white`