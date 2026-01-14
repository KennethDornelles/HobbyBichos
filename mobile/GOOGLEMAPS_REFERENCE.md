# 📖 Referência Rápida - Google Maps APIs

## 🚀 Imports Essenciais

```typescript
// Hooks
import { useNearbyPetShops } from '../src/hooks/useNearbyPetShops';
import { useDeliveryLocation } from '../src/hooks/useDeliveryLocation';

// Componentes
import DeliveryTracking from '../src/components/DeliveryTracking';

// Serviços
import { getGoogleMapsService } from '../src/services/googleMapsService';

// Tipos
import {
  NearbyPetShopsResult,
  PetShop,
  DeliveryRoute,
  DriverLocation,
  GoogleMapsError,
  PlacesLocation,
} from '../src/types/googlemaps.types';
```

---

## 🎯 Casos de Uso

### 1. Buscar Lojas Próximas

```typescript
const { shops, loading, error, userLocation, refetch } = useNearbyPetShops();

// Resultado:
// shops = [
//   {
//     id: 'place_id_1',
//     name: 'PetShop Central',
//     latitude: -23.5505,
//     longitude: -46.6333,
//     address: 'Rua X, 123, São Paulo',
//     distance: '1.2 km',
//     distance_meters: 1200,
//     duration: '5 mins',
//     duration_seconds: 300,
//     rating: 4.5,
//     user_ratings_total: 250
//   },
//   // ... até 3 lojas
// ]
```

### 2. Carregar Rota de Entrega

```typescript
const mapsService = await getGoogleMapsService();

const route = await mapsService.processDeliveryRoute(
  '-23.5505,-46.6333',  // Origem (loja)
  '-23.5510,-46.6340',  // Destino (cliente)
  'PetShop Central'     // Nome
);

// Resultado:
// route = {
//   destination_name: 'PetShop Central',
//   destination_address: 'Rua Y, 456, São Paulo',
//   destination_lat: -23.5510,
//   destination_lng: -46.6340,
//   origin_lat: -23.5505,
//   origin_lng: -46.6333,
//   polyline: 'c{zvFtqvyT_@...',
//   distance_meters: 500,
//   distance_text: '500 m',
//   duration_seconds: 300,
//   duration_text: '5 mins'
// }
```

### 3. Simular Entrega

```typescript
const { driverLocation, progress, isSimulating, startSimulation, stopSimulation } =
  useDeliveryLocation(route, 300); // 5 minutos de simulação

// Quando startSimulation() é chamado:
// - Simula movimento ao longo do polyline
// - Atualiza a cada 1 segundo
// - driverLocation muda com { latitude, longitude, timestamp }
// - progress vai de 0 a 1
// - Completa automaticamente quando progress == 1.0
```

### 4. Renderizar Mapa com Rastreamento

```typescript
<DeliveryTracking
  route={deliveryRoute}
  driverLocation={driverLocation}
  progress={progress}
  driverName="João Silva"
  height={400}
  autoCenter={true}
  zoomLevel={15}
/>

// Props:
// route: DeliveryRoute           - Obrigatório
// driverLocation: DriverLocation | null - Opcional (null = loading)
// progress: number               - 0 a 1, opcional
// driverName: string             - Nome do entregador, default 'Entregador'
// driverIcon: string             - URL do ícone, opcional
// onMapPress: Function           - Callback, opcional
// height: number                 - Altura em pixels, default 300
// autoCenter: boolean            - Seguir entregador, default true
// zoomLevel: number              - Nível de zoom, default 15
```

---

## 🔄 Fluxo Típico

```typescript
// 1. Buscar lojas
const { shops } = useNearbyPetShops();

// 2. Usuário seleciona loja
const selectedShop = shops[0];

// 3. Carregar rota
const mapsService = await getGoogleMapsService();
const route = await mapsService.processDeliveryRoute(
  `${selectedShop.latitude},${selectedShop.longitude}`,
  '-23.5505,-46.6333', // Cliente
  selectedShop.name
);

// 4. Inicializar rastreamento
const { driverLocation, progress, startSimulation } = useDeliveryLocation(route);

// 5. Renderizar
<DeliveryTracking route={route} driverLocation={driverLocation} progress={progress} />

// 6. Iniciar simulação
<Button onPress={startSimulation} title="Iniciar" />
```

---

## ⚠️ Tratamento de Erros

```typescript
import { GoogleMapsError } from '../src/types/googlemaps.types';

const { shops, error } = useNearbyPetShops();

if (error) {
  switch (error.type) {
    case 'LOCATION_ERROR':
      // GPS não disponível ou permissão negada
      Alert.alert('Ativar Localização', 'Permita acesso ao GPS');
      break;

    case 'PLACES_API':
      if (error.status === 'ZERO_RESULTS') {
        Alert.alert('Sem Lojas', 'Nenhuma loja próxima');
      } else if (error.status === 'OVER_QUERY_LIMIT') {
        Alert.alert('Limite', 'Muitas requisições');
      }
      break;

    case 'DISTANCE_MATRIX':
      Alert.alert('Erro', 'Erro ao calcular distâncias');
      break;

    case 'DIRECTIONS_API':
      Alert.alert('Erro', 'Erro ao obter rota');
      break;

    default:
      Alert.alert('Erro', error.error_message);
  }
}
```

---

## 🎛️ Opções Configuráveis

### useNearbyPetShops

```typescript
// Parâmetros
const result = useNearbyPetShops(
  radiusMeters = 5000,  // Raio em metros
  autoFetch = true      // Buscar ao montar?
);

// Exemplos
useNearbyPetShops();              // Default: 5km, busca automática
useNearbyPetShops(10000);          // 10km
useNearbyPetShops(5000, false);    // Sem busca automática (chamar refetch())
```

### useDeliveryLocation

```typescript
// Parâmetros
const result = useDeliveryLocation(
  route,                           // Obrigatório
  simulationDurationSeconds = null, // Override de duração
  updateIntervalMs = 1000          // Intervalo de update
);

// Exemplos
useDeliveryLocation(route);                  // Default: 1s updates
useDeliveryLocation(route, 600);             // 10 minutos de simulação
useDeliveryLocation(route, null, 500);       // Updates a cada 500ms
```

### DeliveryTracking

```typescript
// Componente - veja exemplos em Props acima
```

---

## 📊 Tipos de Retorno

### PetShop

```typescript
interface PetShop {
  id: string;                    // place_id
  name: string;
  place_id: string;
  latitude: number;
  longitude: number;
  address: string;
  distance: string;              // ex: "1.2 km"
  distance_meters: number;
  duration: string;              // ex: "5 mins"
  duration_seconds: number;
  rating?: number;               // ex: 4.5
  user_ratings_total?: number;
  phone?: string;
  icon?: string;
}
```

### DeliveryRoute

```typescript
interface DeliveryRoute {
  destination_name: string;
  destination_address: string;
  destination_lat: number;
  destination_lng: number;
  origin_lat: number;
  origin_lng: number;
  polyline: string;              // Encoded polyline
  distance_meters: number;
  distance_text: string;
  duration_seconds: number;
  duration_text: string;
}
```

### DriverLocation

```typescript
interface DriverLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;             // milliseconds
}
```

### GoogleMapsError

```typescript
interface GoogleMapsError {
  status: string;
  error_message?: string;
  type: 'PLACES_API' | 'DISTANCE_MATRIX' | 'DIRECTIONS_API' | 'LOCATION_ERROR' | 'UNKNOWN';
}
```

---

## 🎮 Métodos do Serviço

### getGoogleMapsService()

```typescript
const service = await getGoogleMapsService();

// Métodos:

// 1. nearbySearch(location, radiusMeters?)
const result = await service.nearbySearch(
  { lat: -23.5505, lng: -46.6333 },
  5000
);
// Returns: NearbySearchResponse

// 2. distanceMatrix(origins[], destinations[])
const result = await service.distanceMatrix(
  ['-23.5505,-46.6333'],
  ['-23.5510,-46.6340', '-23.5520,-46.6350']
);
// Returns: DistanceMatrixResponse

// 3. getDirections(origin, destination)
const result = await service.getDirections(
  '-23.5505,-46.6333',
  '-23.5510,-46.6340'
);
// Returns: DirectionsResponse

// 4. processPetShopsNearby(location, places)
const shops = await service.processPetShopsNearby(
  { lat: -23.5505, lng: -46.6333 },
  placesResults.results
);
// Returns: PetShop[]

// 5. processDeliveryRoute(origin, destination, name?)
const route = await service.processDeliveryRoute(
  '-23.5505,-46.6333',
  '-23.5510,-46.6340',
  'PetShop Central'
);
// Returns: DeliveryRoute
```

---

## 🔧 Callbacks e States

### useNearbyPetShops States

```typescript
{
  shops: PetShop[];           // Array de lojas
  loading: boolean;            // Carregando?
  error: GoogleMapsError | null; // Erro?
  userLocation: PlacesLocation | null; // Localização do usuário
  refetch: () => Promise<void>; // Função para atualizar
}
```

### useDeliveryLocation States

```typescript
{
  driverLocation: DriverLocation | null; // Localização atual
  isSimulating: boolean;                  // Simulando?
  progress: number;                       // 0 a 1
  startSimulation: () => void;           // Iniciar
  stopSimulation: () => void;            // Parar
  updateDriverLocation: (loc) => void;  // Atualizar (Firebase)
}
```

---

## 📍 Coordenadas Comuns (Testes)

```typescript
// São Paulo
const SPCenter = { lat: -23.5505, lng: -46.6333 };

// Rio de Janeiro
const RJCenter = { lat: -22.9068, lng: -43.1729 };

// Belo Horizonte
const BHCenter = { lat: -19.9191, lng: -43.9386 };

// Brasília
const BSBCenter = { lat: -15.7942, lng: -47.8822 };

// Salvador
const SSACenter = { lat: -12.9714, lng: -38.5014 };

// Formato para API:
// `${lat},${lng}` → "-23.5505,-46.6333"
```

---

## ✅ Checklist de Uso

- [ ] Importar hook
- [ ] Chamar hook com opções
- [ ] Verificar loading
- [ ] Verificar error
- [ ] Usar dados quando prontos
- [ ] Tratar permissões de localização
- [ ] Testar em dispositivo real

---

## 🔗 Links Úteis

- [Google Maps Platform Docs](https://developers.google.com/maps)
- [Places API Reference](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Distance Matrix API](https://developers.google.com/maps/documentation/distance-matrix)
- [Directions API](https://developers.google.com/maps/documentation/directions)
- [Polyline Encoding](https://developers.google.com/maps/documentation/utilities/polylinealgorithm)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)

---

## 💡 Dicas

1. **Otimizar raio de busca**: Começar pequeno (2km), depois aumentar
2. **Usar coordenadas formato string**: `"lat,lng"` para API
3. **Testar com dados conhecidos**: Use coordenadas de teste
4. **Monitorar cotas**: Verificar Google Cloud Console regularmente
5. **Cache de rotas**: Reutilize rotas para mesmos destinos
6. **Erros de permissão**: Sempre pedir localização com feedback

---

**Referência Rápida - v1.0 - 14/01/2026**
