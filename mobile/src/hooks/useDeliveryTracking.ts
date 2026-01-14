import { useEffect, useState, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { api } from '../services/api';

/**
 * Interface para cache de tracking
 */
interface TrackingCache {
  order: any;
  timestamp: number;
}

export interface UseDeliveryTrackingState {
  order: any | null;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para rastreamento de entrega com polling adaptativo
 * - Polling a cada 30s quando app está ativo (tela visível)
 * - Polling a cada 3 min quando app está em background
 * - Cache como fallback se requisição falhar
 * - Mostra tempo da última atualização
 *
 * @param orderId ID do pedido a rastrear
 * @returns Estado com dados do tracking, loading, erro e função de atualização manual
 *
 * @example
 * const { order, loading, lastUpdate, refetch } = useDeliveryTracking(orderId);
 * if (loading) return <Text>Atualizando...</Text>;
 * return (
 *   <View>
 *     <Text>{order?.status}</Text>
 *     <Text>Última atualização: {lastUpdate?.toLocaleTimeString()}</Text>
 *     <Button onPress={refetch} title="Atualizar agora" />
 *   </View>
 * );
 */
export const useDeliveryTracking = (orderId: string): UseDeliveryTrackingState => {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Refs para gerenciar polling
  const cacheRef = useRef<TrackingCache | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>('active');
  const appStateSubscriptionRef = useRef<any>(null);

  /**
   * Busca dados do tracking na API
   */
  const fetchTrackingData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/orders/${orderId}`);
      const orderData = response.data;

      // Atualizar cache
      cacheRef.current = {
        order: orderData,
        timestamp: Date.now(),
      };

      setOrder(orderData);
      setLastUpdate(new Date());
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao buscar tracking';
      setError(errorMsg);

      // Se falhar, usar cache como fallback
      if (cacheRef.current?.order) {
        console.log('Usando cache de tracking como fallback');
        setOrder(cacheRef.current.order);
        setLastUpdate(new Date(cacheRef.current.timestamp));
      } else {
        setOrder(null);
      }
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  /**
   * Inicia polling com intervalo baseado em AppState
   */
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Determinar intervalo baseado em AppState
    const getInterval = () => {
      if (appStateRef.current === 'active') {
        return 30 * 1000; // 30 segundos quando app está ativo
      } else {
        return 3 * 60 * 1000; // 3 minutos quando app está em background
      }
    };

    // Buscar dados imediatamente
    void fetchTrackingData();

    // Configurar polling
    const interval = getInterval();
    pollingIntervalRef.current = setInterval(() => {
      console.log(
        `[Tracking] Polling (AppState: ${appStateRef.current}, Intervalo: ${interval / 1000}s)`,
      );
      void fetchTrackingData();
    }, interval);
  }, [fetchTrackingData]);

  /**
   * Para o polling
   */
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  /**
   * Listener para mudanças no AppState (app ativo/background)
   */
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log(`[Tracking] AppState mudou: ${appStateRef.current} -> ${nextAppState}`);

      const wasActive = appStateRef.current === 'active';
      const isNowActive = nextAppState === 'active';

      appStateRef.current = nextAppState;

      // Se mudou de background para active, reiniciar polling com intervalo menor
      if (!wasActive && isNowActive) {
        console.log('[Tracking] App voltou ao foreground, reiniciando polling');
        startPolling();
      }
    };

    appStateSubscriptionRef.current = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      appStateSubscriptionRef.current?.remove?.();
    };
  }, [startPolling]);

  /**
   * Iniciar polling ao montar, parar ao desmontar
   */
  useEffect(() => {
    console.log(`[Tracking] Iniciando tracking para pedido: ${orderId}`);
    startPolling();

    return () => {
      console.log(`[Tracking] Parando polling para pedido: ${orderId}`);
      stopPolling();
    };
  }, [orderId, startPolling, stopPolling]);

  return {
    order,
    loading,
    error,
    lastUpdate,
    refetch: fetchTrackingData,
  };
};

export default useDeliveryTracking;
