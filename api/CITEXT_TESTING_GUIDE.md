# 🧪 Teste de CITEXT - MemberCode Case-Insensitive

## 🚀 Como Testar Sem o Dispositivo

### Opção 1: Usando o Endpoint Público (Recomendado)

#### Passo 1: Atribuir um código ao usuário
```bash
curl -X POST http://localhost:3000/users/member-code \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "email": "user@example.com",
    "code": "USER1768492753175"
  }'
```

Ou se tiver o ID do usuário:
```bash
curl -X POST http://localhost:3000/users/member-code \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "id": "user-uuid-here",
    "code": "USER1768492753175"
  }'
```

#### Passo 2: Testar Buscas com Diferentes Cases

Todos estes devem retornar o MESMO usuário:

```bash
# Teste 1: UPPERCASE (exato)
curl http://localhost:3000/users/code/USER1768492753175

# Teste 2: lowercase
curl http://localhost:3000/users/code/user1768492753175

# Teste 3: Mixed case
curl http://localhost:3000/users/code/UsEr1768492753175

# Teste 4: Com espaços (Prisma trimma automaticamente)
curl "http://localhost:3000/users/code/  USER1768492753175  "

# Teste 5: Different mixed case
curl http://localhost:3000/users/code/uSeR1768492753175
```

### Opção 2: Usando Insomnia/Postman

1. **Criar código**
   - Method: POST
   - URL: `http://localhost:3000/users/member-code`
   - Headers: 
     - `Authorization: Bearer <seu_token_jwt>`
     - `Content-Type: application/json`
   - Body:
     ```json
     {
       "email": "seu_usuario@example.com",
       "code": "USER1768492753175"
     }
     ```

2. **Buscar por código** (sem autenticação - público)
   - Method: GET
   - URL: `http://localhost:3000/users/code/USER1768492753175`
   - Repetir com: `user1768492753175`, `UsEr1768492753175`, etc.

### Opção 3: Usando TypeScript/Node.js

```typescript
import axios from 'axios';

async function testCitextFunctionality() {
  const API_BASE = 'http://localhost:3000';
  const TOKEN = 'seu_jwt_token_aqui';

  // Passo 1: Atribuir código
  console.log('📝 Atribuindo código ao usuário...');
  const assignResponse = await axios.post(
    `${API_BASE}/users/member-code`,
    {
      email: 'user@example.com',
      code: 'USER1768492753175',
    },
    {
      headers: { Authorization: `Bearer ${TOKEN}` },
    }
  );
  console.log('✅ Código atribuído:', assignResponse.data);

  // Passo 2: Testar diferentes cases
  const testCases = [
    'USER1768492753175',
    'user1768492753175',
    'UsEr1768492753175',
    'uSeR1768492753175',
  ];

  console.log('\n🔍 Testando diferentes cases...\n');

  for (const testCode of testCases) {
    try {
      const response = await axios.get(
        `${API_BASE}/users/code/${testCode}`
      );
      console.log(`✅ Sucesso com "${testCode}"`);
      console.log(`   Usuário: ${response.data.name} (${response.data.email})`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`❌ FALHA: Código "${testCode}" não encontrado`);
      } else {
        console.log(`❌ Erro: ${error.message}`);
      }
    }
  }
}

testCitextFunctionality();
```

### Opção 4: Gerar QR Codes para Teste

```bash
# Instalar dependência (se não tiver)
npm install qrcode

# Executar gerador
npx ts-node generate-test-qrcodes.ts
```

Isso vai gerar QR codes em `./qrcodes-test/` que você pode escanear com seu app.

## 📊 Resultado Esperado

Se o CITEXT está funcionando corretamente:

```
✅ Sucesso com "USER1768492753175"
   Usuário: João Silva (joao@example.com)

✅ Sucesso com "user1768492753175"
   Usuário: João Silva (joao@example.com)

✅ Sucesso com "UsEr1768492753175"
   Usuário: João Silva (joao@example.com)

✅ Sucesso com "uSeR1768492753175"
   Usuário: João Silva (joao@example.com)
```

## 🐛 Se Algo Não Funcionar

1. Verifique se a migration foi aplicada:
   ```bash
   npx prisma migrate status
   ```

2. Verifique se a extensão citext está ativa no PostgreSQL:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'citext';
   ```

3. Verifique se o campo code é realmente CITEXT:
   ```sql
   SELECT column_name, data_type FROM information_schema.columns 
   WHERE table_name = 'member_codes' AND column_name = 'code';
   ```

   Deve retornar: `data_type = "USER-DEFINED"` com tipo `citext`

## 🎯 Próximos Passos

Após testar e confirmar que está funcionando:

1. ✅ Teste com o app móvel quando tiver o dispositivo
2. ✅ Implante em produção
3. ✅ Migre dados antigos se necessário

---

# 🧪 Teste de CITEXT - MemberCode Case-Insensitive

## 🚀 Como Testar Sem o Dispositivo

### Opção 1: Usando o Endpoint Público (Recomendado)

#### Passo 1: Atribuir um código ao usuário
```bash
curl -X POST http://localhost:3000/users/member-code \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "email": "user@example.com",
    "code": "USER1768492753175"
  }'
```

Ou se tiver o ID do usuário:
```bash
curl -X POST http://localhost:3000/users/member-code \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "id": "user-uuid-here",
    "code": "USER1768492753175"
  }'
```

#### Passo 2: Testar Buscas com Diferentes Cases

Todos estes devem retornar o MESMO usuário:

```bash
# Teste 1: UPPERCASE (exato)
curl http://localhost:3000/users/code/USER1768492753175

# Teste 2: lowercase
curl http://localhost:3000/users/code/user1768492753175

# Teste 3: Mixed case
curl http://localhost:3000/users/code/UsEr1768492753175

# Teste 4: Com espaços (Prisma trimma automaticamente)
curl "http://localhost:3000/users/code/  USER1768492753175  "

# Teste 5: Different mixed case
curl http://localhost:3000/users/code/uSeR1768492753175
```

### Opção 2: Usando Insomnia/Postman

1. **Criar código**
   - Method: POST
   - URL: `http://localhost:3000/users/member-code`
   - Headers: 
     - `Authorization: Bearer <seu_token_jwt>`
     - `Content-Type: application/json`
   - Body:
     ```json
     {
       "email": "seu_usuario@example.com",
       "code": "USER1768492753175"
     }
     ```

2. **Buscar por código** (sem autenticação - público)
   - Method: GET
   - URL: `http://localhost:3000/users/code/USER1768492753175`
   - Repetir com: `user1768492753175`, `UsEr1768492753175`, etc.

### Opção 3: Usando TypeScript/Node.js

```typescript
import axios from 'axios';

async function testCitextFunctionality() {
  const API_BASE = 'http://localhost:3000';
  const TOKEN = 'seu_jwt_token_aqui';

  // Passo 1: Atribuir código
  console.log('📝 Atribuindo código ao usuário...');
  const assignResponse = await axios.post(
    `${API_BASE}/users/member-code`,
    {
      email: 'user@example.com',
      code: 'USER1768492753175',
    },
    {
      headers: { Authorization: `Bearer ${TOKEN}` },
    }
  );
  console.log('✅ Código atribuído:', assignResponse.data);

  // Passo 2: Testar diferentes cases
  const testCases = [
    'USER1768492753175',
    'user1768492753175',
    'UsEr1768492753175',
    'uSeR1768492753175',
  ];

  console.log('\n🔍 Testando diferentes cases...\n');

  for (const testCode of testCases) {
    try {
      const response = await axios.get(
        `${API_BASE}/users/code/${testCode}`
      );
      console.log(`✅ Sucesso com "${testCode}"`);
      console.log(`   Usuário: ${response.data.name} (${response.data.email})`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`❌ FALHA: Código "${testCode}" não encontrado`);
      } else {
        console.log(`❌ Erro: ${error.message}`);
      }
    }
  }
}

testCitextFunctionality();
```

### Opção 4: Gerar QR Codes para Teste

```bash
# Instalar dependência (se não tiver)
npm install qrcode

# Executar gerador
npx ts-node generate-test-qrcodes.ts
```

Isso vai gerar QR codes em `./qrcodes-test/` que você pode escanear com seu app.

## 📊 Resultado Esperado

Se o CITEXT está funcionando corretamente:

```
✅ Sucesso com "USER1768492753175"
   Usuário: João Silva (joao@example.com)

✅ Sucesso com "user1768492753175"
   Usuário: João Silva (joao@example.com)

✅ Sucesso com "UsEr1768492753175"
   Usuário: João Silva (joao@example.com)

✅ Sucesso com "uSeR1768492753175"
   Usuário: João Silva (joao@example.com)
```

## 🐛 Se Algo Não Funcionar

1. Verifique se a migration foi aplicada:
   ```bash
   npx prisma migrate status
   ```

2. Verifique se a extensão citext está ativa no PostgreSQL:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'citext';
   ```

3. Verifique se o campo code é realmente CITEXT:
   ```sql
   SELECT column_name, data_type FROM information_schema.columns 
   WHERE table_name = 'member_codes' AND column_name = 'code';
   ```

   Deve retornar: `data_type = "USER-DEFINED"` com tipo `citext`

## 🎯 Próximos Passos

Após testar e confirmar que está funcionando:

1. ✅ Teste com o app móvel quando tiver o dispositivo
2. ✅ Implante em produção
3. ✅ Migre dados antigos se necessário

---

**Dúvidas?** Verifique os logs da aplicação com `npm run start:dev`
**Dúvidas?** Verifique os logs da aplicação com `npm run start:dev`
