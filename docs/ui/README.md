# UI/UX - HobbyBichos

Design system e padrões visuais do app mobile.

## Stack

| Tecnologia | Uso |
|------------|-----|
| NativeWind | TailwindCSS para React Native |
| Expo | Framework React Native |
| Lucide Icons | Ícones vetoriais |
| Ionicons | Ícones complementares |

## Cores

### Brand
| Nome | Hex | Uso |
|------|-----|-----|
| `brand-primary` | `#FFD600` | Cor principal (amarelo) |
| `brand-secondary` | `#4B6FFF` | Cor secundária (azul) |
| `hobby-yellow` | `#FFD600` | Amarelo Hobby |
| `hobby-dark` | `#10142D` | Background escuro |

### Backgrounds
| Nome | Hex | Uso |
|------|-----|-----|
| `primary-dark` | `#2B2D42` | Header/cards dark |
| `background-dark` | `#1A1B2E` | Fundo principal dark |
| `background-light` | `#F9FAFB` | Fundo principal light |
| `hobby-ice` | `#F4F4F6` | Background alternativo |

### Cards & Inputs
| Nome | Hex | Uso |
|------|-----|-----|
| `card-bg` | `#363849` | Background de cards |
| `card-input` | `#3D4054` | Background de inputs |
| `hobby-card-light` | `#FFFFFF` | Cards em light mode |
| `hobby-border-light` | `#E5E7EB` | Bordas sutis |

### Status
| Nome | Hex | Uso |
|------|-----|-----|
| `status-success` | `#22C55E` | Sucesso/confirmação |
| `status-error` | `#EF4444` | Erro/alerta crítico |
| `status-alert` | `#F59E42` | Aviso/atenção |

### Texto
| Nome | Hex | Uso |
|------|-----|-----|
| `text-primary` | `#FFFFFF` | Texto principal dark |
| `text-secondary` | `#9CA3AF` | Texto secundário |
| `hobby-text-light` | `#1F2937` | Texto principal light |

## Tipografia

### Fontes
- **Poppins** - Fonte principal
  - `Poppins_400Regular` - Texto normal
  - `Poppins_600SemiBold` - Semibold
  - `Poppins_700Bold` - Bold

- **Quicksand** - Títulos decorativos
  - `Quicksand_500Medium`
  - `Quicksand_600SemiBold`
  - `Quicksand_700Bold`

### Classes Tailwind
```tsx
className="font-sans"      // Poppins Regular
className="font-semibold"  // Poppins SemiBold
className="font-bold"      // Poppins Bold
```

## Espaçamento

### Border Radius
| Classe | Valor |
|--------|-------|
| `rounded-xl` | 24px |
| `rounded-2xl` | 32px |
| `rounded-hobby` | 30px |

### Shadows
| Classe | Uso |
|--------|-----|
| `shadow-glass` | Efeito glassmorphism |
| `shadow-card-light` | Cards light mode |
| `shadow-card-light-hover` | Cards hover |

## Temas

O app suporta **Light** e **Dark** mode via `ThemeContext`.

```tsx
import { useTheme } from '../context/ThemeContext';

const { isDark, toggleTheme } = useTheme();
```

### Exemplo de uso
```tsx
<View className={isDark ? "bg-background-dark" : "bg-background-light"}>
  <Text className={isDark ? "text-white" : "text-hobby-text-light"}>
    Conteúdo
  </Text>
</View>
```

## Componentes Principais

| Componente | Arquivo | Uso |
|------------|---------|-----|
| HomeHeader | `src/components/HomeHeader.tsx` | Header da home |
| SideMenu | `src/components/SideMenu.tsx` | Menu lateral |
| ProductCard | `src/components/ProductCard.tsx` | Card de produto |
| CartItem | `src/components/CartItem.tsx` | Item do carrinho |

## Configuração

**Arquivo**: [tailwind.config.js](../../mobile/tailwind.config.js)
