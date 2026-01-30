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
// Queue to hold requests while refreshing
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response) {
      console.error('Erro na API:', error.response.status, JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Erro na API:', error.message);
    }

    //ignora tentativas de refresh se o erro for no login
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login')) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        console.log('🔄 Tentando renovar token...');
        // Use separate axios instance to avoid interceptor loop
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { access_token, refresh_token: newRefreshToken } = response.data;

        await SecureStore.setItemAsync('authToken', access_token);
        if (newRefreshToken) {
            await SecureStore.setItemAsync('refreshToken', newRefreshToken);
        }

        api.defaults.headers.common['Authorization'] = 'Bearer ' + access_token;
        originalRequest.headers['Authorization'] = 'Bearer ' + access_token;
        
        console.log('✅ Token renovado com sucesso!');
        processQueue(null, access_token);
        return api(originalRequest);
      } catch (err) {
        console.error('❌ Falha ao renovar token:', err);
        processQueue(err, null);
        await SecureStore.deleteItemAsync('authToken');
        await SecureStore.deleteItemAsync('refreshToken');
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
