## Sombras

As sombras são usadas para criar profundidade e hierarquia na interface, destacando elementos e indicando sua elevação em relação ao fundo.

### Classes de Sombra

- **`.shadow-sm`**: Sombra sutil, ideal para elementos de baixa elevação, como inputs de formulário.
  - `box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);`

- **`.shadow-md`**: Sombra padrão, usada na maioria dos componentes, como cards e botões.
  - `box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);`

- **`.shadow-lg`**: Sombra grande, para elementos de alta elevação, como modais e menus dropdown.
  - `box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);`

- **`.shadow-xl`**: Sombra extra grande, para elementos que precisam de muito destaque.
  - `box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15), 0 10px 10px rgba(0, 0, 0, 0.04);`

- **`.shadow-brand`**: Uma sombra especial com a cor da marca, usada para dar um destaque único a elementos importantes.
  - `box-shadow: 0 8px 16px rgba(255, 219, 68, 0.3);`

### Efeitos de Hover

As sombras também podem ser aplicadas em `hover` para fornecer feedback visual.

- **`.hover:shadow-lg`**: Aplica a sombra `.shadow-lg` quando o usuário passa o mouse sobre o elemento.