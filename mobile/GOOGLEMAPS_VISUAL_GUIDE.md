# 🎨 Guia Visual - Google Maps Integration

## 📱 Interface da Tela de Teste

```
┌─────────────────────────────────────────┐
│  🔍 Lojas Próximas │ 🚗 Rastreamento   │
├─────────────────────────────────────────┤
│                                         │
│  📍 Sua Localização                    │
│  ├─ Latitude: -23.5505                │
│  └─ Longitude: -46.6333               │
│                                         │
│  🏪 Top 3 Lojas Mais Próximas         │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ #1 PetShop Central              │   │
│  │ Rua X, 123, São Paulo          │   │
│  │ 📏 1.2 km │ ⏱️ 5 mins           │   │
│  │ ⭐ 4.5 ⭐⭐ 250 avaliações       │   │
│  │ → Rastrear Entrega             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ #2 PetBoss Store                │   │
│  │ Av Y, 456, São Paulo           │   │
│  │ 📏 2.1 km │ ⏱️ 8 mins           │   │
│  │ ⭐ 4.2 ⭐⭐ 180 avaliações       │   │
│  │ → Rastrear Entrega             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ #3 Animais & Cia                │   │
│  │ Rua Z, 789, São Paulo          │   │
│  │ 📏 3.5 km │ ⏱️ 12 mins          │   │
│  │ ⭐ 4.1 ⭐⭐ 150 avaliações       │   │
│  │ → Rastrear Entrega             │   │
│  └─────────────────────────────────┘   │
│                                         │
│                  🔄 Atualizar           │
└─────────────────────────────────────────┘
```

## 🗺️ Interface do Mapa de Rastreamento

```
┌──────────────────────────────────────┐
│                                      │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓ MAPA ▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│  ▓                                ▓ │
│  ▓    ╱╱╱╱╱╱╱╱╱╱╱╱              ▓ │
│  ▓   ╱ Rota (Polyline)╱        ▓ │
│  ▓  ╱╱╱╱╱ 🔵 ╱╱╱╱╱╱         ▓ │
│  ▓            ╱╱╱╱╱╱╱╱╱╱╱╱╱╱   ▓ │
│  ▓           ╱╱╱╱╱╱╱╱╱╱ 📍    ▓ │
│  ▓          ╱╱  (Destino)     ▓ │
│  ▓                                ▓ │
│  ▓   🔵 = Entregador (Animado)   ▓ │
│  ▓   📍 = Cliente/Destino         ▓ │
│  ▓   ════ = Polyline (Azul)       ▓ │
│  ▓                                ▓ │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ 👤 João Silva (Entregador)   │   │
│  │ ████░░░░░░░░░░░░░░░░░░░░░ 55% │  │
│  │ ⏱️ Tempo restante: 3 mins    │   │
│  └──────────────────────────────┘   │
│                                      │
│  ┌──────────────┐  ┌──────────────┐ │
│  │ ▶️ Iniciar   │  │ ← Voltar     │ │
│  └──────────────┘  └──────────────┘ │
└──────────────────────────────────────┘
```

## 🔄 Fluxo de Interação

```
USER INTERACTION FLOW
═══════════════════════════════════════════

┌─────────────┐
│  App Abre   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Pedir Permissão de Localização     │
│  └─ expo-location.request...()      │
└──────┬──────────────────────────────┘
       │
       ├─ Permissão Concedida ──┐
       │                         │
       │ Permissão Negada ──┐   │
       │                    │   │
       ▼                    ▼   ▼
    [Erro]           [Tela Bloqueada]
                     [Pedir permissão]

       Permissão OK
       │
       ▼
┌─────────────────────────────────┐
│  Obter Localização GPS          │
│  └─ expo-location.getCurrentPos()
└──────┬──────────────────────────┘
       │
       ▼ (Coordenadas obtidas)
┌─────────────────────────────────┐
│  Buscar Lojas Próximas          │
│  └─ googleMapsService.nearby... │
│     └─ Distance Matrix API      │
└──────┬──────────────────────────┘
       │
       ▼ (Lojas recebidas)
┌─────────────────────────────────┐
│  Renderizar Lista de Lojas      │
│  (Ordenadas por distância)      │
└──────┬──────────────────────────┘
       │
       ├─ Usuário clica em loja ─┐
       │                          │
       ▼                          ▼
    [Carrinho]           ┌──────────────────┐
                         │ Carregar Rota    │
                         │ processDelivery()│
                         └────┬─────────────┘
                              │
                              ▼
                         ┌──────────────────┐
                         │ Mostrar Mapa     │
                         │ com Rastreamento │
                         └────┬─────────────┘
                              │
                              ├─ Iniciar Simulação ─┐
                              │                      │
                              ▼                      ▼
                           [Simulando]         [Pausado]
                              │
                              ├─ Usuário clica pausar ─┐
                              │                         │
                              ▼                         ▼
                           [Pausado]            [Simulando]
                              │
                              ├─ Simulação completa ─┐
                              │                       │
                              ▼                       ▼
                           [Concluído]        [Entregar]
```

## 🔌 Fluxo de Dados

```
                    USER DEVICE
     ┌────────────────────────────────────┐
     │                                    │
     │  expo-location.getCurrentPosition()│
     │           ↓                        │
     │  { lat: -23.5505, lng: -46.6333 } │
     │           ↓                        │
     │  useNearbyPetShops Hook            │
     │           ↓                        │
     └────────────┬─────────────────────┘
                  │
                  │ (HTTPS)
                  ▼
     ┌────────────────────────────────────┐
     │   GOOGLE MAPS PLATFORM             │
     │                                    │
     │  ┌────────────────────────────┐   │
     │  │ Places API (Nearby)        │   │
     │  │ Input: coords + radius     │   │
     │  │ Output: Places Array       │   │
     │  └────────────────────────────┘   │
     │              ↓                    │
     │  ┌────────────────────────────┐   │
     │  │ Distance Matrix API        │   │
     │  │ Input: origin + 3 dests    │   │
     │  │ Output: distances + times  │   │
     │  └────────────────────────────┘   │
     │              ↓                    │
     │  ┌────────────────────────────┐   │
     │  │ Directions API             │   │
     │  │ Input: origin + destination│   │
     │  │ Output: Polyline + Steps   │   │
     │  └────────────────────────────┘   │
     └────────────┬─────────────────────┘
                  │
                  │ (JSON Response)
                  ▼
     ┌────────────────────────────────────┐
     │  googleMapsService.ts              │
     │  ├─ Parse responses               │
     │  ├─ Process data                  │
     │  └─ Return clean objects          │
     │           ↓                        │
     │  React Hooks & Components          │
     │  ├─ useNearbyPetShops()           │
     │  ├─ useDeliveryLocation()         │
     │  └─ DeliveryTracking Comp.        │
     │           ↓                        │
     │  UI Updates                        │
     │  ├─ Shop List                     │
     │  ├─ Map with Polyline            │
     │  ├─ Driver Marker Animation       │
     │  └─ Progress Bar                  │
     └────────────────────────────────────┘
```

## 📦 Estrutura de Diretórios

```
mobile/
│
├── src/
│   │
│   ├── types/
│   │   ├── googlemaps.types.ts          ← ✨ NOVO
│   │   └── index.ts                     ← ATUALIZADO
│   │
│   ├── services/
│   │   ├── api.ts                       (existente)
│   │   ├── googleMapsService.ts         ← ✨ NOVO
│   │   └── ...
│   │
│   ├── hooks/
│   │   ├── useCartAutoSync.ts           (existente)
│   │   ├── useThemeColors.ts            (existente)
│   │   ├── useNearbyPetShops.ts         ← ✨ NOVO
│   │   ├── useDeliveryLocation.ts       ← ✨ NOVO
│   │   └── index.ts                     ← ATUALIZADO
│   │
│   ├── components/
│   │   ├── ...                          (existentes)
│   │   └── DeliveryTracking.tsx         ← ✨ NOVO
│   │
│   └── ...
│
├── app/
│   ├── _layout.tsx                      (existente)
│   ├── home.tsx                         (existente)
│   ├── loja.tsx                         (existente)
│   ├── pedidos.tsx                      (existente)
│   ├── checkout.tsx                     (existente)
│   ├── googlemaps-test.tsx              ← ✨ NOVO (Tela de Teste)
│   └── ...
│
├── .env.local.example                   ← ✨ NOVO
│
├── GOOGLEMAPS_QUICKSTART.md             ← ✨ NOVO
├── GOOGLEMAPS_SETUP.md                  ← ✨ NOVO
├── GOOGLEMAPS_CHECKLIST.md              ← ✨ NOVO
├── GOOGLEMAPS_EXAMPLES.ts               ← ✨ NOVO
├── GOOGLEMAPS_ARCHITECTURE.md           ← ✨ NOVO
├── GOOGLEMAPS_REFERENCE.md              ← ✨ NOVO
├── GOOGLEMAPS_SUMMARY.md                ← ✨ NOVO
├── GOOGLEMAPS_IMPLEMENTATION.md         ← ✨ NOVO
├── GOOGLEMAPS_NEXT_STEPS.md             ← ✨ NOVO
└── GOOGLEMAPS_VISUAL_GUIDE.md           ← ✨ ESTE ARQUIVO
```

## 🎯 Integração com Telas Existentes

```
Telas Existentes          Google Maps Integration
═════════════════════════════════════════════════════════════

app/loja.tsx                ┐
                            ├─→ useNearbyPetShops()
                            │   ├─ Busca lojas próximas
                            │   ├─ Mostra em lista
                            │   └─ Permite seleção
                            │
app/pedidos.tsx             ├─→ useDeliveryLocation()
                            │   ├─ Rastreia entrega
                            │   ├─ Mostra progresso
                            │   └─ Anima movimento
                            │
                            ├─→ DeliveryTracking
                            │   ├─ Renderiza mapa
                            │   ├─ Mostra polyline
                            │   └─ Anima marcadores
                            │
app/checkout.tsx            └─→ googleMapsService
                                ├─ Places API
                                ├─ Distance Matrix
                                └─ Directions API
```

## 🎨 Estados da UI

### Estado: Carregando

```
┌────────────────────────────┐
│  ⏳ Carregando...           │
│                            │
│  [Spinner Animado]         │
│                            │
│  Buscando lojas próximas.. │
└────────────────────────────┘
```

### Estado: Com Resultados

```
┌────────────────────────────┐
│  ✅ 3 Lojas Encontradas    │
│                            │
│  ┌─────────────────────┐   │
│  │ #1 PetShop Central  │   │
│  │ 1.2 km, 5 mins     │   │
│  └─────────────────────┘   │
│                            │
│  ┌─────────────────────┐   │
│  │ #2 PetBoss Store   │   │
│  │ 2.1 km, 8 mins     │   │
│  └─────────────────────┘   │
│                            │
│  ┌─────────────────────┐   │
│  │ #3 Animais & Cia    │   │
│  │ 3.5 km, 12 mins     │   │
│  └─────────────────────┘   │
└────────────────────────────┘
```

### Estado: Erro

```
┌────────────────────────────┐
│  ❌ Erro                    │
│                            │
│  Permissão de localização  │
│  não foi concedida         │
│                            │
│  [Tentar Novamente]        │
└────────────────────────────┘
```

### Estado: Rastreando

```
┌────────────────────────────┐
│  🗺️ Rastreando...          │
│                            │
│  [MAPA COM POLYLINE]       │
│                            │
│  👤 João Silva             │
│  ████░░░░░░░░░░ 40%       │
│                            │
│  [Pausar] [Voltar]         │
└────────────────────────────┘
```

## 🔄 Ciclo de Vida do Hook

```
useNearbyPetShops Hook Lifecycle
═══════════════════════════════════════

MOUNT
  │
  ├─ useState({ shops, loading, error... })
  │
  ├─ useEffect(() => {
  │    if (autoFetch) {
  │      fetchNearbyPetShops()
  │    }
  │  })
  │
  └─ SET: loading = true
     │
     ▼
REQUEST GPS
  ├─ requestForegroundPermissionsAsync()
  ├─ getCurrentPositionAsync()
  └─ SET: userLocation = { lat, lng }
     │
     ▼
CALL APIs
  ├─ googleMapsService.nearbySearch()
  │   └─ Places API
  │
  ├─ googleMapsService.processPetShopsNearby()
  │   └─ Distance Matrix API
  │
  └─ Sort & Top 3
     │
     ▼
SUCCESS
  │
  ├─ SET: shops = PetShop[]
  ├─ SET: loading = false
  ├─ SET: error = null
  │
  └─ RETURN State

ERROR
  │
  ├─ SET: shops = []
  ├─ SET: loading = false
  ├─ SET: error = GoogleMapsError
  │
  └─ RETURN State

CLEANUP
  │
  └─ Component Unmount
     └─ Cancel pending requests
```

## 🚀 Performance Visual

```
TIMING COMPARISON
═════════════════════════════════════════════════════════

Task                Time        Status
─────────────────────────────────────────────────────────

GPS Request         200-500ms   ⚡ Rápido
Places API Call     300-800ms   ⚡ Rápido
Distance Matrix     200-600ms   ⚡ Rápido
Processing          50-100ms    ⚡ Muito Rápido
─────────────────────────────────────────────────────────
TOTAL SEARCH        800-2000ms  ✅ OK (<2s)

Map Rendering       100-300ms   ⚡ Rápido
Polyline Decode     50-100ms    ⚡ Muito Rápido
Animation/Update    16ms (60fps) ⚡ Muito Rápido
─────────────────────────────────────────────────────────
TOTAL TRACKING      200-500ms   ✅ OK
PER UPDATE (1s)     ~16ms       ✅ OK (60fps)
```

---

**Guia Visual Completo - 14 de janeiro de 2026**
