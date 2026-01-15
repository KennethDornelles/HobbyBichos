import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const api = axios.create({ baseURL });

async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('@app:token');
  } catch {
    return null;
  }
}

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error?.response?.status === 401) {
      // token inválido/expirado
      await AsyncStorage.removeItem('@app:token');
      await AsyncStorage.removeItem('@app:user');
      router.replace('/login');
    }
    return Promise.reject(error);
  }
);

export default api;