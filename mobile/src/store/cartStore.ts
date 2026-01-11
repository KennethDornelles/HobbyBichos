import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import type { CartItem, CartResponse, ValidationResult } from '../types/cart.types';

interface CartStoreState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity' | 'maxStock' | 'sku' | 'image' | 'name' | 'price'> & { productId: string; quantity?: number } & Partial<CartItem>) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  subtotal: () => number;
  totalItems: () => number;
  syncWithBackend: () => Promise<void>;
  loadCartFromBackend: () => Promise<void>;
  validateStockAndPrices: () => Promise<ValidationResult>;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const quantity = item.quantity ?? 1;
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            const newQty = Math.min(existing.quantity + quantity, existing.maxStock ?? Infinity);
            return {
              items: state.items.map((i) =>
                i.productId === item.productId ? { ...i, quantity: newQty } : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                productId: item.productId,
                name: item.name ?? '',
                price: item.price ?? 0,
                quantity,
                image: item.image ?? null,
                maxStock: item.maxStock ?? 999999,
                sku: item.sku ?? '',
              },
            ],
          };
        });
        void get().syncWithBackend();
      },

      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items
            .map((i) => (i.productId === productId ? { ...i, quantity } : i))
            .filter((i) => i.quantity > 0),
        }));
        void get().syncWithBackend();
      },

      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) }));
        void get().syncWithBackend();
      },

      clear: () => {
        set({ items: [] });
        void api.delete('/cart').catch(() => {});
      },

      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      syncWithBackend: async () => {
        const payload = { items: get().items.map((i) => ({ productId: i.productId, quantity: i.quantity })) };
        try {
          const res = await api.post<CartResponse>('/cart/sync', payload);
          set({ items: res.data.items });
        } catch {
          // manter estado local
        }
      },

      loadCartFromBackend: async () => {
        try {
          const res = await api.get<CartResponse>('/cart');
          set({ items: res.data.items });
        } catch {
          // sem ação
        }
      },

      validateStockAndPrices: async () => {
        const res = await api.post<ValidationResult>('/cart/validate');
        return res.data;
      },
    }),
    {
      name: 'hb-cart',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
