# 🚀 Guia Rápido: Dashboard de Employee

## Como Acessar

### 1. Login como Employee
```typescript
// No app mobile, fazer login com credenciais de employee
email: "employee@hobbyichos.com"
role: "EMPLOYEE"
storeId: "uuid-da-loja"
```

### 2. Navegar para o Dashboard
```typescript
import { router } from 'expo-router';

// De qualquer lugar no app:
router.push('/employee/dashboard');
```

### 3. Usar no código
```tsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user } = useAuth();
  
  // Verificar se é employee
  if (user?.role === 'EMPLOYEE') {
    return (
      <Button onPress={() => router.push('/employee/dashboard')}>
        Ir para Dashboard
      </Button>
    );
  }
  
  return null;
}
```

## Endpoints da API

### Dashboard
```bash
GET http://localhost:3000/api/appointments/employee/dashboard
Authorization: Bearer {token}
```

### Atualizar Status
```bash
PATCH http://localhost:3000/api/appointments/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "COMPLETED",
  "notes": "Serviço realizado com sucesso"
}
```

## Testar com Seed

```bash
cd api
npm run seed

# Usuários criados:
# - super-admin@hobbybichos.com (SUPER_ADMIN)
# - owner@hobbybichos.com (OWNER)
# - manager@hobbybichos.com (MANAGER)
# - employee@hobbybichos.com (EMPLOYEE) ← Use este
# - client@hobbybichos.com (CLIENT)
```

## Exemplo de Uso Completo

```tsx
// Em HomeScreen.tsx ou outro componente
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { user } = useAuth();
  
  return (
    <View>
      {user?.role === 'EMPLOYEE' && (
        <Pressable 
          onPress={() => router.push('/employee/dashboard')}
          style={{ 
            backgroundColor: '#3B82F6', 
            padding: 16, 
            borderRadius: 12 
          }}
        >
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
            📊 Dashboard de Serviços
          </Text>
        </Pressable>
      )}
    </View>
  );
}
```

## Status Possíveis

- `SCHEDULED`: Agendado (azul)
- `COMPLETED`: Concluído (verde)
- `CANCELLED`: Cancelado (vermelho)

## Recursos

- ✅ Auto-refresh a cada 30s
- ✅ Pull-to-refresh
- ✅ Tema claro/escuro
- ✅ Notificações por email
- ✅ Estatísticas em tempo real
- ✅ Lista de hoje e próximos agendamentos

## Próximos Passos

1. Adicionar botão no menu principal para employees
2. Adicionar notificações push
3. Implementar filtros avançados
# 🚀 Guia Rápido: Dashboard de Employee

## Como Acessar

### 1. Login como Employee
```typescript
// No app mobile, fazer login com credenciais de employee
email: "employee@hobbyichos.com"
role: "EMPLOYEE"
storeId: "uuid-da-loja"
```

### 2. Navegar para o Dashboard
```typescript
import { router } from 'expo-router';

// De qualquer lugar no app:
router.push('/employee/dashboard');
```

### 3. Usar no código
```tsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user } = useAuth();
  
  // Verificar se é employee
  if (user?.role === 'EMPLOYEE') {
    return (
      <Button onPress={() => router.push('/employee/dashboard')}>
        Ir para Dashboard
      </Button>
    );
  }
  
  return null;
}
```

## Endpoints da API

### Dashboard
```bash
GET http://localhost:3000/api/appointments/employee/dashboard
Authorization: Bearer {token}
```

### Atualizar Status
```bash
PATCH http://localhost:3000/api/appointments/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "COMPLETED",
  "notes": "Serviço realizado com sucesso"
}
```

## Testar com Seed

```bash
cd api
npm run seed

# Usuários criados:
# - super-admin@hobbybichos.com (SUPER_ADMIN)
# - owner@hobbybichos.com (OWNER)
# - manager@hobbybichos.com (MANAGER)
# - employee@hobbybichos.com (EMPLOYEE) ← Use este
# - client@hobbybichos.com (CLIENT)
# 🚀 Guia Rápido: Dashboard de Employee

## Como Acessar

### 1. Login como Employee
```typescript
// No app mobile, fazer login com credenciais de employee
email: "employee@hobbyichos.com"
role: "EMPLOYEE"
storeId: "uuid-da-loja"
```

## Exemplo de Uso Completo
### 2. Navegar para o Dashboard
```typescript
import { router } from 'expo-router';

// De qualquer lugar no app:
router.push('/employee/dashboard');
```

### 3. Usar no código
```tsx
// Em HomeScreen.tsx ou outro componente
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';

export default function HomeScreen() {
function MyComponent() {
  const { user } = useAuth();
  
  return (
    <View>
      {user?.role === 'EMPLOYEE' && (
        <Pressable 
          onPress={() => router.push('/employee/dashboard')}
          style={{ 
            backgroundColor: '#3B82F6', 
            padding: 16, 
            borderRadius: 12 
          }}
        >
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
            📊 Dashboard de Serviços
          </Text>
        </Pressable>
      )}
    </View>
  );
  // Verificar se é employee
  if (user?.role === 'EMPLOYEE') {
    return (
      <Button onPress={() => router.push('/employee/dashboard')}>
        Ir para Dashboard
      </Button>
    );
  }
  
  return null;
}
```

## Status Possíveis
## Endpoints da API

- `SCHEDULED`: Agendado (azul)
- `COMPLETED`: Concluído (verde)
- `CANCELLED`: Cancelado (vermelho)
### Dashboard
```bash
GET http://localhost:3000/api/appointments/employee/dashboard
Authorization: Bearer {token}
```

## Recursos
### Atualizar Status
```bash
PATCH http://localhost:3000/api/appointments/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

- ✅ Auto-refresh a cada 30s
- ✅ Pull-to-refresh
- ✅ Tema claro/escuro
- ✅ Notificações por email
- ✅ Estatísticas em tempo real
- ✅ Lista de hoje e próximos agendamentos
{
  "status": "COMPLETED",
  "notes": "Serviço realizado com sucesso"
}
```

## Próximos Passos
## Testar com Seed

1. Adicionar botão no menu principal para employees
2. Adicionar notificações push
3. Implementar filtros avançados
```bash
cd api
npm run seed

4. Adicionar relatórios mensais
4. Adicionar relatórios mensais
