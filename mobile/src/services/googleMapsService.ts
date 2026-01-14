import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';
import {
  NearbySearchResponse,
  DistanceMatrixResponse,
  DirectionsResponse,
  PlacesLocation,
  GoogleMapsError,
  PetShop,
  DeliveryRoute,
} from '../types/googlemaps.types';

/**
 * Serviço para integração com Google Maps Platform APIs
 * Utiliza: Places API, Distance Matrix API, Directions API
 */
class GoogleMapsService {
  private client: AxiosInstance;
  private apiKey: string | null = null;
  private baseURL = 'https://maps.googleapis.com/maps/api';

  constructor() {
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
    });
  }

  /**
   * Inicializa o serviço com a API Key
   * Lê a API Key armazenada no SecureStore ou do processo (development)
   */
  async initialize(): Promise<void> {
    try {
      // Tenta ler do SecureStore primeiro
      const storedKey = await SecureStore.getItemAsync('GOOGLE_MAPS_API_KEY');
      if (storedKey) {
        this.apiKey = storedKey;
        return;
      }

      // Fallback para env var (development)
      const envKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (envKey) {
        this.apiKey = envKey;
        return;
      }

      console.warn(
        'Google Maps API Key não encontrada. Configure EXPO_PUBLIC_GOOGLE_MAPS_API_KEY no .env ou SecureStore',
      );
    } catch (error) {
      console.error('Erro ao inicializar Google Maps Service:', error);
    }
  }

  /**
   * Valida se a API Key foi configurada
   */
  private ensureApiKey(): void {
    if (!this.apiKey) {
      throw new Error('Google Maps API Key não configurada. Execute initialize() primeiro.');
    }
  }

  /**
   * Nearby Search - Busca locais pet_store em um raio específico
   * @param location Localização atual (lat, lng)
   * @param radiusMeters Raio de busca em metros (padrão: 5000m = 5km)
   * @returns Resposta da Places API com locais encontrados
   */
  async nearbySearch(
    location: PlacesLocation,
    radiusMeters: number = 5000,
  ): Promise<NearbySearchResponse> {
    this.ensureApiKey();

    try {
      const response = await this.client.get<NearbySearchResponse>('/place/nearbysearch/json', {
        params: {
          location: `${location.lat},${location.lng}`,
          radius: radiusMeters,
          type: 'pet_store',
          key: this.apiKey,
          language: 'pt-BR',
        },
      });

      return response.data;
    } catch (error) {
      const err = error as any;
      const errorData: GoogleMapsError = {
        status: err.response?.data?.status || 'UNKNOWN_ERROR',
        error_message: err.response?.data?.error_message || err.message,
        type: 'PLACES_API',
      };
      throw errorData;
    }
  }

  /**
   * Distance Matrix - Calcula distância e tempo entre múltiplos pontos
   * @param origins Array de pontos de origem [lat,lng]
   * @param destinations Array de pontos de destino [lat,lng]
   * @returns Resposta com matriz de distâncias e tempos
   */
  async distanceMatrix(
    origins: string[],
    destinations: string[],
  ): Promise<DistanceMatrixResponse> {
    this.ensureApiKey();

    try {
      const response = await this.client.get<DistanceMatrixResponse>(
        '/distancematrix/json',
        {
          params: {
            origins: origins.join('|'),
            destinations: destinations.join('|'),
            mode: 'driving',
            language: 'pt-BR',
            key: this.apiKey,
          },
        },
      );

      return response.data;
    } catch (error) {
      const err = error as any;
      const errorData: GoogleMapsError = {
        status: err.response?.data?.status || 'UNKNOWN_ERROR',
        error_message: err.response?.data?.error_message || err.message,
        type: 'DISTANCE_MATRIX',
      };
      throw errorData;
    }
  }

  /**
   * Directions - Obtém rota entre dois pontos com polyline
   * @param origin Ponto de origem [lat,lng]
   * @param destination Ponto de destino [lat,lng]
   * @returns Resposta com rota, polyline e detalhes
   */
  async getDirections(origin: string, destination: string): Promise<DirectionsResponse> {
    this.ensureApiKey();

    try {
      const response = await this.client.get<DirectionsResponse>('/directions/json', {
        params: {
          origin,
          destination,
          mode: 'driving',
          alternatives: false,
          language: 'pt-BR',
          key: this.apiKey,
        },
      });

      return response.data;
    } catch (error) {
      const err = error as any;
      const errorData: GoogleMapsError = {
        status: err.response?.data?.status || 'UNKNOWN_ERROR',
        error_message: err.response?.data?.error_message || err.message,
        type: 'DIRECTIONS_API',
      };
      throw errorData;
    }
  }

  /**
   * Processa resultados do Nearby Search para PetShops com distances
   * Ordena por distância e retorna os 3 mais próximos
   * @param location Localização atual
   * @param places Resultados do Nearby Search
   * @returns Array com até 3 pet shops mais próximos
   */
  async processPetShopsNearby(
    location: PlacesLocation,
    places: NearbySearchResponse['results'],
  ): Promise<PetShop[]> {
    if (places.length === 0) {
      return [];
    }

    // Prepara origins (localização do usuário)
    const origins = [`${location.lat},${location.lng}`];

    // Prepara destinations (localizações dos pet shops)
    const destinations = places.map((p) => `${p.geometry.location.lat},${p.geometry.location.lng}`);

    // Chama Distance Matrix API
    const distanceMatrixResponse = await this.distanceMatrix(origins, destinations);

    if (distanceMatrixResponse.status !== 'OK') {
      throw {
        status: distanceMatrixResponse.status,
        error_message: distanceMatrixResponse.error_message,
        type: 'DISTANCE_MATRIX',
      } as GoogleMapsError;
    }

    // Processa resultados
    const petShops: PetShop[] = places
      .map((place, index) => {
        const distanceElement = distanceMatrixResponse.rows[0]?.elements[index];

        if (!distanceElement || distanceElement.status !== 'OK') {
          return null;
        }

        return {
          id: place.place_id,
          name: place.name,
          place_id: place.place_id,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          address: place.formatted_address || 'Endereço não disponível',
          distance: distanceElement.distance.text,
          distance_meters: distanceElement.distance.value,
          duration: distanceElement.duration.text,
          duration_seconds: distanceElement.duration.value,
          rating: place.rating,
          user_ratings_total: place.user_ratings_total,
          icon: place.icon,
        } as PetShop;
      })
      .filter((shop): shop is PetShop => shop !== null)
      // Ordena por distância
      .sort((a, b) => a.distance_meters - b.distance_meters)
      // Retorna apenas os 3 primeiros
      .slice(0, 3);

    return petShops;
  }

  /**
   * Processa rota de entrega com polyline
   * @param origin Origem [lat,lng]
   * @param destination Destino [lat,lng]
   * @param destinationName Nome do destino (cliente)
   * @returns Rota processada com polyline
   */
  async processDeliveryRoute(
    origin: string,
    destination: string,
    destinationName: string = 'Cliente',
  ): Promise<DeliveryRoute> {
    const directionsResponse = await this.getDirections(origin, destination);

    if (directionsResponse.status !== 'OK' || directionsResponse.routes.length === 0) {
      throw {
        status: directionsResponse.status,
        error_message: directionsResponse.error_message,
        type: 'DIRECTIONS_API',
      } as GoogleMapsError;
    }

    const route = directionsResponse.routes[0];
    const leg = route.legs[0];

    return {
      destination_name: destinationName,
      destination_address: leg.end_address,
      destination_lat: leg.end_location.lat,
      destination_lng: leg.end_location.lng,
      origin_lat: leg.start_location.lat,
      origin_lng: leg.start_location.lng,
      polyline: route.overview_polyline.points,
      distance_meters: leg.distance.value,
      distance_text: leg.distance.text,
      duration_seconds: leg.duration.value,
      duration_text: leg.duration.text,
    };
  }
}

// Singleton instance
let googleMapsService: GoogleMapsService | null = null;

export const getGoogleMapsService = async (): Promise<GoogleMapsService> => {
  if (!googleMapsService) {
    googleMapsService = new GoogleMapsService();
    await googleMapsService.initialize();
  }
  return googleMapsService;
};

export default GoogleMapsService;
