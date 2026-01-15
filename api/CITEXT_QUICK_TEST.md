# 🧪 Como Testar CITEXT Sem o Dispositivo 2

## ⚡ Quick Start (30 segundos)

```bash
# Terminal 1: Inicie a API
cd /c/Users/kenne/Desktop/Workspaces/HobbyBichos/api
npm run start:dev

# Terminal 2: Execute o teste automático
npm run test:citext
```

## 📋 Guia Completo

### Opção 1️⃣: Teste Automático (Recomendado)

**Arquivo:** `test-citext-complete.ts`

```bash
# Certifique-se de que a API está rodando em outro terminal
npm run test:citext
```

**O que ele faz:**
- ✅ Cria um código de membro (ou pula se não conseguir)
- ✅ Testa 5 variações de case diferentes
- ✅ Verifica se todas retornam o mesmo usuário
- ✅ Exibe um relatório com os resultados

**Resultado esperado:**
```
📊 RESULTADOS DOS TESTES
════════════════════════════════════
1. ✅ Buscar "USER1768492753175"
   ✅ Usuário: João Silva (joao@example.com)

2. ✅ Buscar "user1768492753175"
   ✅ Usuário: João Silva (joao@example.com)

3. ✅ Buscar "UsEr1768492753175"
   ✅ Usuário: João Silva (joao@example.com)

...

📈 Resultado Final: 5/5 testes passaram (100%)
🎉 SUCESSO! CITEXT está funcionando perfeitamente!
```

### Opção 2️⃣: Testar Manualmente com cURL

```bash
# Teste 1: UPPERCASE
curl http://localhost:3000/users/code/USER1768492753175

# Teste 2: lowercase
curl http://localhost:3000/users/code/user1768492753175

# Teste 3: Mixed case
curl http://localhost:3000/users/code/UsEr1768492753175
```

### Opção 3️⃣: Gerar QR Codes Aleatórios

Se quiser testar com QR codes reais:

```bash
npm run generate:qrcodes
```

Vai gerar em `./qrcodes-test/`:
- `qrcode_test_1_USER1768492753175.png`
- `qrcode_test_2_user1768492753175.png`
- `qrcode_test_3_UsEr1768492753175.png`
- Etc.

Você pode escanear com o app quando tiver o dispositivo.

### Opção 4️⃣: Usando Insomnia/Postman

**Request 1: Criar Usuário (Se não tiver)**
```
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "name": "Teste CITEXT",
  "email": "teste.citext@example.com",
  "phone": "11999999999",
  "password": "Senha123!",
  "role": "CLIENT"
}
```

**Request 2: Atribuir Código** (Requer JWT)
```
POST http://localhost:3000/users/member-code
Content-Type: application/json
Authorization: Bearer <seu_jwt_token>

{
  "email": "teste.citext@example.com",
  "code": "USER1768492753175"
}
```

**Request 3: Buscar por Código** (Público, sem autenticação)
```
GET http://localhost:3000/users/code/USER1768492753175
```

Repetir com:
- `user1768492753175`
- `UsEr1768492753175`
- `uSeR1768492753175`

## 🐛 Troubleshooting

### Erro: "Código não encontrado"

**Verificação 1:** Confirmar que o código foi atribuído
```bash
# Nos logs da API, procure por:
# [MemberCode] ✅ Código atribuído com sucesso ao usuário...
```

**Verificação 2:** Validar Migration
```bash
# Terminal na pasta da API
npx prisma migrate status
```

Deve mostrar:
```
All migrations have been applied.
```

**Verificação 3:** Validar tipo de dados no banco
```sql
-- No PostgreSQL, execute:
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'member_codes' AND column_name = 'code';
```

Deve retornar: `data_type = "USER-DEFINED"` e `udt_name = "citext"`

### Erro: "Extensão citext não existe"

Execute no container PostgreSQL:
```bash
# Encontrar o container PostgreSQL
docker ps | grep postgres

# Entrar no container
docker exec -it <container_id> bash

# Habilitar extensão
PGPASSWORD=admin123 psql -U hobby -d hobbybichos -c "CREATE EXTENSION IF NOT EXISTS citext;"

# Sair
exit
```

### A API não está respondendo

Verifique:
```bash
# 1. Verifique se Node está rodando
npm run start:dev

# 2. Em outro terminal, teste a conexão
curl http://localhost:3000/users/lookup?id=test
```

## 📊 Fluxo de Teste Completo

```
┌─────────────────────────────────────────────────┐
│ 1. Inicie a API                                 │
│    npm run start:dev                            │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│ 2. Crie um usuário (opcional)                   │
│    POST /auth/register                          │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│ 3. Atribua um código de membro                  │
│    POST /users/member-code                      │
│    Body: { email, code: "USER123" }             │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│ 4. Execute o teste automático                   │
│    npm run test:citext                          │
│                                                 │
│    Testa:                                       │
│    - GET /users/code/USER123     ✅             │
│    - GET /users/code/user123     ✅             │
│    - GET /users/code/UsEr123     ✅             │
│    - GET /users/code/uSeR123     ✅             │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│ 5. Verificar Resultado                          │
│                                                 │
│    Se todos passaram: ✅ SUCESSO                │
│    Se alguns falharam: ❌ Verificar logs        │
└─────────────────────────────────────────────────┘
```

## 🎯 Validação Final

Após todos os testes passarem:

- ✅ CITEXT está ativo no PostgreSQL
- ✅ Migration foi aplicada
- ✅ Buscas case-insensitive funcionam
- ✅ App está pronto para produção

**Próximo passo:** Testar com o app móvel quando tiver o dispositivo 2.

---

**Dúvidas?** Verifique os arquivos:
- [CITEXT_IMPLEMENTATION_SUMMARY.md](CITEXT_IMPLEMENTATION_SUMMARY.md) - Detalhes técnicos
- [CITEXT_TESTING_GUIDE.md](CITEXT_TESTING_GUIDE.md) - Exemplos de código
