import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { appointmentService, EmployeeDashboard } from '../services/appointmentService';

interface UseDashboardAutoSyncReturn {
  dashboard: EmployeeDashboard | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isStale: boolean;
}

const SYNC_INTERVAL = 30000; // 30 segundos
const STALE_TIMEOUT = 60000; // 1 minuto

export const useDashboardAutoSync = (): UseDashboardAutoSyncReturn => {
  const [dashboard, setDashboard] = useState<EmployeeDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);

  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const staleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>('active');

  const fetchDashboard = useCallback(async () => {
    try {
      setError(null);
      const data = await appointmentService.getEmployeeDashboard();
      setDashboard(data);
      setIsStale(false);

      // Define stale timeout
      if (staleTimerRef.current) {
        clearTimeout(staleTimerRef.current);
      }
      staleTimerRef.current = setTimeout(() => {
        setIsStale(true);
      }, STALE_TIMEOUT);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dashboard';
      setError(message);
      console.error('Erro ao sincronizar dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sincronização ao entrar na tela
  useFocusEffect(
    useCallback(() => {
      fetchDashboard();

      // Inicia sincronização periódica
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
      }
      syncTimerRef.current = setInterval(() => {
        if (appStateRef.current === 'active') {
          fetchDashboard();
        }
      }, SYNC_INTERVAL);

      return () => {
        if (syncTimerRef.current) {
          clearInterval(syncTimerRef.current);
        }
      };
    }, [fetchDashboard])
  );

  // Monitora mudanças no estado da app
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      appStateRef.current = state;
      if (state === 'active') {
        // App voltou do background
        fetchDashboard();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [fetchDashboard]);

  // Limpeza
  useEffect(() => {
    return () => {
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
      }
      if (staleTimerRef.current) {
        clearTimeout(staleTimerRef.current);
      }
    };
  }, []);

  return {
    dashboard,
    loading,
    error,
    refetch: fetchDashboard,
    isStale,
  };
};
