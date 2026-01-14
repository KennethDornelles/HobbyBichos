import React, { useEffect, useMemo } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  Polyline,
  LatLng,
  MarkerAnimated,
} from 'react-native-maps';
import { DeliveryRoute, DriverLocation } from '../types/googlemaps.types';

export interface DeliveryTrackingProps {
  /**
   * Rota de entrega com informações de origem, destino e polyline
   */
  route: DeliveryRoute;

  /**
   * Localização atual do entregador
   */
  driverLocation: DriverLocation | null;

  /**
   * Progresso da entrega (0 a 1)
   */
  progress?: number;

  /**
   * Nome do entregador (para display)
   */
  driverName?: string;

  /**
   * URL ou URI do ícone do entregador
   */
  driverIcon?: string;

  /**
   * Callback quando o usuário clica no mapa
   */
  onMapPress?: (e: any) => void;

  /**
   * Altura do mapa (padrão: 300)
   */
  height?: number;

  /**
   * Se deve centralizar automaticamente no entregador
   */
  autoCenter?: boolean;

  /**
   * Margem de zoom ao centralizar
   */
  zoomLevel?: number;
}

/**
 * Componente de rastreamento de entrega em tempo real
 * Exibe mapa com:
 * - Marcador fixo no destino (cliente)
 * - Marcador animado do entregador
 * - Polyline azul da rota
 * - Progresso da entrega
 *
 * @example
 * const { driverLocation, progress } = useDeliveryLocation(route);
 * return (
 *   <DeliveryTracking
 *     route={route}
 *     driverLocation={driverLocation}
 *     progress={progress}
 *     driverName="João Silva"
 *   />
 * );
 */
const DeliveryTracking: React.FC<DeliveryTrackingProps> = ({
  route,
  driverLocation,
  progress = 0,
  driverName = 'Entregador',
  driverIcon,
  onMapPress,
  height = 300,
  autoCenter = true,
  zoomLevel = 15,
}) => {
  const mapRef = React.useRef<MapView>(null);

  /**
   * Converte polyline codificada em array de coordenadas
   */
  const decodedPolyline = useMemo(() => {
    const polyline = route.polyline;
    const points: LatLng[] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < polyline.length) {
      let result = 0;
      let shift = 0;
      let byte = 0;

      do {
        byte = polyline.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      result = 0;
      shift = 0;

      do {
        byte = polyline.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return points;
  }, [route.polyline]);

  /**
   * Centraliza o mapa ao redor da localização atual do entregador
   */
  useEffect(() => {
    if (!autoCenter || !driverLocation || !mapRef.current) return;

    mapRef.current.animateToRegion({
      latitude: driverLocation.latitude,
      longitude: driverLocation.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  }, [driverLocation, autoCenter]);

  /**
   * Centraliza inicialmente a rota toda
   */
  useEffect(() => {
    if (!mapRef.current || decodedPolyline.length === 0) return;

    setTimeout(() => {
      mapRef.current?.fitToCoordinates(decodedPolyline, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }, 500);
  }, [decodedPolyline]);

  const progressPercentage = Math.round(progress * 100);

  return (
    <View style={{ height }}>
      {/* Mapa */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        onPress={onMapPress}
        initialRegion={{
          latitude: route.origin_lat,
          longitude: route.origin_lng,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {/* Polyline da rota (azul) */}
        <Polyline
          coordinates={decodedPolyline}
          strokeColor="#3B82F6"
          strokeWidth={3}
          lineDashPattern={[1]}
          geodesic={true}
        />

        {/* Marcador de destino (cliente) - fixo */}
        <Marker
          coordinate={{
            latitude: route.destination_lat,
            longitude: route.destination_lng,
          }}
          title={route.destination_name}
          description={route.destination_address}
          pinColor="red"
        />

        {/* Marcador do entregador - animado */}
        {driverLocation && (
          <Marker
            coordinate={{
              latitude: driverLocation.latitude,
              longitude: driverLocation.longitude,
            }}
            title={driverName}
            description={`${progressPercentage}% da rota`}
            pinColor="blue"
          />
        )}
      </MapView>

      {/* Overlay com informações de progresso */}
      <View style={styles.infoOverlay}>
        <View style={styles.infoCard}>
          <Text style={styles.driverName}>{driverName}</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercentage}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{progressPercentage}%</Text>
          <Text style={styles.durationText}>{route.duration_text}</Text>
        </View>
      </View>

      {/* Loading indicator se driver location não está disponível ainda */}
      {!driverLocation && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  driverName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3B82F6',
    marginBottom: 4,
  },
  durationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DeliveryTracking;
