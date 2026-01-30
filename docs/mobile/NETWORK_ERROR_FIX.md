# 🔧 Troubleshooting: Network Error na Home

## ❌ Problema
```
ERROR  Erro ao carregar perfil do usuário: [AxiosError: Network Error]
```

## ✅ Solução

### 1. **Verificar se a API está rodando**
```bash
# Terminal 1 - API
cd api/
npm run start

# Deve estar rodando em http://localhost:3000
```

### 2. **Configurar a URL da API no Mobile**

O arquivo `.env` foi criado em:
```
mobile/.env
```

Com conteúdo:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### 3. **Reiniciar o App Mobile**

Se o app já estava rodando, é necessário reiniciar:

**Opção A - Parar e reiniciar:**
```bash
# Terminal 2 - Mobile
cd mobile/
npm start
# Pressione Ctrl+C
# Depois execute novamente: npm start
```

**Opção B - Limpar cache e reiniciar:**
```bash
npm start -- --clear
```

### 4. **Verificar IP da Máquina (se em rede local)**

Se está em emulador Android/iOS em outra máquina:

```bash
# Windows - Obter IP local
ipconfig

# Alterar .env para:
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000
# (substitua 192.168.x.x pelo seu IP real)
```

### 5. **Testar Autenticação**

Certifique-se de estar **logado** antes de carregar a Home:
- Use credenciais do seed: `client@qa.com` / `Senha123!`
- O token deve estar armazenado em `SecureStore`

### 6. **Verificar se `/users/me` existe no Backend**

```bash
# Terminal - Testar com curl
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/users/me
```

---

## 📋 Checklist

- [ ] API rodando em `http://localhost:3000`
- [ ] Arquivo `.env` criado no mobile com `EXPO_PUBLIC_API_URL`
- [ ] App mobile reiniciado
- [ ] Usuário autenticado (logado)
- [ ] Token armazenado em SecureStore
- [ ] Firewall não bloqueando porta 3000

## 💡 Debug Avançado

Se ainda tiver erro, adicione logs:

**Em `src/store/userStore.ts`:**
```typescript
loadUserProfile: async () => {
  set({ loading: true });
  try {
    console.log('🔍 Iniciando GET /users/me...');
    console.log('📍 URL da API:', process.env.EXPO_PUBLIC_API_URL);
    
    const res = await api.get<{
      name: string;
      email: string;
      loyaltyAccount?: { currentPoints: number };
    }>('/users/me');
    
    console.log('✅ Resposta recebida:', res.data);
    // ... resto do código
  } catch (error: any) {
    console.error('❌ Erro completo:', {
      message: error.message,
      status: error?.response?.status,
      data: error?.response?.data,
      config: error?.config?.baseURL,
    });
    set({ loading: false });
  }
},
```

---

**Status:** 🚀 Configurado e pronto para teste
