# ProductSelectionScreen - Documentação

## 📋 Visão Geral

`ProductSelectionScreen.tsx` é um componente React Native otimizado para exibição de produtos com filtro por categorias, construído com Expo, NativeWind e TypeScript.

## 🎯 Características Principais

- ✅ Filtro horizontal de categorias
- ✅ Grid de produtos com 2 colunas
- ✅ Integração com SideMenu e TopBar
- ✅ FAB Button para carrinho
- ✅ Otimização de performance com `React.memo` e `useMemo`
- ✅ TypeScript strict mode
- ✅ Acessibilidade completa
- ✅ Estilização com NativeWind (Tailwind CSS)

## 📁 Estrutura de Arquivos

```
mobile/
├── src/
│   ├── screens/
│   │   └── ProductSelectionScreen.tsx  (componente principal)
│   ├── types/
│   │   └── product.ts                   (interfaces de tipos)
│   ├── utils/
│   │   └── constants.ts                 (constantes e mock data)
│   ├── components/
│   │   ├── SideMenu.tsx
│   │   ├── TopBar.tsx
│   │   └── FabButton.tsx
│   └── ...
├── tailwind.config.js                   (configuração atualizada)
└── ...
```

## 🚀 Como Usar

### Importar o componente

```typescript
import ProductSelectionScreen from '@/screens/ProductSelectionScreen';
```

### Integrar com navegação (React Navigation)

```typescript
// navigation/RootNavigator.tsx
import ProductSelectionScreen from '@/screens/ProductSelectionScreen';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProductSelection"
        component={ProductSelectionScreen}
        options={{ headerShown: false }}
      />
      {/* outras rotas */}
    </Stack.Navigator>
  );
}
```

### Ou usar diretamente no App

```typescript
// App.tsx
import ProductSelectionScreen from '@/screens/ProductSelectionScreen';

export default function App() {
  return <ProductSelectionScreen />;
}
```

## 🎨 Personalização

### Alterar cores

Edite `src/utils/constants.ts`:

```typescript
export const COLORS = {
  primary: {
    dark: '#1A1B2E',    // mude aqui
    light: '#F5F5F5',   // mude aqui
  },
  accent: {
    yellow: '#FFD25D',  // mude aqui
  },
  // ...
};
```

### Adicionar novos produtos

Em `src/utils/constants.ts`:

```typescript
export const MOCK_PRODUCTS: Product[] = [
  // ... produtos existentes
  {
    id: '13',
    name: 'Novo Produto',
    category: 'Higiene',
    price: 99.90,
    imageUrl: 'https://example.com/image.jpg',
  },
];
```

### Alterar categorias

Em `src/utils/constants.ts`:

```typescript
export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Todos',
  'SuaCategoria',
  'OutraCategoria',
  // ...
];
```

## 🔧 Dependências Necessárias

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-native": "^0.71.0",
    "expo": "^48.0.0",
    "nativewind": "^2.0.0",
    "react-native-safe-area-context": "^4.0.0",
    "@expo/vector-icons": "^13.0.0",
    "typescript": "^4.9.0"
  }
}
```

### Fontes necessárias (Expo Fonts)

O componente usa fontes da família Quicksand. Certifique-se de que estão carregadas:

```typescript
// App.tsx
import * as Font from 'expo-font';
import {
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from '@expo-google-fonts/quicksand';

// No carregamento da app
await Font.loadAsync({
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
});
```

## 📊 Performance

### Otimizações Implementadas

1. **React.memo** - CategoryChip e ProductCard são memoizados
2. **useMemo** - Filtro de produtos recalculado apenas quando necessário
3. **useCallback** - Handlers otimizados para não criar novas referências
4. **FlatList** - Configurado com `initialNumToRender`, `maxToRenderPerBatch` e `updateCellsBatchingPeriod`
5. **Image** - Com cache habilitado por padrão

### Benchmarks esperados

- Renderização inicial: < 500ms
- Scroll fluido a 60 FPS
- Mudança de categoria: < 100ms

## ♿ Acessibilidade

O componente implementa:

- ✅ `accessible={true}` em todos TouchableOpacity
- ✅ `accessibilityLabel` descritivo
- ✅ `accessibilityRole="button"` para elementos interativos
- ✅ `accessibilityState` para refletir estado selecionado

## 🐛 Troubleshooting

### Fontes não carregam

**Problema:** Cards mostram fontes incorretas

**Solução:**
```bash
# Recarregar o app
expo start -c

# Ou limpar cache
expo start --clear
```

### Imagens não carregam

**Problema:** Imagens aparecem em branco

**Solução:**
1. Verificar URL da imagem
2. Usar fallback com `defaultSource`
3. Verificar conexão de internet

### Performance lenta

**Problema:** Scroll travado

**Solução:**
1. Aumentar `initialNumToRender` em etapas
2. Usar imagens menores
3. Profiler com React DevTools

## 📝 Tipos Disponíveis

### Product

```typescript
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
}
```

### ProductCategory

```typescript
type ProductCategory = 
  | 'Todos'
  | 'Higiene'
  | 'Ração'
  | 'Brinquedos'
  | 'Acessórios'
  | 'Medicamentos';
```

## 🔮 Funcionalidades Futuras

- [ ] Integração com API real
- [ ] Busca/filtro de texto
- [ ] Ordenação (preço, nome)
- [ ] Detalhes do produto em modal
- [ ] Adicionar ao carrinho com animação
- [ ] Favoritos
- [ ] Reviews de usuários
- [ ] Loading skeleton

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

**Última atualização:** 12 de janeiro de 2026
**Versão:** 1.0.0
**Status:** Production-Ready ✅
