import axios from 'axios';

// ⚠️ IMPORTANTE: Substitua pelo IP da sua máquina que você pegou no passo 1.
// Não use 'localhost' se for testar no celular físico.
// Exemplo: 'http://192.168.1.15:3000'
const API_URL = 'http://192.168.0.5:3000'; 

// Se estiver usando APENAS o emulador do Android Studio, pode usar:
// const API_URL = 'http://10.0.2.2:3000';

export const api = axios.create({
  baseURL: API_URL,
});

// Interceptor opcional para logar erros e facilitar o debug
api.interceptors.response.use(
  response => response,
  error => {
    console.error('Erro na API:', error.message);
    return Promise.reject(error);
  }
);
