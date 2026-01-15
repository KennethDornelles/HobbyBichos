# 📊 Dashboard Gerencial (MANAGER)

## 🎯 Visão Geral

Sistema completo de gestão gerencial para usuários com perfil **MANAGER** e **OWNER**, incluindo:
- Dashboard gerencial com métricas principais
- Gestão de serviços
- Dashboard financeiro
- Relatórios de performance

---

## 🏗️ Arquitetura

### Backend (API)

**Localização:** `api/src/modules/manager/`

**Arquivos:**
- `manager.module.ts` - Módulo NestJS
- `manager.controller.ts` - Controlador com todos os endpoints
- `manager.service.ts` - Lógica de negócio e acesso aos dados

**Rotas Principais:**
```
GET  /manager/dashboard                    - Dashboard geral
GET  /manager/dashboard/financial          - Dashboard financeiro
GET  /manager/services                     - Listar serviços
POST /manager/services                     - Criar serviço
PUT  /manager/services/:id                 - Atualizar serviço
GET  /manager/financial/revenue            - Receita por período
GET  /manager/financial/top-products       - Produtos mais vendidos
GET  /manager/financial/top-services       - Serviços mais solicitados
GET  /manager/reports/employee-performance - Performance dos funcionários
```

### Mobile (App)

**Localização:** `mobile/app/manager/`

**Rotas:**
- `/manager` - Página inicial com menu
- `/manager/dashboard` - Dashboard gerencial
- `/manager/services` - Gestão de serviços
- `/manager/financial` - Dashboard financeiro
- `/manager/reports` - Relatórios e performance

**Screens:**
- `ManagerDashboardScreen.tsx` - Dashboard principal
- `ServicesManagementScreen.tsx` - CRUD de serviços
- `FinancialDashboardScreen.tsx` - Métricas financeiras
- `ManagerReportsScreen.tsx` - Relatórios de equipe

**Service:**
- `managerService.ts` - Cliente HTTP para comunicação com API

---

## 🔐 Autenticação e Autorização

**Perfis com Acesso:**
- `MANAGER` - Gerente da loja
- `OWNER` - Proprietário

**Proteção:**
- Backend: Guards `@Roles(Role.MANAGER, Role.OWNER)`
- Mobile: Verificação de role com redirecionamento

---

## 📊 Funcionalidades

### 1. Dashboard Gerencial

**Métricas Exibidas:**
- ✅ Agendamentos de hoje
- ✅ Agendamentos concluídos
- ✅ Pedidos do mês
- ✅ Receita do mês
- ✅ Serviços ativos
- ✅ Número de funcionários
- ✅ Próximos agendamentos

**Ações Rápidas:**
- Navegar para Gestão de Serviços
- Navegar para Financeiro
- Navegar para Relatórios
- Navegar para Equipe

### 2. Gestão de Serviços

**Funcionalidades:**
- ✅ Listar todos os serviços
- ✅ Criar novo serviço
- ✅ Editar serviço existente
- ✅ Ativar/Desativar serviço
- ✅ Ver estatísticas por serviço:
  - Total de agendamentos
  - Receita total gerada
  - Taxa de conclusão

**Campos do Serviço:**
- Nome
- Preço
- Duração (minutos)
- Status (Ativo/Inativo)

### 3. Dashboard Financeiro

**Análises:**
- ✅ Receita total por período (hoje, semana, mês, ano)
- ✅ Comparação com período anterior
- ✅ Taxa de crescimento
- ✅ Número de pedidos
- ✅ Top 5 produtos mais vendidos
- ✅ Top 5 serviços mais solicitados

**Visualizações:**
- Card principal de receita
- Comparação de períodos
- Ranking de produtos
- Ranking de serviços

### 4. Relatórios e Performance

**Dados da Equipe:**
- ✅ Performance individual dos funcionários
- ✅ Total de agendamentos por funcionário
- ✅ Agendamentos concluídos/cancelados
- ✅ Taxa de conclusão
- ✅ Avaliação média
- ✅ Número de avaliações recebidas

---

## 🚀 Como Usar

### Backend

1. **Importar o módulo no app.module.ts:**
```typescript
import { ManagerModule } from './modules/manager/manager.module';

@Module({
  imports: [
    // ... outros módulos
    ManagerModule,
  ],
})
```

2. **Testar endpoints:**
```bash
# Obter dashboard
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3333/manager/dashboard

# Criar serviço
curl -X POST -H "Authorization: Bearer <TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Banho","price":50,"durationMin":60}' \\
  http://localhost:3333/manager/services
```

### Mobile

1. **Acessar como MANAGER/OWNER:**
```typescript
// Login com usuário MANAGER ou OWNER
// A tela home.tsx automaticamente redireciona para /manager
```

2. **Navegação:**
```typescript
// Navegar programaticamente
router.push('/manager/dashboard');
router.push('/manager/services');
router.push('/manager/financial');
router.push('/manager/reports');
```

---

## 🎨 Interface

### Cores e Temas

**Cards de Estatísticas:**
- 🔵 Azul (`#3B82F6`) - Agendamentos
- 🟢 Verde (`#10B981`) - Concluídos/Receita
- 🟣 Roxo (`#8B5CF6`) - Pedidos
- 🟡 Amarelo (`#F59E0B`) - Serviços
- 🌸 Rosa (`#EC4899`) - Serviços Ativos
- 🔷 Ciano (`#06B6D4`) - Funcionários

**Suporte a Dark Mode:** ✅ Totalmente implementado

---

## 📝 Exemplos de Uso

### Criar um Serviço

```typescript
import { managerService } from '../services/managerService';

const novoServico = await managerService.createService({
  name: 'Banho e Tosa Completo',
  price: 80,
  durationMin: 90,
  isActive: true,
});
```

### Obter Receita do Mês

```typescript
const receita = await managerService.getRevenue('month');
console.log(receita.total); // Receita total
console.log(receita.growth); // Taxa de crescimento
```

### Listar Performance da Equipe

```typescript
const performance = await managerService.getEmployeePerformance();
performance.employees.forEach(emp => {
  console.log(\`\${emp.employee.name}: \${emp.stats.completionRate}%\`);
});
```

---

## 🔄 Fluxo de Dados

```
┌─────────────────┐
│  Mobile App     │
│  (Manager)      │
└────────┬────────┘
         │
         │ HTTP Request + JWT
         ↓
┌─────────────────┐
│ ManagerService  │ (Frontend)
└────────┬────────┘
         │
         │ API Call
         ↓
┌─────────────────┐
│ API Controller  │ @Roles(MANAGER, OWNER)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Manager Service │ (Backend)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Prisma/Database │
└─────────────────┘
```

---

## 🧪 Testes

### Testar Acesso

1. **Login como MANAGER:**
```typescript
POST /auth/login
{
  "email": "gerente@hobbybichos.com",
  "password": "senha123"
}
```

2. **Verificar Dashboard:**
```typescript
GET /manager/dashboard
Authorization: Bearer <TOKEN>
```

### Casos de Teste

- ✅ Acesso negado para usuários CLIENT
- ✅ Acesso permitido para MANAGER e OWNER
- ✅ Filtros de período funcionando
- ✅ CRUD de serviços completo
- ✅ Estatísticas calculadas corretamente

---

## 📦 Dependências

**Backend:**
- `@nestjs/common`
- `@prisma/client`
- Módulos existentes: Auth, Services, Orders, Appointments

**Mobile:**
- `expo-router`
- `axios`
- `expo-secure-store`
- `@expo/vector-icons`

---

## 🐛 Troubleshooting

### Erro "Acesso Negado"
**Causa:** Usuário não tem role MANAGER ou OWNER
**Solução:** Verificar role no banco de dados ou usar conta apropriada

### Dashboard não carrega
**Causa:** Token expirado ou storeId ausente
**Solução:** Fazer login novamente e verificar se usuário tem storeId

### Estatísticas zeradas
**Causa:** Sem dados no período selecionado
**Solução:** Criar pedidos/agendamentos de teste ou escolher período diferente

---

## 🔮 Próximas Melhorias

- [ ] Exportar relatórios em PDF/Excel
- [ ] Gráficos interativos com Victory Native
- [ ] Push notifications para métricas importantes
- [ ] Metas e objetivos configuráveis
- [ ] Comparação entre lojas (para OWNER multi-loja)
- [ ] Dashboard em tempo real com WebSocket

---

## 📚 Referências

- [NestJS Guards](https://docs.nestjs.com/guards)
- [Prisma Aggregations](https://www.prisma.io/docs/concepts/components/prisma-client/aggregation-grouping-summarizing)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Navigation](https://reactnavigation.org/)

---

**Desenvolvido com ❤️ para HobbyBichos**
