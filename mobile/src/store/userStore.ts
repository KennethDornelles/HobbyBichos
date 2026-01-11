import { create } from 'zustand';

interface UserState {
  name: string;
  points: number;
  setUser: (name: string, points: number) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  name: 'Visitante',
  points: 0,
  setUser: (name, points) => set({ name, points }),
  reset: () => set({ name: 'Visitante', points: 0 }),
}));
