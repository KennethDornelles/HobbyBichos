# 🚀 Guia Rápido - Dashboard MANAGER

## ⚡ Início Rápido

### 1. Iniciar o Backend

```bash
cd api
npm run start:dev
```

### 2. Iniciar o Mobile

```bash
cd mobile
npx expo start
```

### 3. Login como MANAGER

Use uma conta com role `MANAGER` ou `OWNER`:

```json
{
  "email": "gerente@hobbybichos.com",
  "password": "sua_senha"
}
```

**Automaticamente** você será redirecionado para o dashboard gerencial!

---

## 🎯 Testar Funcionalidades

### ✅ Dashboard Principal

1. Abra o app e faça login como MANAGER
2. Você verá o **menu gerencial** com 4 cards:
   - 📊 Dashboard
   - 🔧 Gestão de Serviços
   - 💰 Financeiro
   - 📄 Relatórios

3. Toque em **Dashboard** para ver:
   - Agendamentos de hoje
   - Receita do mês
   - Serviços ativos
   - Próximos agendamentos

### ✅ Gestão de Serviços

1. Toque em **Gestão de Serviços**
2. Veja a lista de serviços com estatísticas
3. Toque no **botão +** para criar novo serviço:
   - Nome: "Banho Completo"
   - Preço: 50.00
   - Duração: 60 minutos
4. Toque em **Salvar**
5. Edite o serviço criado tocando no ícone de lápis
6. Desative/ative serviços tocando no ícone X/✓

### ✅ Financeiro

1. Toque em **Financeiro**
2. Selecione um período (Hoje, Semana, Mês, Ano)
3. Veja:
   - Receita total com taxa de crescimento
   - Comparação com período anterior
   - Top 5 produtos mais vendidos
   - Top 5 serviços mais solicitados

### ✅ Relatórios

1. Toque em **Relatórios**
2. Veja a performance de cada funcionário:
   - Total de agendamentos
   - Taxa de conclusão
   - Avaliação média
   - Reviews recebidos

---

## 🧪 Testar Endpoints da API

### Via cURL

```bash
# 1. Login
curl -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "gerente@hobbybichos.com",
    "password": "senha123"
  }'

# Copie o token retornado

# 2. Dashboard
curl http://localhost:3333/manager/dashboard \
  -H "Authorization: Bearer SEU_TOKEN"

# 3. Criar Serviço
curl -X POST http://localhost:3333/manager/services \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tosa Completa",
    "price": 80,
    "durationMin": 90
  }'

# 4. Receita do Mês
curl http://localhost:3333/manager/financial/revenue?period=month \
  -H "Authorization: Bearer SEU_TOKEN"

# 5. Top Produtos
curl http://localhost:3333/manager/financial/top-products?limit=5 \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Via Postman/Insomnia

1. Importe a coleção de endpoints
2. Configure a variável `{{baseUrl}}` = `http://localhost:3333`
3. Faça login e salve o token
4. Teste todos os endpoints

---

## 📊 Criar Dados de Teste

### Script SQL (executar no Postgres)

```sql
-- Criar loja de teste
INSERT INTO stores (id, name, slug, phone, address, city, state, is_active)
VALUES (
  'loja-teste-001',
  'Loja Teste',
  'loja-teste',
  '11999999999',
  'Rua Teste, 123',
  'São Paulo',
  'SP',
  true
);

-- Criar usuário MANAGER
INSERT INTO users (id, name, email, password, phone, role, store_id)
VALUES (
  'manager-001',
  'Gerente Teste',
  'gerente@teste.com',
  '$2b$10$hash_aqui', -- use bcrypt para gerar
  '11988888888',
  'MANAGER',
  'loja-teste-001'
);

-- Criar serviços
INSERT INTO services (id, store_id, name, price, duration_min)
VALUES 
  ('srv-001', 'loja-teste-001', 'Banho', 40.00, 45),
  ('srv-002', 'loja-teste-001', 'Tosa', 60.00, 60),
  ('srv-003', 'loja-teste-001', 'Banho e Tosa', 90.00, 120);

-- Criar pedidos (para ter dados financeiros)
INSERT INTO orders (id, store_id, user_id, total, status, created_at)
VALUES 
  ('ord-001', 'loja-teste-001', 'user-001', 150.00, 'PAID', NOW() - INTERVAL '5 days'),
  ('ord-002', 'loja-teste-001', 'user-002', 200.00, 'PAID', NOW() - INTERVAL '3 days'),
  ('ord-003', 'loja-teste-001', 'user-003', 180.00, 'PAID', NOW());
```

---

## 🐛 Resolução de Problemas

### "Acesso Negado"
**Problema:** Usuário não é MANAGER/OWNER  
**Solução:** Verifique a role no banco:
```sql
SELECT id, name, email, role FROM users WHERE email = 'seu@email.com';
```

### Dashboard vazio
**Problema:** Sem dados na loja  
**Solução:** Crie dados de teste usando o script SQL acima

### Token expirado
**Problema:** JWT expirou  
**Solução:** Faça login novamente

### Erro de conexão
**Problema:** API não está rodando  
**Solução:** 
```bash
cd api
npm run start:dev
```

---

## 📱 Navegação no App

```
Home (MANAGER) ──┬── Dashboard
                 ├── Gestão de Serviços ──┬── Lista de Serviços
                 │                        ├── Criar Serviço
                 │                        └── Editar Serviço
                 ├── Financeiro ──┬── Receita por Período
                 │                ├── Top Produtos
                 │                └── Top Serviços
                 └── Relatórios ──── Performance da Equipe
```

---

## 🎨 Cores das Métricas

| Métrica | Cor | Código |
|---------|-----|--------|
| Agendamentos | Azul | `#3B82F6` |
| Concluídos | Verde | `#10B981` |
| Pedidos | Roxo | `#8B5CF6` |
| Receita | Amarelo | `#F59E0B` |
| Serviços | Rosa | `#EC4899` |
| Funcionários | Ciano | `#06B6D4` |

---

## ✅ Checklist de Testes

- [ ] Login como MANAGER funciona
- [ ] Redirecionamento automático para /manager
- [ ] Dashboard carrega métricas
- [ ] Pull-to-refresh funciona
- [ ] Criar novo serviço
- [ ] Editar serviço existente
- [ ] Ativar/desativar serviço
- [ ] Filtrar receita por período
- [ ] Ver top produtos
- [ ] Ver top serviços
- [ ] Ver performance dos funcionários
- [ ] Dark mode funciona corretamente
- [ ] Navegação entre telas fluida

---

## 📞 Precisa de Ajuda?

1. Consulte [MANAGER_DASHBOARD_DOCUMENTATION.md](./MANAGER_DASHBOARD_DOCUMENTATION.md)
2. Verifique logs da API no console
3. Use React Native Debugger para mobile

---

**Pronto para usar! 🎉**
