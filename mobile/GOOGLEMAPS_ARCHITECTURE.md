# 🏗️ Arquitetura - Google Maps Integration

## 📊 Fluxo de Dados

### 1️⃣ Busca de Lojas Próximas (useNearbyPetShops)

```
┌─────────────────────────────────────────────────────────────────┐
│                        App Component                             │
│  const { shops, loading, error } = useNearbyPetShops()         │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│               useNearbyPetShops Hook                            │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 1. Request Foreground Permissions                        │ │
│  │    └─> expo-location.requestForegroundPermissionsAsync()│ │
│  └──────────────────────────────────────────────────────────┘ │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 2. Get Current Position                                 │ │
│  │    └─> expo-location.getCurrentPositionAsync()        │ │
│  │        Returns: { lat, lng }                            │ │
│  └──────────────────────────────────────────────────────────┘ │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 3. Initialize Google Maps Service                        │ │
│  │    └─> getGoogleMapsService()                           │ │
│  └──────────────────────────────────────────────────────────┘ │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 4. Nearby Search API Call                                │ │
│  │    └─> mapsService.nearbySearch(location, radius)       │ │
│  └──────────────────────────────────────────────────────────┘ │
│         │                                                       │
│         ▼                                                       │
└─────────────────────────────────────────────────────────────────┘
                       │
         ┌─────────────┴──────────────┐
         ▼                            ▼
    (OK Status)               (Error Status)
         │                            │
         ▼                            ▼
┌──────────────────────────────┐  ┌──────────────────────────────┐
│ 5. Distance Matrix API       │  │ Return Error State           │
│    Process all results       │  │ { shops: [], error: {...} }  │
│    mapsService.             │  └──────────────────────────────┘
│    processPetShopsNearby()   │
│    └─ Sort by distance       │
│    └─ Return top 3 shops     │
└──────────────────────────────┘
         │
         ▼
    Set State:
    {
      shops: PetShop[],
      loading: false,
      error: null,
      userLocation: PlacesLocation,
      refetch: Function
    }
```

---

### 2️⃣ Rastreamento de Entrega (useDeliveryLocation + DeliveryTracking)

```
┌─────────────────────────────────────────────────────────────────┐
│               App Component                                      │
│   - Route loaded from googleMapsService.processDeliveryRoute()  │
│   - useDeliveryLocation hook initialized with route              │
│   - startSimulation() called                                     │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│            useDeliveryLocation Hook                             │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 1. Initialize Simulation                               │ │
│  │    - Decode polyline (Google Maps encoded string)      │ │
│  │    - Extract all waypoints                             │ │
│  │    - Set start time                                    │ │
│  │    - Position driver at origin                         │ │
│  └──────────────────────────────────────────────────────────┘ │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 2. Start Simulation Loop (every 1s)                    │ │
│  │    - Calculate elapsed time                            │ │
│  │    - Calculate progress (0 to 1)                       │ │
│  │    - Find current segment                              │ │
│  │    - Interpolate position                              │ │
│  │    - Update driver location state                      │ │
│  └──────────────────────────────────────────────────────────┘ │
│         │                                                       │
│         ▼                                                       │
└─────────────────────────────────────────────────────────────────┘
                       │
                       ▼ (every 1000ms)
┌─────────────────────────────────────────────────────────────────┐
│            State Update                                          │
│  {                                                              │
│    driverLocation: {                                           │
│      latitude: number,      // Interpolated               │
│      longitude: number,     // Interpolated               │
│      timestamp: number      // Current time                │
│    },                                                         │
│    isSimulating: boolean,                                     │
│    progress: number (0-1)                                     │
│  }                                                             │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│           DeliveryTracking Component                           │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 1. Render MapView (PROVIDER_GOOGLE)                    │ │
│  │    └─ Native Android rendering (gratuito)              │ │
│  └──────────────────────────────────────────────────────────┘ │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 2. Render Polyline                                      │ │
│  │    - Decode route.polyline                             │ │
│  │    - Display as blue line                              │ │
│  │    - Color: #3B82F6                                     │ │
│  └──────────────────────────────────────────────────────────┘ │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 3. Render Markers                                       │ │
│  │    ┌──────────────┐      ┌──────────────┐              │ │
│  │    │ Destination  │      │   Driver     │              │ │
│  │    │ Marker       │      │   Marker     │              │ │
│  │    │ Fixed (Red)  │      │ Animated     │              │ │
│  │    │              │      │ (Blue)       │              │ │
│  │    │ Location:    │      │              │              │ │
│  │    │ destination_ │      │ Location:    │              │ │
│  │    │ lat/lng      │      │ driver       │              │ │
│  │    │              │      │ Location     │              │ │
│  │    └──────────────┘      └──────────────┘              │ │
│  └──────────────────────────────────────────────────────────┘ │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 4. Auto-Center                                          │ │
│  │    - Animate to driver location                        │ │
│  │    - Smooth transitions                                │ │
│  │    - Every update                                      │ │
│  └──────────────────────────────────────────────────────────┘ │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 5. Render Info Overlay                                  │ │
│  │    - Driver name                                        │ │
│  │    - Progress bar (0% to 100%)                          │ │
│  │    - Progress percentage                               │ │
│  │    - Duration text                                     │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo Integrado Completo

```
                    User Navigation
                            │
                            ▼
                ┌─────────────────────────┐
                │  Lojas Próximas Tab     │
                │                         │
                │ useNearbyPetShops()     │
                │  ↓                      │
                │ Fetch 3 stores         │
                │  ↓                      │
                │ Show list              │
                │  ↓                      │
                │ User tap store         │
                └────────┬────────────────┘
                         │
                         ▼
            ┌──────────────────────────────┐
            │  Load Delivery Route         │
            │                              │
            │  googleMapsService.          │
            │  processDeliveryRoute()      │
            │   ↓ Calls Directions API     │
            │   ↓ Returns polyline, etc    │
            └───────┬──────────────────────┘
                    │
                    ▼
        ┌─────────────────────────────┐
        │  Show Rastreamento Tab      │
        │                             │
        │  useDeliveryLocation()      │
        │   ↓                         │
        │  DeliveryTracking           │
        │   Component                 │
        │   ↓                         │
        │  Render Map                 │
        │  - Polyline                 │
        │  - Markers                  │
        │  - Overlay                  │
        └─────────┬───────────────────┘
                  │
                  ▼
        ┌─────────────────────────────┐
        │  Simulate Movement          │
        │  startSimulation()          │
        │                             │
        │  Loop every 1s:            │
        │  1. Calc elapsed time      │
        │  2. Get progress           │
        │  3. Interpolate position   │
        │  4. Update driver marker   │
        │  5. Update progress bar    │
        │                             │
        │  Until progress = 1.0      │
        └────────────────────────────┘
```

---

## 📦 Component Tree

```
App (expo-router)
│
├── app/googlemaps-test.tsx (Tela de Teste)
│   │
│   ├── Tab: "Lojas Próximas"
│   │   │
│   │   └── useNearbyPetShops()
│   │       ├── expo-location (GPS)
│   │       └── googleMapsService
│   │           ├── nearbySearch() [Places API]
│   │           └── distanceMatrix() [Distance Matrix API]
│   │
│   └── Tab: "Rastreamento"
│       │
│       └── useDeliveryLocation()
│           └── DeliveryTracking
│               └── MapView (PROVIDER_GOOGLE)
│                   ├── Polyline
│                   ├── Marker (Destination)
│                   ├── Marker (Driver)
│                   └── InfoOverlay
│
└── Outras Telas
    │
    ├── Stores Screen
    │   └── useNearbyPetShops()
    │
    ├── Tracking Screen
    │   ├── useDeliveryLocation()
    │   └── DeliveryTracking
    │
    └── Order Screen (Integrado)
        ├── useNearbyPetShops()
        ├── useDeliveryLocation()
        ├── DeliveryTracking
        └── googleMapsService
```

---

## 📱 API Integration

```
┌───────────────────────────────────────────────────────────┐
│                 Google Maps Platform APIs                │
└───────────────────────────────────────────────────────────┘
              │              │              │
              ▼              ▼              ▼
    ┌─────────────┐ ┌──────────────┐ ┌──────────────┐
    │Places API   │ │Distance      │ │ Directions   │
    │             │ │Matrix API    │ │ API          │
    │ Nearby      │ │              │ │              │
    │ Search      │ │ - Distância  │ │ - Polyline   │
    │             │ │ - Tempo      │ │ - Steps      │
    │ Returns:    │ │              │ │ - Bounds     │
    │ - name      │ │ Returns:     │ │              │
    │ - coords    │ │ - distance   │ │ Returns:     │
    │ - rating    │ │ - duration   │ │ - route      │
    │ - address   │ └──────────────┘ │ - overview   │
    │             │                  │   polyline   │
    └─────────────┘                  └──────────────┘
         │                                  │
         └──────────────┬───────────────────┘
                        ▼
        ┌──────────────────────────────┐
        │  googleMapsService.ts        │
        │  (Request Handler)           │
        │                              │
        │  - API Key Management        │
        │  - Error Handling            │
        │  - Response Processing       │
        │  - Singleton Pattern         │
        └──────────┬───────────────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
    Hooks              Components
    ┌──────────────┐  ┌──────────────┐
    │useNearby     │  │Delivery      │
    │PetShops      │  │Tracking      │
    │              │  │              │
    │useDelivery   │  │MapView       │
    │Location      │  │Polyline      │
    │              │  │Markers       │
    └──────────────┘  │InfoOverlay   │
                      └──────────────┘
```

---

## 🔄 State Management Flow

```
┌─────────────────────────────────────────────────────────┐
│         Redux Store (if applicable)                    │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│    Local Component State (Current Implementation)      │
│                                                        │
│  App Component                                        │
│  ├─ activeTab: 'nearby' | 'delivery'                 │
│  ├─ selectedShop: PetShop | null                     │
│  ├─ deliveryRoute: DeliveryRoute | null             │
│  └─ deliveryLoading: boolean                         │
│                                                        │
│  useNearbyPetShops Hook                              │
│  ├─ shops: PetShop[]                                 │
│  ├─ loading: boolean                                 │
│  ├─ error: GoogleMapsError | null                   │
│  ├─ userLocation: PlacesLocation | null             │
│  └─ refetch: Function                                │
│                                                        │
│  useDeliveryLocation Hook                            │
│  ├─ driverLocation: DriverLocation | null           │
│  ├─ isSimulating: boolean                           │
│  ├─ progress: number (0-1)                          │
│  └─ ...controls                                      │
└─────────────────────────────────────────────────────────┘
```

---

## 📈 Performance Optimization

```
┌──────────────────────────────────────────────────────────┐
│              Optimization Strategies                    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ 1. API Call Reduction                                  │
│    ─────────────────────────────────                   │
│    - Nearby Search: 1 call                            │
│    - Distance Matrix: 1 call (3 destinations)         │
│    - Directions: 1 call                               │
│    Total: 3 calls per search                          │
│                                                          │
│ 2. Polyline Decoding                                  │
│    ─────────────────────                              │
│    - Decode once in hook                             │
│    - Reuse decoded points                            │
│    - No recalc on re-renders                         │
│                                                          │
│ 3. Memoization                                        │
│    ──────────────                                      │
│    - useMemo for decoded polyline                    │
│    - useCallback for handlers                        │
│    - useRef for timer management                     │
│                                                          │
│ 4. State Updates                                      │
│    ──────────────                                      │
│    - Simulation: 1 update per second                 │
│    - Minimal state tree                              │
│    - No unnecessary re-renders                       │
│                                                          │
│ 5. Component Splitting                               │
│    ────────────────────                               │
│    - Separate hooks from components                  │
│    - Independent state management                    │
│    - Lazy rendering of tabs                          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Layers

```
┌──────────────────────────────────────────────────────┐
│          API Key Management                        │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Development                 Production            │
│  ───────────                 ──────────             │
│  .env.local              →   SecureStore          │
│  EXPO_PUBLIC_*KEY           getItemAsync()         │
│                                                      │
│  Fallback Chain:                                    │
│  1. Try SecureStore first                         │
│  2. Try environment var                           │
│  3. Throw error if not found                      │
│                                                      │
│  Restrictions (Optional):                          │
│  - Bundle ID (iOS)                                │
│  - SHA-1 Fingerprint (Android)                    │
│  - API limits (per month)                         │
│  - Referrer restrictions                          │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Summary

```
GPS Input
   ↓
expo-location.getCurrentPosition()
   ↓
User Location { lat, lng }
   ↓
├─→ Places API (Nearby Search)
│     ↓
│   Results Array
│     ↓
├─→ Distance Matrix API
│     ↓
│   Distance + Duration
│     ↓
│   Sort & Top 3
│     ↓
│   PetShop[] Output
│
└─→ Directions API (for selected shop)
      ↓
    Route with Polyline
      ↓
    Decode Polyline
      ↓
    Simulate Movement
      ↓
    Update Driver Location (every 1s)
      ↓
    Render on Map
```

---

**Documentação de Arquitetura - 14 de janeiro de 2026**
