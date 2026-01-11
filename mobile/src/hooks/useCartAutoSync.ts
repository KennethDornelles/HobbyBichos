import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useCartStore } from '../store/cartStore';

export function useCartAutoSync() {
  const load = useCartStore((s) => s.loadCartFromBackend);
  const sync = useCartStore((s) => s.syncWithBackend);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // load on mount
    void load();

    const sub = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        void sync();
      }
      appState.current = nextState;
    });

    const interval = setInterval(() => {
      void sync();
    }, 5 * 60 * 1000);

    return () => {
      sub.remove();
      clearInterval(interval);
    };
  }, [load, sync]);
}
