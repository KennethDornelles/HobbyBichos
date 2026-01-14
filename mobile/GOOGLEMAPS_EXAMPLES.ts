/**
 * Exemplos prontos para usar em diferentes telas
 * Copie e adapte conforme necessário
 */

// ============= EXEMPLO 1: Lista Simples de Lojas =============
// Copie para: app/stores-nearby.tsx

import React from 'react';
import { View, FlatList, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useNearbyPetShops } from '../src/hooks/useNearbyPetShops';

export default function StoresNearbyScreen() {
  const { shops, loading, error, userLocation, refetch } = useNearbyPetShops();

  const handleSelectStore = (shopId: string) => {
    // Aqui você pode navegar para detalhes da loja ou iniciar rastreamento
    console.log('Loja selecionada:', shopId);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Buscando lojas próximas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error.error_message}</Text>
        <TouchableOpacity style={styles.button} onPress={refetch}>
          <Text style={styles.buttonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={shops}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <TouchableOpacity
          style={styles.shopItem}
          onPress={() => handleSelectStore(item.id)}
        >
          <Text style={styles.rankBadge}>#{index + 1}</Text>
          <View style={styles.shopContent}>
            <Text style={styles.shopName}>{item.name}</Text>
            <Text style={styles.shopAddress}>{item.address}</Text>
            <View style={styles.shopMeta}>
              <Text style={styles.metaItem}>📏 {item.distance}</Text>
              <Text style={styles.metaItem}>⏱️ {item.duration}</Text>
              {item.rating && <Text style={styles.metaItem}>⭐ {item.rating.toFixed(1)}</Text>}
            </View>
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma loja encontrada</Text>}
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 8, color: '#666' },
  errorText: { color: '#DC2626', marginBottom: 16 },
  button: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#3B82F6', borderRadius: 6 },
  buttonText: { color: '#fff', fontWeight: '600' },
  shopItem: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  rankBadge: { fontSize: 18, fontWeight: '700', color: '#3B82F6', marginRight: 12 },
  shopContent: { flex: 1 },
  shopName: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  shopAddress: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  shopMeta: { flexDirection: 'row', marginTop: 8, gap: 12 },
  metaItem: { fontSize: 11, color: '#6B7280' },
  emptyText: { textAlign: 'center', marginTop: 32, color: '#6B7280' },
});

// ============= EXEMPLO 2: Rastreamento com Simulação =============
// Copie para: app/tracking-demo.tsx

import React, { useState } from 'react';
import { View, Button, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useDeliveryLocation } from '../src/hooks/useDeliveryLocation';
import DeliveryTracking from '../src/components/DeliveryTracking';
import { getGoogleMapsService } from '../src/services/googleMapsService';
import { DeliveryRoute } from '../src/types/googlemaps.types';

export default function TrackingDemoScreen() {
  const [route, setRoute] = useState<DeliveryRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const { driverLocation, isSimulating, progress, startSimulation, stopSimulation } =
    useDeliveryLocation(route);

  const loadRoute = async () => {
    setLoading(true);
    try {
      const mapsService = await getGoogleMapsService();
      const deliveryRoute = await mapsService.processDeliveryRoute(
        '-23.5505,-46.6333', // São Paulo (origem/loja)
        '-23.5510,-46.6340', // Um bloco adiante (cliente)
        'PetShop Central'
      );
      setRoute(deliveryRoute);
    } catch (error) {
      console.error('Erro ao carregar rota:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadRoute();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text>Carregando rota...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {route && (
        <>
          <DeliveryTracking
            route={route}
            driverLocation={driverLocation}
            progress={progress}
            driverName="João Silva"
            height={400}
          />
          <View style={styles.controls}>
            <Button
              title={isSimulating ? 'Pausar' : 'Iniciar Simulação'}
              color={isSimulating ? '#EF4444' : '#3B82F6'}
              onPress={isSimulating ? stopSimulation : startSimulation}
            />
            <Text style={styles.progressText}>Progresso: {Math.round(progress * 100)}%</Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  controls: { padding: 16, gap: 12 },
  progressText: { textAlign: 'center', color: '#666', marginTop: 8 },
});

// ============= EXEMPLO 3: Integração com Pedido =============
// Usa em contexto de um pedido real

import { getGoogleMapsService } from '../src/services/googleMapsService';
import { useDeliveryLocation } from '../src/hooks/useDeliveryLocation';

async function startOrderTracking(orderId: string, storeCoords: string, customerCoords: string) {
  try {
    // Obter rota
    const mapsService = await getGoogleMapsService();
    const route = await mapsService.processDeliveryRoute(
      storeCoords,
      customerCoords,
      'Seu Pedido'
    );

    // Atualizar estado
    setDeliveryRoute(route);

    // Iniciar simulação/rastreamento real
    startSimulation();
  } catch (error) {
    console.error('Erro ao rastrear pedido:', error);
  }
}

// ============= EXEMPLO 4: Com Firebase Realtime (Futuro) =============
// Estrutura pronta para integração com Firebase

import { getGoogleMapsService } from '../src/services/googleMapsService';

// Hook customizado para Firebase
export const useFirebaseDeliveryTracking = (orderId: string) => {
  const [route, setRoute] = useState(null);
  const { updateDriverLocation } = useDeliveryLocation(route);

  React.useEffect(() => {
    // Conectar ao Firebase listener
    const unsubscribe = firebaseDB
      .ref(`deliveries/${orderId}/location`)
      .on('value', (snapshot) => {
        const liveLocation = snapshot.val();
        if (liveLocation) {
          // Atualizar localização em tempo real
          updateDriverLocation({
            latitude: liveLocation.lat,
            longitude: liveLocation.lng,
            timestamp: Date.now(),
          });
        }
      });

    return () => unsubscribe();
  }, [orderId]);

  return { route, updateDriverLocation };
};

// ============= EXEMPLO 5: Erro Handling Completo =============

import { GoogleMapsError } from '../src/types/googlemaps.types';

function handleGoogleMapsError(error: GoogleMapsError) {
  switch (error.status) {
    case 'REQUEST_DENIED':
      Alert.alert('Permissão Negada', 'Ative a permissão de localização nas configurações');
      break;
    case 'ZERO_RESULTS':
      Alert.alert('Sem Resultados', 'Nenhuma loja próxima encontrada');
      break;
    case 'OVER_QUERY_LIMIT':
      Alert.alert('Limite Atingido', 'Você atingiu o limite de requisições. Tente mais tarde');
      break;
    case 'INVALID_REQUEST':
      Alert.alert('Requisição Inválida', 'Verifique sua localização');
      break;
    default:
      Alert.alert('Erro', error.error_message || 'Erro ao acessar Google Maps');
  }
}
