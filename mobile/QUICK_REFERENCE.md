# 📖 ProductSelectionScreen - Referência Rápida

## 🚀 Import Rápido

```typescript
import { ProductSelectionScreen } from '@/screens';
```

## 📁 Arquivos Principais

| Arquivo | Descrição |
|---------|-----------|
| `src/screens/ProductSelectionScreen.tsx` | Componente principal |
| `src/types/product.ts` | Tipos e interfaces |
| `src/utils/constants.ts` | Mock data e constantes |

## 🎯 Props (se necessário estender)

```typescript
interface ProductSelectionScreenProps {
  onProductPress?: (product: Product) => void;
  onFabPress?: () => void;
  onMenuPress?: () => void;
}
```

## 📊 Hook States

```typescript
const [menuVisible, setMenuVisible] = useState<boolean>(false);
const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
const [filteredProducts] = useMemo(() => {...}, [selectedCategory]);
```

## 🎨 Cores Rápidas

```
#1A1B2E  - Dark/Text
#FFD25D  - Yellow/Accent
#F5F5F5  - Background
#FFFFFF  - Card
#E5E5E5  - Border
```

## 🔤 Classes Tailwind Usadas

```
rounded-full     - Chips redondos
rounded-[32px]   - Cards arredondados
px-4, py-2.5     - Padding
mr-2             - Margin right
border-2         - Border espesso
bg-white         - Background branco
text-sm          - Tamanho pequeno
font-quicksand-*  - Fontes customizadas
flex-1           - Flex grow
aspect-[0.75]    - Aspecto ratio
h-[65%]          - Height 65%
absolute         - Posicionamento absoluto
bottom-6, right-6 - Posicionamento FAB
```

## 📱 Dimensões

- Card: width = 50% da tela, aspect ratio 0.75
- Image height: 65% do card
- Info height: 35% do card
- FAB: 64px × 64px
- Chip: 24px height (default)

## ⚡ Performance Config

```typescript
initialNumToRender={6}
maxToRenderPerBatch={4}
updateCellsBatchingPeriod={50}
scrollEventThrottle={16}
```

## 🧩 Componentes Filhos

```
ProductSelectionScreen
├── SideMenu
├── TopBar
├── ScrollView (categorias)
│   └── CategoryChip (×6)
├── FlatList (produtos)
│   └── ProductCard (×N)
│       ├── Image
│       ├── Badge (preço)
│       └── Add Button
└── FabButton
```

## 🔧 Handlers Principais

```typescript
handleMenuPress()        // Abre menu lateral
handleMenuClose()        // Fecha menu lateral
handleCategoryPress()    // Troca categoria
handleProductPress()     // Seleciona produto
handleFabPress()         // Vai para carrinho
```

## 🎯 Mock Data

### Categorias (6)
- Todos
- Higiene
- Ração
- Brinquedos
- Acessórios
- Medicamentos

### Produtos (12)
- 2 por categoria
- Preços de R$ 18.90 a R$ 129.90
- URLs de imagens Unsplash

## 📋 Estrutura de Produto

```typescript
{
  id: string;           // Único
  name: string;         // Nome do produto
  category: string;     // Categoria
  price: number;        // Preço em reais
  imageUrl: string;     // URL da imagem
}
```

## ✨ Features Ativas

- ✅ Filtro de categorias
- ✅ Grid responsivo 2 colunas
- ✅ Cards com badge de preço
- ✅ Menu lateral integrado
- ✅ FAB button funcional
- ✅ Acessibilidade completa
- ✅ Performance otimizada

## 🔄 Fluxo de Dados

```
MOCK_PRODUCTS
    ↓
[filtrar por categoria]
    ↓
filteredProducts
    ↓
[renderizar em FlatList]
    ↓
ProductCard (×N)
```

## 📞 Métodos Úteis

```typescript
// Filtrar produtos
const filtered = MOCK_PRODUCTS.filter(p => p.category === 'Higiene');

// Buscar um produto
const product = MOCK_PRODUCTS.find(p => p.id === '1');

// Contar produtos por categoria
const count = MOCK_PRODUCTS.filter(p => p.category === 'Ração').length;

// Preço total de uma categoria
const total = MOCK_PRODUCTS
  .filter(p => p.category === 'Medicamentos')
  .reduce((sum, p) => sum + p.price, 0);
```

## 🧪 Testes Rápidos

```bash
# Rodar testes
npm test -- ProductSelectionScreen.test.tsx

# Modo watch
npm test -- --watch -- ProductSelectionScreen.test.tsx

# Com cobertura
npm test -- --coverage -- ProductSelectionScreen.test.tsx
```

## 🔍 Debugging

```typescript
// Log do estado
console.log('Categoria selecionada:', selectedCategory);
console.log('Produtos filtrados:', filteredProducts.length);

// DevTools React Native
import { LogBox } from 'react-native';
// LogBox.ignoreAllLogs(); // Para debug mais limpo
```

## 📊 Snapshot do Componente

```
ProductSelectionScreen
│
├─ Renderizado: SIM
├─ Props: 0
├─ Estado: 2 (menuVisible, selectedCategory)
├─ Componentes filhos: 2 (CategoryChip, ProductCard)
├─ Total de elementos: 50+ (2 chips + 12 cards × 2 filhos)
└─ Performance: ✅ Otimizada
```

## 🔐 TypeScript Types

```typescript
// Type de categorias
type ProductCategory = 
  | 'Todos'
  | 'Higiene'
  | 'Ração'
  | 'Brinquedos'
  | 'Acessórios'
  | 'Medicamentos';

// Renderização de item
type ListRenderItem<T> = (info: ListRenderItemInfo<T>) => ReactElement | null;

// ViewStyle
type ViewStyle = {
  paddingHorizontal?: number;
  paddingTop?: number;
  // ... mais propriedades
};
```

## 🎬 Próximo Passo

Integrar com React Navigation:

```typescript
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();

const handleProductPress = (product: Product) => {
  navigation.navigate('ProductDetail', { productId: product.id });
};
```

## 📚 Documentação Completa

- [ProductSelectionScreen.README.md](src/screens/ProductSelectionScreen.README.md)
- [INTEGRATION_EXAMPLES.ts](src/screens/INTEGRATION_EXAMPLES.ts)
- [STRUCTURE.md](STRUCTURE.md)
- [ANIMATIONS_AND_IMPROVEMENTS.md](ANIMATIONS_AND_IMPROVEMENTS.md)

## 🚦 Status Checklist

- [x] Componente criado
- [x] Estilos aplicados
- [x] Lógica implementada
- [x] Acessibilidade done
- [x] Performance validada
- [x] Testes criados
- [x] Documentação completa

---

**Versão:** 1.0.0  
**Status:** ✅ Production Ready  
**Última Atualização:** 12 de janeiro de 2026
