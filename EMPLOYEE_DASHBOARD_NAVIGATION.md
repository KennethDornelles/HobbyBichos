# 🔗 Integração do Dashboard na Navegação

## Adicionar Botão na Home para Employees

### Opção 1: Modificar HomeScreen.tsx

Adicione este código em [HomeScreen.tsx](mobile/src/screens/Home/HomeScreen.tsx):

```tsx
import { useAuth } from '../../context/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  // ... código existente ...
  
  // Adicionar após mainActions
  const employeeActions: ActionCardItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      subtitle: 'Meus agendamentos',
      icon: Clock3, // ou outro ícone
      route: '/employee/dashboard',
    },
  ];
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ... código existente ... */}
      
      {/* Adicionar seção para employees */}
      {user?.role === 'EMPLOYEE' && (
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: '600', 
            color: colors.text,
            marginBottom: 12 
          }}>
            🎯 Área do Funcionário
          </Text>
          
          {employeeActions.map((action) => (
            <ActionCard
              key={action.id}
              title={action.title}
              subtitle={action.subtitle}
              icon={action.icon}
              onPress={() => handleCardAction(action.route)}
            />
          ))}
        </View>
      )}
      
      {/* ... resto do código ... */}
    </SafeAreaView>
  );
}
```

### Opção 2: Criar QuickAction para Dashboard

```tsx
// Adicionar aos quickActions somente se for employee
const quickActions: QuickActionItem[] = [
  { id: '1', icon: Clock, label: 'Delivery Rápido' },
  { id: '2', icon: Tag, label: 'Promoções' },
  { id: '4', icon: Star, label: 'Clube Hobby' },
  { id: '5', icon: Scissors, label: 'Serviços Pet' },
  // Adicionar se for employee:
  ...(user?.role === 'EMPLOYEE' ? [
    { id: 'dashboard', icon: Clock3, label: 'Dashboard' }
  ] : []),
];

// E no handler:
const handleQuickAction = (id: string) => {
  if (id === 'dashboard') {
    router.push('/employee/dashboard');
    return;
  }
  // ... resto do código ...
};
```

### Opção 3: Adicionar no Menu Lateral

Em [SideMenu.tsx](mobile/src/components/SideMenu.tsx):

```tsx
import { useAuth } from '../context/AuthContext';

export function SideMenu({ visible, onClose }: SideMenuProps) {
  const { user } = useAuth();
  const router = useRouter();
  
  const menuItems = [
    // ... itens existentes ...
    
    // Adicionar para employees:
    ...(user?.role === 'EMPLOYEE' ? [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: Clock3,
        route: '/employee/dashboard',
      },
    ] : []),
  ];
  
  return (
    // ... código existente ...
  );
}
```

### Opção 4: Criar Seção Dedicada

Criar um componente `EmployeeSection.tsx`:

```tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Clock3, CheckCircle, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

export function EmployeeSection() {
  const router = useRouter();
  const { isDark } = useTheme();
  
  const bgColor = isDark ? '#252F4D' : '#FFFFFF';
  const textColor = isDark ? '#E0E0E0' : '#1F2937';
  
  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
      <Text style={{ 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: textColor,
        marginBottom: 16 
      }}>
        👨‍💼 Área do Funcionário
      </Text>
      
      <Pressable
        onPress={() => router.push('/employee/dashboard')}
        style={{
          backgroundColor: '#3B82F6',
          borderRadius: 16,
          padding: 20,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 16,
        }}>
          <Clock3 size={24} color="#FFFFFF" />
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: 'bold', 
            color: '#FFFFFF',
            marginBottom: 4 
          }}>
            Dashboard de Serviços
          </Text>
          <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.8)' }}>
            Gerencie seus agendamentos
          </Text>
        </View>
        
        <View style={{ marginLeft: 12 }}>
          <Text style={{ fontSize: 24 }}>→</Text>
        </View>
      </Pressable>
      
      {/* Botões secundários */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Pressable
          onPress={() => router.push('/appointments')}
          style={{
            flex: 1,
            backgroundColor: bgColor,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: isDark ? '#3F4558' : '#E5E7EB',
            alignItems: 'center',
          }}
        >
          <Calendar size={24} color="#3B82F6" />
          <Text style={{ 
            fontSize: 12, 
            color: textColor, 
            marginTop: 8,
            textAlign: 'center' 
          }}>
            Agenda
          </Text>
        </Pressable>
        
        <Pressable
          onPress={() => router.push('/appointments?status=completed')}
          style={{
            flex: 1,
            backgroundColor: bgColor,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: isDark ? '#3F4558' : '#E5E7EB',
            alignItems: 'center',
          }}
        >
          <CheckCircle size={24} color="#10B981" />
          <Text style={{ 
            fontSize: 12, 
            color: textColor, 
            marginTop: 8,
            textAlign: 'center' 
          }}>
            Concluídos
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
```

E usar na HomeScreen:

```tsx
import { EmployeeSection } from '../../components/EmployeeSection';

export default function HomeScreen() {
  const { user } = useAuth();
  
  return (
    <ScrollView>
      {/* ... código existente ... */}
      
      {user?.role === 'EMPLOYEE' && <EmployeeSection />}
      
      {/* ... resto do código ... */}
    </ScrollView>
  );
}
```

## Recomendação Final

**Use a Opção 4** - Criar um componente dedicado `EmployeeSection.tsx` porque:

1. ✅ Mantém o código organizado e modular
2. ✅ Fácil de manter e atualizar
3. ✅ Visual atraente e profissional
4. ✅ Pode ser reutilizado em outras telas
5. ✅ Não polui o código da HomeScreen

## Exemplo Completo de Integração

```tsx
// mobile/src/components/EmployeeSection.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Clock3 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

export function EmployeeSection() {
  const router = useRouter();
  const { isDark } = useTheme();
  
  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
      <Pressable
        onPress={() => router.push('/employee/dashboard')}
        style={{
          backgroundColor: '#3B82F6',
          borderRadius: 16,
          padding: 20,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Clock3 size={32} color="#FFFFFF" style={{ marginRight: 16 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: 'bold', 
            color: '#FFFFFF' 
          }}>
            📊 Dashboard de Serviços
          </Text>
          <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.8)' }}>
            Toque para gerenciar agendamentos
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
```

```tsx
// mobile/src/screens/Home/HomeScreen.tsx
import { EmployeeSection } from '../../components/EmployeeSection';
import { useAuth } from '../../context/AuthContext';

export default function HomeScreen() {
  const { user } = useAuth();
  
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <HomeHeader onMenuPress={() => setMenuVisible(true)} />
        <UserGreeting name={name} points={points} />
        
        {/* ADICIONAR AQUI */}
        {user?.role === 'EMPLOYEE' && <EmployeeSection />}
        
        {/* Resto do conteúdo */}
        <QuickActions />
        <MainActions />
        {/* ... */}
      </ScrollView>
    </SafeAreaView>
  );
}
```

## Testando

1. **Faça login como employee**
2. **Navegue para home**
3. **Veja o botão do dashboard**
4. **Toque para acessar**

## Resultado Final

O usuário verá:
- 🎯 Seção destacada azul com ícone de relógio
- 📊 Título "Dashboard de Serviços"
- 💡 Subtítulo explicativo
- ✨ Animação ao tocar (pressable)
- 🎨 Tema claro/escuro automático

---

**Pronto!** Agora os employees têm acesso fácil ao dashboard direto da home.
