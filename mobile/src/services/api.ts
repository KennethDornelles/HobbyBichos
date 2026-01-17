import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// ⚠️ IMPORTANTE: Substitua pelo IP da sua máquina que você pegou no passo 1.
// Não use 'localhost' se for testar no celular físico.
// Exemplo: 'http://192.168.1.15:3000'
const API_URL = 'http://192.168.0.5:3000/api'; 

// Se estiver usando APENAS o emulador do Android Studio, pode usar:
// const API_URL = 'http://10.0.2.2:3000';

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
