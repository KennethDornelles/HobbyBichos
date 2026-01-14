import { useEffect, useState, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { api } from '../services/api';
import { PetShop, PlacesLocation, GoogleMapsError } from '../types/googlemaps.types';

/**
 * Interface para cache de lojas próximas
 */
interface NearbyShopsCache {
  shops: PetShop[];
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface UseNearbyPetShopsState {
  shops: PetShop[];
  loading: boolean;
  error: GoogleMapsError | null;
  userLocation: PlacesLocation | null;
  refetch: () => Promise<void>;
  isCached: boolean;
}

/**
 * Hook para buscar as 3 lojas de pet shop mais próximas com cache inteligente
 * Utiliza GPS do dispositivo + endpoint de lojas próximas do backend
 * 
 * Cache inteligente:
 * - Armazena as lojas em memória
 * - Só refaz a requisição se a localização mudou mais de `distanceThresholdMeters`
 * - Limpa cache se expirar (padrão: 30 minutos)
 *
 * @param radiusKm Raio de busca em quilômetros (padrão: 5)
 * @param autoFetch Se deve buscar automaticamente ao montar (padrão: true)
 * @param distanceThresholdMeters Distância em metros para atualizar cache (padrão: 500m)
 * @param cacheExpirationMinutes Tempo em minutos antes do cache expirar (padrão: 30min)
 * @returns Estado com lojas, loading, erro, função de atualização e flag isCached
 *
 * @example
 * const { shops, loading, error, userLocation, refetch, isCached } = useNearbyPetShops();
 * if (loading) return <Text>Buscando lojas...</Text>;
 * if (error) return <Text>Erro: {error.error_message}</Text>;
 * return shops.map(shop => <Text key={shop.id}>{shop.name} {isCached && '(em cache)'}</Text>);
 */
export const useNearbyPetShops = (
  radiusKm: number = 5,
  autoFetch: boolean = true,
  distanceThresholdMeters: number = 500,
  cacheExpirationMinutes: number = 30,
): UseNearbyPetShopsState => {
  const [shops, setShops] = useState<PetShop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<GoogleMapsError | null>(null);
  const [userLocation, setUserLocation] = useState<PlacesLocation | null>(null);
  const [isCached, setIsCached] = useState(false);
  
  // Usar useRef para cache em memória que persiste entre re-renders
  const cacheRef = useRef<NearbyShopsCache | null>(null);

  /**
   * Calcula a distância entre dois pontos usando fórmula Haversine (em metros)
   */
  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371000; // Raio da Terra em metros
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    [],
  );

  /**
   * Verifica se deve atualizar o cache baseado na localização
   */
  const shouldUpdateCache = useCallback(
    (currentLat: number, currentLon: number): boolean => {
      // Se não tem cache, atualizar
      if (!cacheRef.current) return true;

      // Verificar se o cache expirou
      const cacheAge = Date.now() - cacheRef.current.timestamp;
      const cacheExpirationMs = cacheExpirationMinutes * 60 * 1000;
      if (cacheAge > cacheExpirationMs) {
        console.log('Cache expirado, atualizando...');
        return true;
      }

      // Calcular distância entre posição atual e cached
      const distance = calculateDistance(
        cacheRef.current.latitude,
        cacheRef.current.longitude,
        currentLat,
        currentLon,
      );

      // Atualizar se distância > threshold
      const shouldUpdate = distance > distanceThresholdMeters;
      if (shouldUpdate) {
        console.log(
          `Localização mudou ${distance.toFixed(0)}m (threshold: ${distanceThresholdMeters}m), atualizando...`,
        );
      } else {
        console.log(
          `Usando cache (distância: ${distance.toFixed(0)}m < ${distanceThresholdMeters}m)`,
        );
      }

      return shouldUpdate;
    },
    [calculateDistance, distanceThresholdMeters, cacheExpirationMinutes],
  );

  /**
   * Obtém a localização do usuário
   */
  const getUserLocation = useCallback(async (): Promise<PlacesLocation | null> => {
    try {
      // Verifica permissão
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        const locationError: GoogleMapsError = {
          status: 'REQUEST_DENIED',
          error_message: 'Permissão de localização negada pelo usuário',
          type: 'LOCATION_ERROR',
        };
        setError(locationError);
        return null;
      }

      // Obtém localização
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const userLoc: PlacesLocation = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };

      return userLoc;
    } catch (err) {
      const locationError: GoogleMapsError = {
        status: 'UNKNOWN_ERROR',
        error_message: err instanceof Error ? err.message : 'Erro ao obter localização',
        type: 'LOCATION_ERROR',
      };
      setError(locationError);
      return null;
    }
  }, []);

  /**
   * Busca os pet shops próximos via API do backend com cache inteligente
   */
  const fetchNearbyPetShops = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Obtém localização do usuário
      const location = await getUserLocation();
      if (!location) {
        setLoading(false);
        return;
      }

      setUserLocation(location);

      // 2. Verificar se deve usar cache
      if (
        cacheRef.current &&
        !shouldUpdateCache(location.lat, location.lng)
      ) {
        // Usar cache
        setShops(cacheRef.current.shops);
        setIsCached(true);
        setLoading(false);
        return;
      }

      // 3. Busca lojas próximas no backend (não usar cache)
      const response = await api.get('/stores/nearby/search', {
        params: {
          latitude: location.lat,
          longitude: location.lng,
          radius: radiusKm,
          limit: 3,
        },
      });

      // 4. Formata os dados para o tipo PetShop
      const stores = response.data || [];
      const formattedShops: PetShop[] = stores.map(
        (store: any) => ({
          id: store.id,
          name: store.name,
          latitude: store.latitude,
          longitude: store.longitude,
          rating: 5.0, // Será preenchido depois se disponível
          address: store.address || 'Endereço não disponível',
          distance: store.distance || 0,
          distance_text: store.distanceText || `${store.distance?.toFixed(1)}km`,
          duration: store.durationMinutes || 0,
          duration_text: `${store.durationMinutes || 0} min`,
          opening_hours: store.openingHours,
          photos: store.photos || [],
          place_id: store.id,
          types: ['establishment', 'point_of_interest'],
        })
      );

      // 5. Atualizar cache
      cacheRef.current = {
        shops: formattedShops,
        latitude: location.lat,
        longitude: location.lng,
        timestamp: Date.now(),
      };

      setShops(formattedShops);
      setIsCached(false);
      setError(null);
    } catch (err) {
      const mappedError: GoogleMapsError = {
        status: 'UNKNOWN_ERROR',
        error_message: err instanceof Error ? err.message : 'Erro ao buscar lojas próximas',
        type: 'PLACES_API',
      };
      setError(mappedError);
      setShops([]);
      console.error('Erro em useNearbyPetShops:', mappedError);
    } finally {
      setLoading(false);
    }
  }, [radiusKm, getUserLocation, shouldUpdateCache]);

  /**
   * Busca automaticamente ao montar se autoFetch for true
   */
  useEffect(() => {
    if (autoFetch) {
      fetchNearbyPetShops();
    }
  }, [autoFetch, fetchNearbyPetShops]);

  return {
    shops,
    loading,
    error,
    userLocation,
    refetch: fetchNearbyPetShops,
    isCached,
  };
};

export default useNearbyPetShops;
