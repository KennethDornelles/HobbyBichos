import { useEffect, useState, useCallback, useRef } from 'react';
import { DriverLocation, DeliveryRoute, PlacesLocation } from '../types/googlemaps.types';

export interface UseDeliveryLocationState {
  driverLocation: DriverLocation | null;
  isSimulating: boolean;
  progress: number; // 0 a 1
  startSimulation: () => void;
  stopSimulation: () => void;
  updateDriverLocation: (location: DriverLocation) => void;
}

/**
 * Utility: Decodifica polyline do Google Maps
 * @param polyline String codificada do Google Maps
 * @returns Array de coordenadas [lat, lng]
 */
const decodePolyline = (polyline: string): [number, number][] => {
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < polyline.length) {
    let result = 0;
    let shift = 0;
    let byte = 0;

    // Decodifica latitude
    do {
      byte = polyline.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    result = 0;
    shift = 0;

    // Decodifica longitude
    do {
      byte = polyline.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
};

/**
 * Calcula a interpolação linear entre dois pontos
 * @param point1 Ponto inicial [lat, lng]
 * @param point2 Ponto final [lat, lng]
 * @param t Valor de interpolação (0 a 1)
 * @returns Ponto interpolado [lat, lng]
 */
const interpolatePoint = (
  point1: [number, number],
  point2: [number, number],
  t: number,
): [number, number] => {
  return [point1[0] + (point2[0] - point1[0]) * t, point1[1] + (point2[1] - point1[1]) * t];
};

/**
 * Hook para simular a localização do entregador ao longo de uma rota
 * Fornece movimento suave ao longo do polyline
 * Preparado para integração com Firebase/Websockets no futuro
 *
 * @param route Rota de entrega com polyline codificado
 * @param simulationDurationSeconds Duração da simulação em segundos (padrão: igual ao duration_seconds da rota)
 * @param updateIntervalMs Intervalo de atualização em ms (padrão: 1000ms)
 * @returns Estado de localização do entregador e funções de controle
 *
 * @example
 * const route = { polyline: 'encoded...', duration_seconds: 300 };
 * const { driverLocation, startSimulation, progress } = useDeliveryLocation(route);
 * // Depois de começar a simulação:
 * // driverLocation atualiza a cada segundo ao longo da rota
 */
export const useDeliveryLocation = (
  route: DeliveryRoute | null,
  simulationDurationSeconds?: number,
  updateIntervalMs: number = 1000,
): UseDeliveryLocationState => {
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [progress, setProgress] = useState(0);

  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pathPointsRef = useRef<[number, number][]>([]);
  const startTimeRef = useRef<number>(0);
  const totalDurationRef = useRef<number>(0);

  /**
   * Inicializa a simulação decodificando o polyline
   */
  const initializeSimulation = useCallback(() => {
    if (!route) return;

    // Decodifica polyline
    const decodedPoints = decodePolyline(route.polyline);
    pathPointsRef.current = decodedPoints;

    // Define duração (pode ser customizada ou usar a da rota)
    totalDurationRef.current = simulationDurationSeconds || route.duration_seconds;
    startTimeRef.current = Date.now();

    // Define localização inicial
    const initialLocation: DriverLocation = {
      latitude: decodedPoints[0][0],
      longitude: decodedPoints[0][1],
      timestamp: startTimeRef.current,
    };

    setDriverLocation(initialLocation);
    setProgress(0);
  }, [route, simulationDurationSeconds]);

  /**
   * Inicia a simulação do movimento
   */
  const startSimulation = useCallback(() => {
    if (!route || isSimulating) return;

    initializeSimulation();
    setIsSimulating(true);
  }, [route, isSimulating, initializeSimulation]);

  /**
   * Para a simulação
   */
  const stopSimulation = useCallback(() => {
    setIsSimulating(false);
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
  }, []);

  /**
   * Atualiza manualmente a localização do entregador
   * Útil para integração com Firebase/Websockets
   */
  const updateDriverLocation = useCallback((location: DriverLocation) => {
    setDriverLocation(location);
  }, []);

  /**
   * Efeito para executar a simulação
   */
  useEffect(() => {
    if (!isSimulating || !route) {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
      return;
    }

    simulationIntervalRef.current = setInterval(() => {
      const elapsedMs = Date.now() - startTimeRef.current;
      const elapsedSeconds = elapsedMs / 1000;
      const currentProgress = Math.min(elapsedSeconds / totalDurationRef.current, 1);

      setProgress(currentProgress);

      if (currentProgress >= 1) {
        // Simulação completada
        setIsSimulating(false);
        if (simulationIntervalRef.current) {
          clearInterval(simulationIntervalRef.current);
          simulationIntervalRef.current = null;
        }

        // Posiciona no ponto final
        const finalPoint = pathPointsRef.current[pathPointsRef.current.length - 1];
        setDriverLocation({
          latitude: finalPoint[0],
          longitude: finalPoint[1],
          timestamp: Date.now(),
        });
        return;
      }

      // Encontra o segmento atual e interpola
      const pathPoints = pathPointsRef.current;
      if (pathPoints.length < 2) return;

      const pointsCount = pathPoints.length;
      const currentSegmentIndex = Math.floor(currentProgress * (pointsCount - 1));
      const nextSegmentIndex = Math.min(currentSegmentIndex + 1, pointsCount - 1);

      // Interpolação dentro do segmento
      const segmentProgress =
        currentProgress * (pointsCount - 1) - currentSegmentIndex;

      const interpolated = interpolatePoint(
        pathPoints[currentSegmentIndex],
        pathPoints[nextSegmentIndex],
        segmentProgress,
      );

      setDriverLocation({
        latitude: interpolated[0],
        longitude: interpolated[1],
        timestamp: Date.now(),
      });
    }, updateIntervalMs);

    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [isSimulating, route, updateIntervalMs]);

  /**
   * Cleanup na desmontagem
   */
  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, []);

  return {
    driverLocation,
    isSimulating,
    progress,
    startSimulation,
    stopSimulation,
    updateDriverLocation,
  };
};

export default useDeliveryLocation;
