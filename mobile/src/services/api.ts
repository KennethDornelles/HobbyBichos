import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// A URL da API é definida pela variável de ambiente EXPO_PUBLIC_API_URL.
// Isso permite configurar a URL para diferentes ambientes (desenvolvimento, produção)
// sem precisar alterar o código.
// O fallback para 'http://10.0.2.2:3000/api' é para desenvolvimento local com emulador Android.
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api';

export const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Erro ao recuperar token:', error);
  }
  return config;
});

// Interceptor opcional para logar erros e facilitar o debug
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response) {
      console.error('Erro na API:', error.response.status, JSON.stringify(error.response.data, null, 2));

      if (error.response.status === 401) {
        await SecureStore.deleteItemAsync('authToken');
      }
    } else {
      console.error('Erro na API:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
