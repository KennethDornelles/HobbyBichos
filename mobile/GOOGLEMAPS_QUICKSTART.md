# 🚀 Quick Start - Google Maps + React Native

## Configuração Rápida em 5 Passos

### Passo 1: Instalar Dependências

```bash
cd mobile
npm install
npx expo install react-native-maps expo-location
```

### Passo 2: Obter Google Maps API Key

1. Acesse: https://console.cloud.google.com
2. Crie um projeto (ou selecione um existente)
3. Vá em: APIs & Services > Library
4. Procure e ative:
   - Places API
   - Distance Matrix API
   - Directions API
5. Vá em: APIs & Services > Credentials
6. Crie uma API Key
7. **Copie a chave**

### Passo 3: Configurar .env.local

```bash
# Copie o arquivo exemplo
cp .env.local.example .env.local

# Edite .env.local e adicione sua chave:
# EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=sua_api_key_aqui
```

### Passo 4: Iniciar o App

```bash
# Terminal 1: Iniciar Expo
npx expo start -c

# Terminal 2: Build Android (quando solicitado, pressione 'a')
# Ou execute:
npm run android
```

### Passo 5: Testar

1. Abra o app no emulador/dispositivo
2. Permita acesso à localização
3. Navegue para: `googlemaps-test`
4. Teste as funcionalidades

---

## 🎯 O que Você Tem

### Hooks Prontos

```typescript
import { useNearbyPetShops } from '../src/hooks/useNearbyPetShops';
import { useDeliveryLocation } from '../src/hooks/useDeliveryLocation';

// Buscar 3 lojas próximas
const { shops, loading, error } = useNearbyPetShops();

// Simular movimento do entregador
const { driverLocation, progress, startSimulation } = useDeliveryLocation(route);
```

### Componentes Prontos

```typescript
import DeliveryTracking from '../src/components/DeliveryTracking';

// Renderizar mapa com rastreamento
<DeliveryTracking
  route={route}
  driverLocation={driverLocation}
  progress={progress}
/>
```

### Serviço API

```typescript
import { getGoogleMapsService } from '../src/services/googleMapsService';

const mapsService = await getGoogleMapsService();

// Buscar pet shops
const result = await mapsService.nearbySearch({ lat, lng }, 5000);

// Obter rota
const route = await mapsService.processDeliveryRoute(origin, destination, name);
```

---

## 📝 Exemplo Completo

```typescript
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useNearbyPetShops } from '../src/hooks/useNearbyPetShops';
import { useDeliveryLocation } from '../src/hooks/useDeliveryLocation';
import DeliveryTracking from '../src/components/DeliveryTracking';
import { getGoogleMapsService } from '../src/services/googleMapsService';

export default function OrderScreen() {
  const { shops } = useNearbyPetShops();
  const [route, setRoute] = React.useState(null);
  const { driverLocation, progress, startSimulation } = useDeliveryLocation(route);

  const handleTrackOrder = async (shop) => {
    const mapsService = await getGoogleMapsService();
    const newRoute = await mapsService.processDeliveryRoute(
      `${shop.latitude},${shop.longitude}`,
      '-23.5505,-46.6333', // Cliente
      shop.name
    );
    setRoute(newRoute);
    startSimulation();
  };

  return (
    <View style={{ flex: 1 }}>
      {shops.map(shop => (
        <TouchableOpacity key={shop.id} onPress={() => handleTrackOrder(shop)}>
          <Text>{shop.name}</Text>
        </TouchableOpacity>
      ))}

      {route && (
        <>
          <DeliveryTracking
            route={route}
            driverLocation={driverLocation}
            progress={progress}
            height={300}
          />
        </>
      )}
    </View>
  );
}
```

---

## ⚙️ Troubleshooting Rápido

| Erro | Solução |
|------|---------|
| "API Key não configurada" | Verificar .env.local |
| Mapa em branco | Rebuild: `npm run android` |
| Permissão negada | Ir em Configurações > Apps > Permissões |
| Sem lojas encontradas | Mudar de localização (testar em SP) |

---

## 📚 Documentação Completa

- `GOOGLEMAPS_SETUP.md` - Guia completo
- `GOOGLEMAPS_EXAMPLES.ts` - Exemplos de código
- `GOOGLEMAPS_CHECKLIST.md` - Checklist de verificação

---

## 💰 Custos Estimados

Com R$ 1.900:
- ~45.000 requisições de API
- ~1.000+ horas de simulação contínua

---

**Dúvidas?** Consulte `GOOGLEMAPS_SETUP.md` para documentação completa!
