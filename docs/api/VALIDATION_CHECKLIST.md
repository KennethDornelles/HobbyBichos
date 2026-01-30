# 🧪 Guia de Validação - Normalização de MemberCode

## ✅ Passos de Validação

### 1. Executar Testes Unitários

```bash
cd api
npm run test -- users.service.spec.ts
```

**Resultado Esperado**: ✅ 19 tests passing

---

### 2. Iniciar a Aplicação em Modo Desenvolvimento

```bash
cd api
npm run start:dev
```

**Observar Logs**:
```
✅ Prisma conectado ao PostgreSQL
✅ Middleware de normalização de MemberCode ativado
```

---

### 3. Testar Atribuição de Código (Lowercase)

```bash
curl -X POST "http://localhost:3000/api/users/code" \
  -H "Content-Type: application/json" \
  -d '{"email":"kennetholusegun@gmail.com","code":"user12345"}'
```

**Logs Esperados**:
```
[MemberCode] 🎫 Atribuindo código: original="user12345" → normalizado="USER12345"
[MemberCode] ✅ Código atribuído com sucesso ao usuário XXX: "USER12345"
[Middleware] 🎫 MemberCode.upsert normalizando: "user12345" → "USER12345"
```

**Resposta Esperada**:
```json
{
  "code": "USER12345",
  "userId": "...",
  "createdAt": "..."
}
```

---

### 4. Buscar Código em UPPERCASE

```bash
curl "http://localhost:3000/api/users/code/USER12345"
```

**Logs Esperados**:
```
[MemberCode] 🎫 Buscando código: "USER12345"
[MemberCode] 🎫 Código normalizado: "USER12345"
[MemberCode] ✅ Código encontrado para usuário: ...
[Middleware] 🎫 MemberCode.findUnique normalizando busca: "USER12345" → "USER12345"
```

**Resposta Esperada**: ✅ Usuário encontrado com sucesso

---

### 5. Buscar Código em LOWERCASE (Teste Principal!)

```bash
curl "http://localhost:3000/api/users/code/user12345"
```

**Esperado**: ✅ Retorna o usuário (apesar de salvo como "USER12345")

**Logs Esperados**:
```
[MemberCode] 🎫 Buscando código: "user12345"
[MemberCode] 🎫 Código normalizado: "USER12345"
[MemberCode] ✅ Código encontrado para usuário: ...
[Middleware] 🎫 MemberCode.findUnique normalizando busca: "user12345" → "USER12345"
```

---

### 6. Buscar Código com Espaços

```bash
curl "http://localhost:3000/api/users/code/%20user12345%20"
```

**Esperado**: ✅ Retorna o usuário

**Logs Esperados**:
```
[MemberCode] 🎫 Buscando código: "  user12345  "
[MemberCode] 🎫 Código normalizado: "USER12345"
[MemberCode] ✅ Código encontrado para usuário: ...
```

---

### 7. Buscar Código em Mixed-Case

```bash
curl "http://localhost:3000/api/users/code/UsEr12345"
```

**Esperado**: ✅ Retorna o usuário

---

### 8. Verificar Banco de Dados

Conecte ao PostgreSQL e execute:

```sql
SELECT code, "userId" FROM member_codes LIMIT 5;
```

**Esperado**: ✅ Todos os códigos em UPPERCASE

```
    code    |         userId
------------+---------------------------
USER12345  | xxxxxxxx-xxxx-xxxx-xxxx-xxxxx
```

---

## 🎯 Checklist de Validação

- [ ] Testes unitários passam (19/19)
- [ ] Aplicação inicia com logs de Prisma conectado
- [ ] Middleware de normalização ativado
- [ ] Atribuição de código em lowercase salva como UPPERCASE
- [ ] Busca em uppercase encontra o código
- [ ] Busca em lowercase encontra o código
- [ ] Busca com espaços encontra o código
- [ ] Busca em mixed-case encontra o código
- [ ] Banco de dados armazena todos os códigos em UPPERCASE
- [ ] Logs aparecem corretamente no console

---

## 🐛 Troubleshooting

### Problema: Códigos não estão em UPPERCASE no banco

**Solução**:
1. Verifique se o middleware está sendo carregado
2. Aguarde a aplicação inicializar completamente
3. Reinicie a aplicação
4. Limpe o banco de dados e teste novamente

```bash
# Verificar logs
grep -i "middleware" logs.txt
```

### Problema: Busca em lowercase retorna 404

**Solução**:
1. Verifique que o código está realmente armazenado
2. Verifique os logs de normalização
3. Certifique-se que está usando a rota correta
4. Teste com curl verbose:

```bash
curl -v "http://localhost:3000/api/users/code/user12345"
```

### Problema: Testes falhando

**Solução**:
1. Instale dependências: `npm install`
2. Limpe cache Jest: `npm run test -- --clearCache`
3. Execute testes novamente: `npm run test -- users.service.spec.ts`

---

## 📊 Logs para Monitorar

### Em Desenvolvimento (NODE_ENV=development)

```
✅ Prisma conectado ao PostgreSQL
✅ Middleware de normalização de MemberCode ativado
[MemberCode] 🎫 Atribuindo código: original="user123" → normalizado="USER123"
[MemberCode] 🎫 Buscando código: "user123"
[MemberCode] ✅ Código encontrado para usuário: ...
[Middleware] 🎫 MemberCode.create normalizando: "user123" → "USER123"
```

### Verificar Variável de Ambiente

```bash
# No terminal da API
echo $NODE_ENV  # Deve ser 'development'
```

---

## 🚀 Sucesso!

Se todos os pontos do checklist estiverem marcados, a implementação está **100% funcional**! 🎉

A normalização de códigos de membro está garantida em todos os cenários.
