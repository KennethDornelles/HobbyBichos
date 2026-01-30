# Referência de Componentes - Edição de Perfil e Tema

## 📁 Arquivos Criados/Modificados

### 1. **app/profile/edit.tsx** ✅ CRIADO

```typescript
// Componente principal de edição de perfil
export default function EditProfile() {
  // - Header com gradiente
  // - Avatar com borda amarela
  // - Formulário com 4 campos (Nome, Email, Telefone, Endereço)
  // - Validações de email e campos obrigatórios
  // - Botão Salvar com loading state
  // - Suporte a tema claro/escuro
}
```

**Props do ThemeContext utilizadas:**
- `isDark` - Boolean para determinar tema atual
- `useTheme()` - Hook para acessar contexto de tema

**Props do AuthContext utilizadas:**
- `user` - Dados do usuário logado
- `setUser` - Atualiza dados do usuário

**Dependências:**
- `expo-router` - Para navegação e router.back()
- `expo-linear-gradient` - Para gradiente no header
- `lucide-react-native` - Para ícones (User, Mail, Phone, MapPin, Camera, ArrowLeft)

---

### 2. **app/settings.tsx** ✅ CRIADO

```typescript
// Componente de configurações com seletor de tema
export default function Settings() {
  // - Seção "Aparência" com ícone Palette
  // - Três opções: Sistema, Claro, Escuro
  // - Componente ThemeOption customizado
  // - Seção "Sobre" com informações do app
  // - Suporte a tema claro/escuro
}

// Componente interno para cada opção de tema
function ThemeOption({ mode, icon, label }) {
  // - Renderiza com cor ativa (amarelo) ou inativa
  // - Mostra ícone + label
  // - OnPress chama setThemeMode
}
```

**Props do ThemeContext utilizadas:**
- `themeMode` - Modo atual (system/light/dark)
- `setThemeMode()` - Altera modo de tema
- `isDark` - Para determinar cores de renderização

**Dependências:**
- `expo-router` - Para estrutura de tela
- `lucide-react-native` - Para ícones (Palette, Sun, Moon, Smartphone)

---

### 3. **src/components/SideMenu.tsx** ✅ MODIFICADO

**Alterações realizadas:**

1. **handleProfilePress()** - Linha ~135
```typescript
// ANTES:
const handleProfilePress = () => {
    onClose();
    navigation.navigate("Profile");
};

// DEPOIS:
const handleProfilePress = () => {
    onClose();
    router.push('/profile/edit');
};
```

2. **menuItems array** - Linha ~72
```typescript
// Adicionado novo item:
{ icon: "settings", label: "Configurações" }
```

3. **handlePress function** - Linha ~176
```typescript
// Adicionado novo caso:
if (item.label === "Configurações") {
    onClose();
    router.push('/settings');
    return;
}
```

---

### 4. **app/_layout.tsx** ✅ JÁ ESTAVA CONFIGURADO

```typescript
// Estrutura existente já correta:
<ThemeProvider>
  <AuthProvider>
    <Stack screenOptions={{ headerShown: false }} />
  </AuthProvider>
</ThemeProvider>
```

**Observação**: ThemeProvider envolve AuthProvider, garantindo que tema carrega antes de renderizar.

---

### 5. **tailwind.config.js** ✅ MODIFICADO

**Cores adicionadas:**
```javascript
colors: {
  'hobby-dark': '#10142D',
  'hobby-yellow': '#FFD600',
  'hobby-ice': '#F4F4F6',
}

borderRadius: {
  'hobby': '30px',
}
```

**Como usar no código:**
```tsx
<View className="bg-hobby-dark rounded-hobby">
  {/* ... */}
</View>
```

---

## 🎯 Estrutura de Componentes

```
app/
├── _layout.tsx (atualizado)
├── settings.tsx (novo)
├── profile/
│   └── edit.tsx (novo)
└── ... (outros arquivos)

src/
├── components/
│   └── SideMenu.tsx (modificado)
├── context/
│   ├── AuthContext.tsx (existente)
│   └── ThemeContext.tsx (existente)
└── ... (outros arquivos)
```

---

## 🔌 Integração com Contextos

### ThemeContext
```typescript
interface ThemeContextType {
    themeMode: ThemeMode;           // 'system' | 'light' | 'dark'
    resolvedTheme: ResolvedTheme;   // 'light' | 'dark'
    isDark: boolean;                // true se tema escuro
    setThemeMode: (mode: ThemeMode) => Promise<void>;
    toggleTheme: () => Promise<void>;
}

// Uso:
const { isDark, themeMode, setThemeMode } = useTheme();
```

### AuthContext
```typescript
interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    signOut: () => Promise<void>;
    isLoading: boolean;
}

// Uso:
const { user, setUser } = useAuth();
```

---

## 🎨 Paleta de Cores Utilizada

| Variável | Hex | Contexto |
|----------|-----|---------|
| hobby-dark | #10142D | Background tema dark |
| hobby-yellow | #FFD600 | Accent/Botões primários |
| hobby-ice | #F4F4F6 | Background tema light |
| (input-dark) | #2A2F4F | Input em tema dark |
| (border) | #2A2F4F | Bordas em tema dark |

---

## 📦 Componentes Lucide-React Utilizados

| Ícone | Uso | Arquivo |
|-------|-----|---------|
| User | Perfil/Avatar | edit.tsx, settings.tsx |
| Mail | Email | edit.tsx |
| Phone | Telefone | edit.tsx |
| MapPin | Endereço | edit.tsx |
| Camera | Upload de avatar | edit.tsx |
| ArrowLeft | Voltar | edit.tsx |
| Palette | Aparência/Tema | settings.tsx |
| Sun | Tema Claro | settings.tsx |
| Moon | Tema Escuro | settings.tsx |
| Smartphone | Tema Sistema | settings.tsx |

---

## 🔄 Fluxo de Estados

### Edição de Perfil
```
1. useEffect carrega dados do user → setName, setEmail, etc
2. Usuário preenche inputs → state atualiza
3. Click em "Salvar" → validação
4. Se válido → setUser(updatedUser) → Alert → router.back()
5. Se inválido → Alert com mensagem de erro
```

### Seletor de Tema
```
1. Component monta → isMounted = true
2. useTheme() fornece themeMode atual
3. User clica em opção → setThemeMode(mode)
4. ThemeContext salva em AsyncStorage
5. isDark recalcula baseado no novo themeMode
6. Component re-renderiza com novas cores
```

---

## ✅ Verificações de Tipo (TypeScript)

### EditProfile.tsx
```typescript
type ThemeMode = 'system' | 'light' | 'dark';
type AuthContextType = { user: any; setUser: (u: any) => void };
type ThemeContextType = { isDark: boolean; ... };
```

### Settings.tsx
```typescript
type ThemeMode = 'system' | 'light' | 'dark';
interface ThemeOptionProps {
  mode: ThemeMode;
  icon: LucideIcon;
  label: string;
}
```

---

## 🚀 Performance Considerations

1. **useEffect dependencies** - Otimizado para evitar renders desnecessários
2. **Memoization** - Não utilizado (componentes pequenos)
3. **isMounted flag** - Previne updates após desmontar
4. **isLoading state** - Desabilita input durante salvamento

---

## 🧪 Testes Manuais Necessários

### Edição de Perfil
- [ ] Validação de email
- [ ] Campos obrigatórios
- [ ] Loading state
- [ ] Persistência de dados
- [ ] Navigation back

### Seletor de Tema
- [ ] Alternância tema claro
- [ ] Alternância tema escuro
- [ ] Tema sistema
- [ ] Persistência em AsyncStorage
- [ ] Aplicação em múltiplas telas

---

## 📝 Notas de Desenvolvimento

1. **Theme Colors**: Use `isDark` para determinar cores dinamicamente
2. **Input Validation**: Regex simples para email, adicionar mais validações conforme necessário
3. **User Update**: Atualmente atualiza apenas localmente, implementar API quando necessário
4. **Accessibility**: Todos os botões têm `hitSlop` mínimo de 44x44px
5. **TypeScript**: Uso de `as any` em alguns pontos para compatibilidade com AuthContext não tipado

---

**Última Atualização**: 12 de janeiro de 2026
**Versão da Documentação**: 1.0
