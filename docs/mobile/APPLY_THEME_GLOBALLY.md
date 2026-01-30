# 🎨 Aplicar Tema Globalmente - Guia de Implementação

## 🔧 O que foi corrigido

O tema agora está sendo aplicado globalmente através de:

1. **Root Layout dinâmico** (`app/_layout.tsx`)
   - Background do Stack muda com `isDark`
   - StatusBar se adapta (light/dark)

2. **Hook auxiliar** (`src/hooks/useThemeColors.ts`)
   - Paleta de cores centralizada
   - Fácil aplicação em todos os componentes

3. **Carrinho atualizado** (`app/carrinho.tsx`)
   - Exemplo de como aplicar tema
   - Implementação completa

---

## 📋 Como Aplicar em Outras Telas

### Padrão de Implementação

```typescript
import { useThemeColors } from '../src/hooks/useThemeColors';

export default function MinhaTela() {
  const colors = useThemeColors();

  return (
    <View style={{ backgroundColor: colors.bgMain }}>
      <Text style={{ color: colors.textMain }}>
        Texto Principal
      </Text>
      <View style={{ backgroundColor: colors.bgCard }}>
        {/* Conteúdo */}
      </View>
    </View>
  );
}
```

### Cores Disponíveis

```typescript
// Backgrounds
colors.bgMain        // Background principal (#10142D / #F4F4F6)
colors.bgCard        // Cards (#1C213E / #FFFFFF)
colors.bgInput       // Inputs (#2A2F4F / #F3F4F6)
colors.bgButton      // Botões (#2A2F4F / #E5E7EB)

// Text
colors.textMain      // Texto principal (#FFFFFF / #10142D)
colors.textSecondary // Texto secundário (#9CA3AF / #6B7280)
colors.textMuted     // Texto discreto (#6B7280 / #9CA3AF)

// Accents
colors.accentYellow  // Botão primário (#FFD600)
colors.accentRed     // Erro/Remover (#FF6B6B)
colors.accentGreen   // Sucesso (#22C55E)

// Borders
colors.borderColor   // Borda padrão
colors.borderColorLight // Borda clara

// Utility
colors.isDark        // Boolean para lógica condicional
```

---

## 🎯 Telas Prioritárias para Atualizar

- [x] `app/_layout.tsx` - FEITO ✅
- [x] `app/carrinho.tsx` - FEITO ✅
- [ ] `app/home.tsx` - Próximo
- [ ] `app/loja.tsx` - Próximo
- [ ] `app/checkout.tsx` - Próximo
- [ ] `app/pedidos.tsx` - Próximo
- [ ] `app/loyalty.tsx` - Próximo
- [ ] `app/login.tsx` - Próximo
- [ ] `app/signup.tsx` - Próximo

---

## 📝 Exemplo Completo

```typescript
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeColors } from '../src/hooks/useThemeColors';

export default function MinhaTelaExemplo() {
  const colors = useThemeColors();

  return (
    <ScrollView 
      style={{ backgroundColor: colors.bgMain }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-4 pt-6">
        {/* Header */}
        <Text style={{ color: colors.textMain }} className="text-2xl font-bold mb-6">
          Meu Título
        </Text>

        {/* Card */}
        <View
          className="rounded-lg p-4 mb-4"
          style={{ backgroundColor: colors.bgCard }}
        >
          <Text style={{ color: colors.textSecondary }} className="text-sm mb-2">
            Subtítulo
          </Text>
          <Text style={{ color: colors.textMain }} className="text-lg font-semibold">
            Conteúdo Principal
          </Text>
        </View>

        {/* Botão */}
        <TouchableOpacity
          className="rounded-lg p-4 items-center"
          style={{ backgroundColor: colors.accentYellow }}
        >
          <Text className="text-hobby-dark font-bold text-lg">
            Meu Botão
          </Text>
        </TouchableOpacity>

        {/* Input */}
        <View
          className="rounded-lg p-3 mt-4"
          style={{ backgroundColor: colors.bgInput }}
        >
          <Text style={{ color: colors.textMuted }} className="text-sm">
            Placeholder
          </Text>
        </View>

        {/* Divisor */}
        <View
          className="h-px my-4"
          style={{ backgroundColor: colors.borderColor }}
        />

        {/* Texto Mutado */}
        <Text style={{ color: colors.textMuted }} className="text-sm text-center">
          Texto discreto
        </Text>
      </View>
    </ScrollView>
  );
}
```

---

## 🔍 Checklist de Aplicação

Ao atualizar uma tela:

- [ ] Importar `useThemeColors`
- [ ] Chamar `const colors = useThemeColors()`
- [ ] Substituir cores hardcoded:
  - [ ] `#10142D` → `colors.bgMain`
  - [ ] `#1C213E` → `colors.bgCard`
  - [ ] `#2A2F4F` → `colors.bgInput`
  - [ ] `#FFFFFF` → `colors.bgCard`
  - [ ] `#F4F4F6` → `colors.bgMain` (claro)
  - [ ] Textos brancos → `colors.textMain`
  - [ ] Textos cinzentos → `colors.textSecondary`
- [ ] Testar em tema escuro
- [ ] Testar em tema claro
- [ ] Verificar se há cores hardcoded restantes

---

## 🧪 Teste Rápido

1. **Aplicar tema Claro em Settings**
   - Tap Menu → Configurações
   - Tap em "☀️ Claro"
   - Volta para a tela anterior
   - ✓ Background deve ser #F4F4F6
   - ✓ Textos devem ser #10142D

2. **Aplicar tema Escuro**
   - Tap Menu → Configurações
   - Tap em "🌙 Escuro"
   - Volta para a tela anterior
   - ✓ Background deve ser #10142D
   - ✓ Textos devem ser #FFFFFF

3. **Verificar persistência**
   - Mudar tema
   - Fechar app
   - Reabrir
   - ✓ Tema deve manter

---

## ⚠️ Erros Comuns

### Erro: "Cannot find module 'useThemeColors'"
```
Solução: Certifique-se de que o import está correto:
import { useThemeColors } from '../src/hooks/useThemeColors';
```

### Erro: "useThemeColors must be used within ThemeProvider"
```
Solução: Verificar que o componente está dentro de <ThemeProvider>
(Já garantido no _layout.tsx)
```

### Cores não mudam ao trocar tema
```
Solução:
1. Limpar cache: npx expo start -c
2. Verificar se a tela está usando useThemeColors
3. Testar no emulador/dispositivo
```

---

## 🚀 Próximas Etapas

1. **Aplicar em home.tsx**
2. **Aplicar em loja.tsx**
3. **Aplicar em checkout.tsx**
4. **Aplicar em login/signup**
5. **Testar todas as telas em ambos temas**
6. **Documentar padrão utilizado**

---

**Última Atualização**: 12 de janeiro de 2026
**Status**: Em andamento - Aplicação global em progresso
