# ✅ Checklist de Instalação e Configuração - Google Maps

Siga este checklist para garantir que tudo está configurado corretamente.

## 📦 Pré-requisitos

- [ ] Node.js 16+ instalado
- [ ] npm ou yarn instalado
- [ ] Expo CLI instalado globalmente
- [ ] Android Studio ou Xcode (conforme plataforma)
- [ ] Emulador Android/iOS ou dispositivo real

---

## 🔑 Google Cloud Console

### 1. Conta e Projeto

- [ ] Conta Google Cloud ativa
- [ ] Projeto criado no Console
- [ ] Billing habilitado
- [ ] Saldo disponível (R$ 1.900+)

### 2. APIs Ativadas

Acesse: https://console.cloud.google.com/apis/library

- [ ] **Places API** ativada
- [ ] **Distance Matrix API** ativada
- [ ] **Directions API** ativada
- [ ] **Maps SDK for Android** ativada (gratuito)
- [ ] **Maps SDK for iOS** ativada (gratuito) - se aplicável

### 3. API Key

- [ ] Criar API Key em "Credentials"
- [ ] Configurar restrições (opcional):
  - [ ] **Android**: SHA-1 do certificado adicionado
  - [ ] **APIs**: Limitar a APIs necessárias
- [ ] **Copiar a chave** para .env.local

---

## 📱 Configuração do Projeto Mobile

### 1. Dependências

```bash
cd mobile
```

- [ ] `npm install` executado
- [ ] `npx expo install react-native-maps` executado
- [ ] `npx expo install expo-location` executado

Verificar se instaladas:
```bash
npm list react-native-maps expo-location
```

### 2. Variáveis de Ambiente

- [ ] Arquivo `.env.local` criado (copiar de `.env.local.example`)
- [ ] `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` adicionada com valor correto
- [ ] `EXPO_PUBLIC_API_URL` configurada (padrão: `http://localhost:3000/api`)

### 3. Configuração Android

#### app.json

- [ ] Permissões de localização em `android.permissions`:
  - [ ] `android.permission.ACCESS_FINE_LOCATION`
  - [ ] `android.permission.ACCESS_COARSE_LOCATION`
  - [ ] `android.permission.FOREGROUND_SERVICE`

- [ ] Google Maps API Key em `android.config.googleMaps.apiKey` (opcional - .env é melhor)

#### AndroidManifest.xml

- [ ] Verificar se gerado automaticamente pelo Expo
- [ ] Permissões presentes

### 4. Configuração iOS (se aplicável)

#### app.json

- [ ] Google Maps API Key em `ios.config.googleMapsApiKey` (opcional - .env é melhor)

#### Info.plist

- [ ] `NSLocationWhenInUseUsageDescription` configurada
- [ ] `NSLocationAlwaysAndWhenInUseUsageDescription` configurada

---

## 📁 Arquivos Criados

Verificar se todos os arquivos foram criados:

### Tipos TypeScript
- [ ] `src/types/googlemaps.types.ts`

### Serviços
- [ ] `src/services/googleMapsService.ts`

### Hooks
- [ ] `src/hooks/useNearbyPetShops.ts`
- [ ] `src/hooks/useDeliveryLocation.ts`
- [ ] `src/hooks/index.ts` (atualizado)

### Componentes
- [ ] `src/components/DeliveryTracking.tsx`

### Telas
- [ ] `app/googlemaps-test.tsx`

### Documentação
- [ ] `GOOGLEMAPS_SETUP.md`
- [ ] `GOOGLEMAPS_EXAMPLES.ts`
- [ ] `.env.local.example`
- [ ] Este arquivo

---

## 🧪 Testes Básicos

### 1. Compilação

```bash
npx expo start
```

- [ ] Sem erros de compilação
- [ ] Console mostra "Listening on"

### 2. Build Android

```bash
npm run android
# ou
npx expo run:android
```

- [ ] Build completa sem erros
- [ ] App abre no emulador/dispositivo

### 3. Tela de Teste

- [ ] Acesse: `googlemaps-test` no app
- [ ] Aba "🔍 Lojas Próximas":
  - [ ] Localização do usuário exibida
  - [ ] Até 3 lojas listadas (se houver próximas)
  - [ ] Informações corretas: nome, distância, tempo
  - [ ] Botão de rastreamento funciona

- [ ] Aba "🚗 Rastreamento":
  - [ ] Mapa carrega sem erros
  - [ ] Polyline (rota) exibida em azul
  - [ ] Marcador de destino exibido
  - [ ] Botão "Iniciar Simulação" funciona
  - [ ] Entregador move ao longo da rota
  - [ ] Barra de progresso atualiza

### 4. Permissões

- [ ] Ao abrir app, pedir permissão de localização
- [ ] Ao permitir, GPS funciona
- [ ] Ao negar, mensagem de erro apropriada

### 5. Erros Esperados

Teste estes cenários:

- [ ] Negar permissão de localização → Erro apropriado
- [ ] Internet desligada → Erro de conexão
- [ ] API Key inválida → Erro "REQUEST_DENIED"
- [ ] Mudar de localização → Lojas atualizam corretamente

---

## 🔒 Segurança

- [ ] `.env.local` está em `.gitignore` (não committar)
- [ ] API Key não está hardcoded no app.json
- [ ] API Key não está em arquivos de código
- [ ] Restrições de chave configuradas no Google Cloud
- [ ] Webhook URLs não expostas públicamente

---

## 📊 Consumo de API

### Verificar Cotas

Acesse: https://console.cloud.google.com/apis/dashboard

- [ ] **Places API**: Ver requisições/dia
- [ ] **Distance Matrix**: Ver requisições/dia
- [ ] **Directions**: Ver requisições/dia

### Monitorar Saldo

Acesse: https://console.cloud.google.com/billing

- [ ] Saldo atual visível
- [ ] Alertas configurados para limite

---

## 🚀 Pronto para Produção?

Antes de fazer build para produção:

- [ ] [ ] Todas as telas de teste funcionam
- [ ] [ ] Erros tratados apropriadamente
- [ ] [ ] Performance aceitável
- [ ] [ ] API Key com restrições ativadas
- [ ] [ ] Quotas monitoradas
- [ ] [ ] App testado em dispositivo real
- [ ] [ ] Documentação atualizada

---

## 🐛 Troubleshooting

### App não inicia

```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
npx expo start -c
```

### Mapa em branco

- [ ] Verificar API Key em `.env.local`
- [ ] Verificar se react-native-maps instalado
- [ ] Rebuild: `npm run android`
- [ ] Verificar Google Maps ativada no console

### Localização não funciona

- [ ] Verificar permissão no app
- [ ] Verificar GPS ativo no dispositivo
- [ ] Verificar se emulador tem localização simulada

### Erros de tipo TypeScript

```bash
# Regenerar tipos
npm install
```

---

## 📞 Suporte Rápido

| Problema | Solução |
|----------|---------|
| "API Key não configurada" | Adicionar a `.env.local` |
| "Zero results" | Aumentar raio ou mudar de localização |
| "Permissão negada" | Ir em Configurações > Permissões > Localização |
| "Mapa em branco" | Verificar API Key e rebuild |
| "Erros de tipo" | Executar `npm install` novamente |

---

## ✨ Próximas Funcionalidades

Após implementação estar funcionando:

- [ ] Integrar com Firebase Realtime para localização em tempo real
- [ ] Integrar com Websockets para atualizações push
- [ ] Adicionar notificações de chegada
- [ ] Histórico de rastreamentos
- [ ] Avaliação do entregador
- [ ] Compartilhamento de localização com cliente

---

**Data da verificação:** _______________

**Desenvolvedor:** _______________

**Status:** ☐ Não iniciado | ☐ Em progresso | ☐ Concluído

---

*Última atualização: 14 de janeiro de 2026*
