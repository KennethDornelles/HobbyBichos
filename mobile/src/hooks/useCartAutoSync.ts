import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useCartStore } from '../store/cartStore';
import * as SecureStore from 'expo-secure-store';

export function useCartAutoSync() {
  const load = useCartStore((s) => s.loadCartFromBackend);
  const sync = useCartStore((s) => s.syncWithBackend);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Verificar se usuário está autenticado antes de carregar
    const checkAuthAndLoad = async () => {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        void load();
      }
    };
    
    void checkAuthAndLoad();

    const sub = AppState.addEventListener('change', async (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
          void sync();
        }
      }
      appState.current = nextState;
    });

    const interval = setInterval(async () => {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        void sync();
      }
    }, 5 * 60 * 1000);

    return () => {
      sub.remove();
      clearInterval(interval);
    };
  }, [load, sync]);
}
