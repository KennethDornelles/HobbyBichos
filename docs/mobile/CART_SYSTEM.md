# 🛒 Sistema de Carrinho Híbrido - Documentação

## ✅ Sistema Implementado com Sucesso!

O sistema completo de carrinho de compras híbrido foi implementado com as seguintes funcionalidades:

### 📱 Frontend (Mobile - React Native)

#### 1. **Arquitetura de Estado (Zustand)**
- ✅ Store persistente com AsyncStorage
- ✅ Atualizações otimistas para feedback instantâneo
- ✅ Sincronização debounced (2 segundos)
- ✅ Validação de estoque antes de adicionar/atualizar

**Arquivo:** `mobile/src/store/cartStore.ts`

#### 2. **Auto-Sincronização**
- ✅ Carrega carrinho ao iniciar o app
- ✅ Sincroniza ao voltar ao foreground
- ✅ Sincronização periódica a cada 5 minutos

**Arquivo:** `mobile/src/hooks/useCartAutoSync.ts`

#### 3. **Componentes UI**

##### CartBadge
- Mostra ícone do carrinho com contador de itens
- Atualiza em tempo real

**Arquivo:** `mobile/src/components/CartBadge.tsx`

**Uso:**
```tsx
import CartBadge from '../src/components/CartBadge';

<CartBadge onPress={() => router.push('/carrinho')} />
```

##### ProductCard
- Card de produto com imagem, preço e estoque
- Botão "Adicionar ao carrinho"
- Controles de quantidade (+/-)
- Validação de estoque
- Feedback háptico

**Arquivo:** `mobile/src/components/ProductCard.tsx`

**Uso:**
```tsx
import ProductCard from '../src/components/ProductCard';

<ProductCard
  product={{
    id: '123',
    name: 'Ração Premium',
    price: 89.90,
    image: 'https://...',
    stock: 15,
    sku: 'RAC001'
  }}
/>
```

#### 4. **Telas**

##### Carrinho (`/carrinho`)
- Lista de itens com imagens
- Controles de quantidade
- Botão remover item
- Validação automática ao abrir
- Subtotal e botão de checkout

**Arquivo:** `mobile/app/carrinho.tsx`

##### Checkout (`/checkout`)
- Resumo do pedido
- Seleção de endereço
- Forma de pagamento (Pix, Cartão, Boleto)
- Validação final antes de confirmar
- Criação do pedido na API

**Arquivo:** `mobile/app/checkout.tsx`

---

### 🔧 Backend (NestJS)

#### 1. **Prisma Schema**
Modelos adicionados:
```prisma
model Cart {
  id        String   @id @default(uuid())
  userId    String   @unique
  items     CartItem[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model CartItem {
  id        String   @id @default(uuid())
  cartId    String
  productId String
  quantity  Int      @default(1)
  cart      Cart     @relation(...)
  product   Product  @relation(...)
  
  @@unique([cartId, productId])
}
```

**Arquivo:** `api/prisma/schema.prisma`

#### 2. **Cart Service**
Métodos implementados:
- `getCart(userId)` - Busca carrinho com cálculos
- `addItem(userId, productId, quantity)` - Adiciona item
- `updateItemQuantity(userId, productId, quantity)` - Atualiza quantidade
- `removeItem(userId, productId)` - Remove item
- `clearCart(userId)` - Limpa carrinho
- `updateCart(userId, items)` - Sincroniza do cliente
- `validateStock(userId)` - Valida estoque e preços
- `reserveStock(userId)` - Reserva estoque no checkout

**Arquivo:** `api/src/modules/cart/cart.service.ts`

#### 3. **Cart Controller**
Endpoints REST:
```
GET    /cart              - Buscar carrinho
POST   /cart/add          - Adicionar item
POST   /cart/sync         - Sincronizar carrinho
POST   /cart/validate     - Validar estoque
DELETE /cart/:productId   - Remover item
DELETE /cart              - Limpar carrinho
```

**Arquivo:** `api/src/modules/cart/cart.controller.ts`

#### 4. **Integração**
- ✅ CartModule registrado no AppModule
- ✅ Autenticação JWT obrigatória
- ✅ Prisma Client atualizado

---

## 🚀 Como Usar

### 1. **Backend - Iniciar Servidor**

```bash
cd api
npm run start:dev
```

O servidor estará rodando em `http://localhost:3000`

### 2. **Mobile - Configurar Ambiente**

Crie o arquivo `.env` baseado no `.env.example`:

```bash
cd mobile
cp .env.example .env
```

Edite `.env`:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

**Nota:** Para testar no dispositivo físico, use o IP da sua máquina:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:3000
```

### 3. **Mobile - Iniciar App**

```bash
cd mobile
npm start
```

Escaneie o QR code com Expo Go.

---

## 📖 Exemplos de Uso

### Adicionar ProductCard em uma tela

```tsx
import { View, ScrollView } from 'react-native';
import ProductCard from '../src/components/ProductCard';

export default function ProductsScreen() {
  const products = [
    { id: '1', name: 'Ração Premium', price: 89.90, image: null, stock: 15 },
    { id: '2', name: 'Coleira LED', price: 45.00, image: null, stock: 3 },
  ];

  return (
    <ScrollView className="flex-1 bg-primary-dark p-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </ScrollView>
  );
}
```

### Adicionar CartBadge no Header

```tsx
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import CartBadge from '../src/components/CartBadge';

export default function Header() {
  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <Text className="text-white text-2xl font-bold">HobbyBichos</Text>
      <CartBadge onPress={() => router.push('/carrinho')} />
    </View>
  );
}
```

### Usar Cart Store diretamente

```tsx
import { useCartStore } from '../src/store/cartStore';

export default function MyComponent() {
  const { items, addItem, getTotalItems, getSubtotal } = useCartStore();

  const handleAdd = () => {
    try {
      addItem({
        productId: '123',
        name: 'Produto',
        price: 50.00,
        image: null,
        maxStock: 10,
        sku: 'PROD123',
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <View>
      <Text>Total de itens: {getTotalItems()}</Text>
      <Text>Subtotal: R$ {getSubtotal().toFixed(2)}</Text>
    </View>
  );
}
```

---

## 🔍 Funcionalidades Principais

### ✅ Sincronização Híbrida
- Dados persistem localmente (AsyncStorage)
- Sincroniza com backend automaticamente
- Funciona offline, sincroniza quando voltar online

### ✅ Validação de Estoque
- Verifica estoque antes de adicionar
- Impede adicionar mais que o disponível
- Alerta de estoque baixo (< 10 unidades)
- Validação antes do checkout

### ✅ UX Otimizada
- Atualizações instantâneas (otimista)
- Feedback háptico ao adicionar
- Loading states em todas as operações
- Mensagens de erro amigáveis

### ✅ Segurança
- Autenticação JWT obrigatória
- Validação de estoque no backend
- Prevenção de overselling
- Carrinho por usuário (isolado)

---

## 🛠️ Troubleshooting

### Erro: "Cannot connect to server"
- Verifique se o backend está rodando
- Confirme o IP/URL correto no `.env`
- Em dispositivos físicos, use o IP da máquina (não localhost)

### Carrinho não sincroniza
- Verifique se está autenticado (token JWT válido)
- Confira logs no console: `[Cart] ...`
- Tente fazer logout/login novamente

### Erro de estoque
- Normal! É a validação funcionando
- O estoque pode ter mudado desde que adicionou
- Ajuste a quantidade ou remova o item

---

## 📂 Estrutura de Arquivos

```
mobile/
├── src/
│   ├── components/
│   │   ├── CartBadge.tsx          ✅ Badge com contador
│   │   └── ProductCard.tsx        ✅ Card de produto
│   ├── hooks/
│   │   └── useCartAutoSync.ts     ✅ Hook de sincronização
│   ├── store/
│   │   └── cartStore.ts           ✅ Zustand store
│   ├── services/
│   │   └── api.ts                 ✅ Axios configurado
│   ├── types/
│   │   └── cart.types.ts          ✅ TypeScript types
│   └── utils/
│       └── errorHandler.ts        ✅ Tratamento de erros
├── app/
│   ├── _layout.tsx                ✅ Auto-sync integrado
│   ├── carrinho.tsx               ✅ Tela do carrinho
│   └── checkout.tsx               ✅ Tela de checkout
└── .env.example                   ✅ Variáveis de ambiente

api/
├── src/modules/cart/
│   ├── cart.module.ts             ✅ NestJS module
│   ├── cart.service.ts            ✅ Lógica de negócio
│   └── cart.controller.ts         ✅ REST endpoints
├── prisma/
│   └── schema.prisma              ✅ Models Cart/CartItem
└── src/app.module.ts              ✅ CartModule registrado
```

---

## 🎯 Próximos Passos (Opcional)

### 1. Analytics
Adicionar tracking de eventos:
- Produto adicionado ao carrinho
- Carrinho abandonado
- Checkout iniciado
- Pedido finalizado

### 2. Cache Layer
Implementar cache de produtos para melhor performance.

**Arquivo:** `mobile/src/services/cacheService.ts`

### 3. Otimizações
- [ ] Implementar React Query para cache de API
- [ ] Adicionar loading skeleton nos cards
- [ ] Implementar pull-to-refresh
- [ ] Adicionar animações (Reanimated)

### 4. Notificações
- [ ] Push notification ao confirmar pedido
- [ ] Alerta de estoque baixo para favoritos

---

## 📊 Fluxo Completo

```
1. Usuário navega pelos produtos
   ↓
2. Clica em "Adicionar ao Carrinho"
   ↓
3. Frontend adiciona localmente (otimista)
   ↓
4. Debounce de 2s
   ↓
5. Sincroniza com backend (POST /cart/sync)
   ↓
6. Backend valida estoque e atualiza
   ↓
7. Frontend recebe resposta e atualiza estado
   ↓
8. Usuário navega para /carrinho
   ↓
9. Sistema valida estoque novamente
   ↓
10. Se OK, mostra botão "Finalizar Compra"
    ↓
11. Navega para /checkout
    ↓
12. Validação final de estoque
    ↓
13. Usuário confirma pedido
    ↓
14. POST /orders (cria pedido)
    ↓
15. Limpa carrinho
    ↓
16. Navega para tela de sucesso
```

---

## 🎉 Conclusão

O sistema de carrinho híbrido está **100% funcional** e pronto para uso!

**Principais Benefícios:**
- ⚡ Performance otimizada
- 🔄 Sincronização automática
- 📱 Funciona offline
- ✅ Validações robustas
- 🎨 UI/UX moderna
- 🔒 Seguro e confiável

Boas vendas! 🚀
