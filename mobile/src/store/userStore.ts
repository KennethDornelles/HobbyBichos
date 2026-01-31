import { create } from 'zustand';
import api from '../services/api';
import * as SecureStore from 'expo-secure-store';

interface UserState {
  id: string;
  name: string;
  email: string;
  role?: string;
  points: number;
  loading: boolean;
  setUser: (id: string, name: string, email: string, points: number, role?: string) => void;
  setPoints: (points: number) => void;
  loadUserProfile: () => Promise<void>;
  reset: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  id: '',
  name: 'Visitante',
  email: '',
  role: undefined,
  points: 0,
  loading: false,
  setUser: (id, name, email, points, role) => set({ id, name, email, points, role }),
  setPoints: (points) => set({ points }),
  
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
        id: string;
        name: string;
        email: string;
        role: string;
        loyaltyAccount?: { currentPoints: number };
      }>('/users/me');
      const pointsFromAccount = res.data.loyaltyAccount?.currentPoints || 0;
      set({
        id: res.data.id || '',
        name: res.data.name || 'Visitante',
        email: res.data.email || '',
        role: res.data.role,
        points: pointsFromAccount,
        loading: false,
      });
      console.log('✅ Perfil do usuário carregado:', res.data.name, `(role: ${res.data.role}, ${pointsFromAccount} pontos)`);
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
  
  reset: () => set({ id: '', name: 'Visitante', email: '', role: undefined, points: 0 }),
}));
