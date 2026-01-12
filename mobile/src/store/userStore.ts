import { create } from 'zustand';
import api from '../services/api';
import * as SecureStore from 'expo-secure-store';

interface UserState {
  name: string;
  email: string;
  points: number;
  loading: boolean;
  setUser: (name: string, email: string, points: number) => void;
  loadUserProfile: () => Promise<void>;
  reset: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  name: 'Visitante',
  email: '',
  points: 0,
  loading: false,
  setUser: (name, email, points) => set({ name, email, points }),
  
  loadUserProfile: async () => {
    // Verificar se usuário está autenticado antes de carregar
    const token = await SecureStore.getItemAsync('authToken');
    if (!token) {
      console.log('⚠️ Usuário não autenticado, pulando carregamento de perfil');
      return;
    }
    
    set({ loading: true });
    try {
      console.log('🔍 Iniciando GET /users/me...');
      const res = await api.get<{
        name: string;
        email: string;
        loyaltyAccount?: { currentPoints: number };
      }>('/users/me');
      const pointsFromAccount = res.data.loyaltyAccount?.currentPoints || 0;
      set({
        name: res.data.name || 'Visitante',
        email: res.data.email || '',
        points: pointsFromAccount,
        loading: false,
      });
      console.log('✅ Perfil do usuário carregado:', res.data.name, `(${pointsFromAccount} pontos)`);
    } catch (error: any) {
      console.error('❌ Erro ao carregar perfil do usuário:', {
        message: error.message,
        status: error?.response?.status,
        url: error?.config?.url,
        baseURL: error?.config?.baseURL,
      });
      set({ loading: false });
    }
  },
  
  reset: () => set({ name: 'Visitante', email: '', points: 0 }),
}));
