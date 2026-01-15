# 🧪 Exemplos de Uso da API - Dashboard de Employee

## 🔐 Autenticação

Primeiro, faça login para obter o token:

```bash
# Login como employee
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employee@hobbybichos.com",
    "password": "senha123"
  }'

# Resposta:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Employee Teste",
    "email": "employee@hobbybichos.com",
    "role": "EMPLOYEE",
    "storeId": "hobby_geisel"
  }
}
```

## 📊 Dashboard do Employee

```bash
# Buscar dashboard
curl -X GET http://localhost:3000/api/appointments/employee/dashboard \
  -H "Authorization: Bearer {SEU_TOKEN_AQUI}"

# Resposta:
{
  "employeeId": "uuid-do-employee",
  "employeeName": "Employee Teste",
  "todayAppointments": [
    {
      "id": "uuid-do-agendamento",
      "startsAt": "2026-01-15T14:00:00.000Z",
      "status": "SCHEDULED",
      "petName": "Rex",
      "petSpecies": "Cachorro",
      "clientName": "João Silva",
      "serviceName": "Banho e Tosa",
      "servicePrice": 50.00,
      "serviceDuration": 60,
      "notes": null
    }
  ],
  "upcomingAppointments": [
    {
      "id": "uuid-do-agendamento-2",
      "startsAt": "2026-01-16T10:00:00.000Z",
      "status": "SCHEDULED",
      "petName": "Mia",
      "petSpecies": "Gato",
      "clientName": "Maria Santos",
      "serviceName": "Banho",
      "servicePrice": 35.00,
      "serviceDuration": 30,
      "notes": "Gato nervoso, usar luvas"
    }
  ],
  "totalAppointmentsToday": 5,
  "completedAppointmentsToday": 2,
  "cancelledAppointmentsToday": 0
}
```

## ✏️ Atualizar Status

### Marcar como Concluído
```bash
curl -X PATCH http://localhost:3000/api/appointments/{ID_DO_AGENDAMENTO}/status \
  -H "Authorization: Bearer {SEU_TOKEN_AQUI}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED",
    "notes": "Serviço realizado com sucesso. Pet ficou calmo durante o procedimento."
  }'

# Resposta:
{
  "id": "uuid-do-agendamento",
  "startsAt": "2026-01-15T14:00:00.000Z",
  "status": "COMPLETED",
  "petName": "Rex",
  "clientName": "João Silva",
  "serviceName": "Banho e Tosa",
  "notes": "Serviço realizado com sucesso. Pet ficou calmo durante o procedimento."
}
```

### Marcar como Cancelado
```bash
curl -X PATCH http://localhost:3000/api/appointments/{ID_DO_AGENDAMENTO}/status \
  -H "Authorization: Bearer {SEU_TOKEN_AQUI}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CANCELLED",
    "notes": "Cliente não compareceu ao horário marcado."
  }'
```

### Reagendar (voltar para SCHEDULED)
```bash
curl -X PATCH http://localhost:3000/api/appointments/{ID_DO_AGENDAMENTO}/status \
  -H "Authorization: Bearer {SEU_TOKEN_AQUI}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SCHEDULED",
    "notes": "Reagendado para novo horário."
  }'
```

## 📋 Buscar Todos os Agendamentos

```bash
# Todos os agendamentos da loja
curl -X GET http://localhost:3000/api/appointments \
  -H "Authorization: Bearer {SEU_TOKEN_AQUI}"

# Agendamentos de uma data específica
curl -X GET "http://localhost:3000/api/appointments?date=2026-01-15" \
  -H "Authorization: Bearer {SEU_TOKEN_AQUI}"

# Agendamentos de uma loja específica (para SUPER_ADMIN)
curl -X GET "http://localhost:3000/api/appointments?storeId=hobby_geisel" \
  -H "Authorization: Bearer {SEU_TOKEN_AQUI}"
```

## 🔍 Buscar Agendamento Específico

```bash
curl -X GET http://localhost:3000/api/appointments/{ID_DO_AGENDAMENTO} \
  -H "Authorization: Bearer {SEU_TOKEN_AQUI}"

# Resposta:
{
  "id": "uuid-do-agendamento",
  "storeId": "hobby_geisel",
  "startsAt": "2026-01-15T14:00:00.000Z",
  "professionalId": "uuid-do-employee",
  "userId": "uuid-do-cliente",
  "petId": "uuid-do-pet",
  "serviceId": "uuid-do-servico",
  "status": "SCHEDULED",
  "notes": null,
  "createdAt": "2026-01-10T10:00:00.000Z",
  "updatedAt": "2026-01-10T10:00:00.000Z",
  "store": {
    "id": "hobby_geisel",
    "name": "Hobby Bichos Geisel"
  },
  "pet": {
    "id": "uuid-do-pet",
    "name": "Rex"
  },
  "service": {
    "id": "uuid-do-servico",
    "name": "Banho e Tosa",
    "price": 50.00
  },
  "professional": {
    "id": "uuid-do-employee",
    "name": "Employee Teste"
  }
}
```

## ❌ Erros Comuns

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```
**Solução**: Verifique se o token está correto e não expirado.

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Apenas employees podem acessar o dashboard"
}
```
**Solução**: Faça login com uma conta de employee (role: EMPLOYEE).

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Agendamento não encontrado"
}
```
**Solução**: Verifique se o ID do agendamento está correto e pertence à loja do employee.

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Employee não possui loja associada"
}
```
**Solução**: O employee precisa estar associado a uma loja (storeId não pode ser null).

## 🧪 Testando com Postman

### 1. Criar Collection
- Nome: "Employee Dashboard"

### 2. Adicionar Variáveis
- `base_url`: http://localhost:3000/api
- `token`: (será preenchido após login)

### 3. Criar Requests

#### Login
```
POST {{base_url}}/auth/login
Body (JSON):
{
  "email": "employee@hobbybichos.com",
  "password": "senha123"
}

Script (Tests):
pm.environment.set("token", pm.response.json().access_token);
```

#### Dashboard
```
GET {{base_url}}/appointments/employee/dashboard
Headers:
Authorization: Bearer {{token}}
```

#### Atualizar Status
```
PATCH {{base_url}}/appointments/:appointmentId/status
Headers:
Authorization: Bearer {{token}}
Body (JSON):
{
  "status": "COMPLETED",
  "notes": "Serviço concluído"
}
```

## 🎯 Cenários de Teste

### Cenário 1: Dia Normal
1. Login como employee
2. Buscar dashboard
3. Verificar agendamentos de hoje
4. Completar primeiro agendamento
5. Verificar email enviado ao cliente

### Cenário 2: Cancelamento
1. Buscar agendamento específico
2. Cancelar com motivo
3. Verificar status atualizado

### Cenário 3: Reagendamento
1. Buscar agendamento cancelado
2. Voltar status para SCHEDULED
3. Adicionar nota de reagendamento

### Cenário 4: Sem Agendamentos
1. Login em loja sem agendamentos
2. Verificar estado vazio no dashboard

## 📊 Monitoramento

```bash
# Ver logs do backend
cd api
npm run start:dev

# Logs em tempo real:
[Nest] INFO [AppointmentsService] Dashboard solicitado por employee: uuid
[Nest] INFO [AppointmentsService] Agendamentos de hoje: 5
[Nest] INFO [AppointmentsService] Próximos agendamentos: 10
[Nest] INFO [MailService] Email enviado para: cliente@example.com
```

## 🔗 Links Úteis

- **Swagger**: http://localhost:3000/api-docs
- **Dashboard Frontend**: /employee/dashboard
- **Seed Data**: `npm run seed` no diretório api

---

**Dica**: Use ferramentas como Postman, Insomnia ou cURL para testar a API antes de integrar com o frontend.
