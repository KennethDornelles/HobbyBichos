# 🗺️ Google Maps Integration - PetBoss App

Guia completo de implementação das funcionalidades de Google Maps para rastreamento de entrega e busca de lojas próximas.

## 📋 Índice

1. [Dependências](#dependências)
2. [Configuração](#configuração)
3. [Funcionalidades](#funcionalidades)
4. [Arquivos Criados](#arquivos-criados)
5. [Como Usar](#como-usar)
6. [Exemplos](#exemplos)
7. [Otimizações](#otimizações)

---

## 📦 Dependências

As seguintes dependências já devem estar instaladas no projeto:

```bash
npx expo install react-native-maps expo-location
```

Se não estiverem instaladas, execute:

```bash
cd mobile
npm install react-native-maps expo-location
```

**Versões recomendadas:**
- `react-native-maps`: ^1.4.0+
- `expo-location`: ^16.0.0+
- `axios`: ^1.13.2+ (já incluído)

---

## ⚙️ Configuração

### 1. Google Maps API Key

#### 1.1 Obter a API Key

1. Acesse: https://console.cloud.google.com
2. Crie um novo projeto ou selecione um existente
3. Acesse "APIs & Services" > "Library"
4. Procure e ative as seguintes APIs:
   - **Places API** (para busca de pet shops)
   - **Distance Matrix API** (para cálculo de distâncias)
   - **Directions API** (para rotas)
   - **Maps SDK for Android** (gratuito - renderização de mapas)

5. Crie uma **API Key** em "APIs & Services" > "Credentials"
6. Configure restrições de chave (opcional para segurança):
   - Android: Adicione a impressão digital do seu certificado
   - iOS: Configure Bundle ID

#### 1.2 Configurar a API Key

**Opção 1: Variável de Ambiente (Recomendado para desenvolvimento)**

1. Copie `.env.local.example` para `.env.local`:
```bash
cp .env.local.example .env.local
```

2. Edite `.env.local` e adicione sua API Key:
```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=sua_api_key_aqui
```

**Opção 2: Armazenamento Seguro (Recomendado para produção)**

A API Key será automaticamente lida do SecureStore se disponível:

```typescript
import * as SecureStore from 'expo-secure-store';

// Armazene a chave assim (em seu backend de configuração):
await SecureStore.setItemAsync('GOOGLE_MAPS_API_KEY', 'sua_api_key');
```

### 2. Configurar app.json (Android)

O arquivo `app.json` já contém as permissões necessárias:

```json
{
  "android": {
    "permissions": [
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.FOREGROUND_SERVICE"
    ],
    "config": {
      "googleMaps": {
        "apiKey": "sua_api_key_aqui"
      }
    }
  }
}
```

---

## 🎯 Funcionalidades

### 1. Busca de Pet Shops Próximos (`useNearbyPetShops`)

**O que faz:**
- Obtém a localização do usuário via GPS
- Busca até 3 pet shops mais próximos em um raio de 5km
- Utiliza a **Places API** para descoberta
- Utiliza a **Distance Matrix API** para calcular distâncias reais

**Retorna:**
```typescript
{
  shops: PetShop[];        // Array com até 3 lojas
  loading: boolean;         // Estado de carregamento
  error: GoogleMapsError;   // Mensagem de erro (se houver)
  userLocation: PlacesLocation; // Coordenadas do usuário
  refetch: () => Promise<void>; // Função para atualizar dados
}
```

### 2. Rastreamento de Entrega em Tempo Real

#### 2.1 Hook: `useDeliveryLocation`

Simula o movimento do entregador ao longo de uma rota:

**O que faz:**
- Decodifica polyline da Directions API
- Simula movimento suave do entregador
- Fornece progresso e localização atual
- Preparado para integração com Firebase/Websockets

**Retorna:**
```typescript
{
  driverLocation: DriverLocation;  // Lat/lng do entregador
  isSimulating: boolean;            // Status da simulação
  progress: number;                 // 0 a 1 (porcentagem)
  startSimulation: () => void;      // Inicia simulação
  stopSimulation: () => void;       // Para simulação
  updateDriverLocation: (loc) => void; // Atualização manual
}
```

#### 2.2 Componente: `DeliveryTracking`

Renderiza o mapa com rastreamento em tempo real:

**Features:**
- Mapa com PROVIDER_GOOGLE (renderização nativa Android)
- Polyline azul da rota
- Marcador fixo no destino (vermelho)
- Marcador animado do entregador (azul)
- Barra de progresso e tempo estimado
- Auto-centralização no entregador

---

## 📁 Arquivos Criados

```
mobile/
├── src/
│   ├── types/
│   │   └── googlemaps.types.ts          # Tipos TypeScript
│   ├── services/
│   │   └── googleMapsService.ts         # Serviço com APIs
│   ├── hooks/
│   │   ├── useNearbyPetShops.ts        # Hook busca de lojas
│   │   └── useDeliveryLocation.ts      # Hook rastreamento
│   └── components/
│       └── DeliveryTracking.tsx         # Componente mapa
├── app/
│   └── googlemaps-test.tsx             # Tela de teste
├── .env.local.example                  # Modelo de variáveis
└── GOOGLEMAPS_SETUP.md                # Este arquivo
```

---

## 🚀 Como Usar

### 1. Buscar Pet Shops Próximos

```typescript
import { useNearbyPetShops } from '../src/hooks/useNearbyPetShops';

export function NearbyStoresScreen() {
  const { shops, loading, error, refetch } = useNearbyPetShops();

  if (loading) return <Text>Carregando...</Text>;
  if (error) return <Text>Erro: {error.error_message}</Text>;

  return (
    <FlatList
      data={shops}
      renderItem={({ item }) => (
        <Text>{item.name} - {item.distance}</Text>
      )}
    />
  );
}
```

### 2. Rastrear Entrega em Tempo Real

```typescript
import { useDeliveryLocation } from '../src/hooks/useDeliveryLocation';
import DeliveryTracking from '../src/components/DeliveryTracking';
import { getGoogleMapsService } from '../src/services/googleMapsService';

export function DeliveryScreen({ orderId }: { orderId: string }) {
  const [route, setRoute] = useState(null);
  
  const { driverLocation, isSimulating, progress, startSimulation } = 
    useDeliveryLocation(route);

  useEffect(() => {
    const loadRoute = async () => {
      const mapsService = await getGoogleMapsService();
      const deliveryRoute = await mapsService.processDeliveryRoute(
        '10.123,-45.456',  // Origem (loja)
        '-10.789,-45.012', // Destino (cliente)
        'João Silva'
      );
      setRoute(deliveryRoute);
    };
    
    loadRoute();
  }, []);

  return (
    <>
      {route && (
        <DeliveryTracking
          route={route}
          driverLocation={driverLocation}
          progress={progress}
          height={400}
        />
      )}
      <Button
        title={isSimulating ? 'Pausar' : 'Iniciar'}
        onPress={startSimulation}
      />
    </>
  );
}
```

---

## 💡 Exemplos

### Exemplo 1: Integração Completa

```typescript
import React from 'react';
import { View, FlatList, TouchableOpacity, Text } from 'react-native';
import { useNearbyPetShops } from '../src/hooks/useNearbyPetShops';
import { useDeliveryLocation } from '../src/hooks/useDeliveryLocation';
import DeliveryTracking from '../src/components/DeliveryTracking';
import { getGoogleMapsService } from '../src/services/googleMapsService';

export default function OrdersScreen() {
  const { shops, loading, error } = useNearbyPetShops(5000);
  const [selectedShop, setSelectedShop] = React.useState(null);
  const [deliveryRoute, setDeliveryRoute] = React.useState(null);
  const { driverLocation, progress, startSimulation } = useDeliveryLocation(deliveryRoute);

  const handleSelectShop = async (shop) => {
    setSelectedShop(shop);
    const mapsService = await getGoogleMapsService();
    const route = await mapsService.processDeliveryRoute(
      `${shop.latitude},${shop.longitude}`,
      '-10.123,-45.456', // Cliente
      'João Silva'
    );
    setDeliveryRoute(route);
  };

  if (loading) return <Text>Carregando...</Text>;

  return (
    <View style={{ flex: 1 }}>
      {!selectedShop ? (
        <FlatList
          data={shops}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelectShop(item)}>
              <Text>{item.name}</Text>
              <Text>{item.distance}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <>
          <DeliveryTracking
            route={deliveryRoute}
            driverLocation={driverLocation}
            progress={progress}
            height={300}
          />
          <TouchableOpacity onPress={startSimulation}>
            <Text>Iniciar Rastreamento</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
```

### Exemplo 2: Com Tratamento de Erros

```typescript
import React from 'react';
import { Alert } from 'react-native';
import { useNearbyPetShops } from '../src/hooks/useNearbyPetShops';

export function SafeNearbyScreen() {
  const { shops, error, refetch } = useNearbyPetShops();

  React.useEffect(() => {
    if (error) {
      Alert.alert('Erro ao buscar lojas', error.error_message, [
        { text: 'Tentar Novamente', onPress: refetch },
        { text: 'Cancelar', style: 'cancel' }
      ]);
    }
  }, [error]);

  return <Text>{shops.length} lojas encontradas</Text>;
}
```

---

## ⚡ Otimizações

### 1. Chamadas de API Reduzidas

- ✅ **Nearby Search**: Feito uma vez por requisição
- ✅ **Distance Matrix**: Combinado em única chamada (3 lojas)
- ✅ **Directions**: Cache automático da rota

**Custo estimado por ciclo:**
- Nearby Search: 1 unidade
- Distance Matrix: 1 unidade (3 destinos)
- Directions: 1 unidade
- **Total: 3 unidades por busca completa**

### 2. Polyline Decoding

O polyline é decodificado apenas uma vez no hook, economizando processamento.

### 3. Caching de Rotas

```typescript
const routeCache = useRef<Map<string, DeliveryRoute>>(new Map());

const getCachedRoute = (key: string) => routeCache.current.get(key);
```

### 4. Limite de Busca

- Apenas 3 pet shops retornados por padrão
- Raio de 5km configurable
- Atualização sob demanda via `refetch()`

### 5. Simulação Eficiente

- Atualização a cada 1 segundo (configurável)
- Interpolação linear entre pontos
- Sem requisições de API durante simulação

---

## 🔒 Segurança

### API Key Protection

**NÃO COMMITTAR** a API Key em arquivos:
- ✅ Use `.env.local`
- ✅ Use SecureStore em produção
- ❌ NÃO coloque em `app.json`
- ❌ NÃO coloque em código

### Restrições de Chave (Recomendado)

No Google Cloud Console:

1. **Android**: Adicionar impressão digital SHA-1
2. **iOS**: Adicionar Bundle ID
3. **APIs**: Limitar a apenas APIs necessárias
4. **Cotas**: Definir limite de requisições

---

## 🧪 Testando

### Tela de Teste

Acesse a rota `/googlemaps-test` para testar as funcionalidades:

```bash
# No app, navegue para:
# googlemaps-test
```

**Features da tela:**
- ✅ Listar 3 lojas mais próximas
- ✅ Ver informações de localização
- ✅ Rastrear entrega com simulação
- ✅ Pausar/Retomar simulação
- ✅ Ver polyline no mapa

---

## 📊 Consumo de Créditos

Com R$ 1.900 ativos:

**Prices (aproximado - variam por país):**
- Places Nearby Search: $0.032 / requisição
- Distance Matrix: $0.005 / requisição
- Directions: $0.005 / requisição

**Estimativa de requisições possíveis:**
- 1 ciclo completo: ~$0.042
- R$ 1.900 = ~45.238 ciclos
- **Aproximadamente 1.000+ horas de uso contínuo**

---

## 🐛 Troubleshooting

### "Google Maps API Key não configurada"

```
✓ Solução: Criar arquivo .env.local com EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
```

### "Permissão de localização negada"

```
✓ Solução: Ir em Configurações > Permissões > Localização > Ativar
```

### "ZERO_RESULTS em Nearby Search"

```
✓ Solução: Aumentar radius ou mudar de localização (pode não ter pet shops próximas)
```

### Mapa não renderiza

```
✓ Solução: Verificar se react-native-maps está instalado
✓ Rebuild: npm run android ou npm run ios
```

---

## 📚 Referências

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
- [Polyline Decoding](https://developers.google.com/maps/documentation/utilities/polylinealgorithm)

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verificar logs via `expo start`
2. Consultar documentação do Google Maps
3. Verificar se API Key tem as APIs ativadas
4. Verificar cotas em Google Cloud Console

---

**Desenvolvido para PetBoss App - 2026**
