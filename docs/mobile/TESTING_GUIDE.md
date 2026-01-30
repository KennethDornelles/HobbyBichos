# Guia de Teste Rápido - Edição de Perfil e Tema

## 🎯 Como Testar as Novas Funcionalidades

### 1. Testar Navegação para Edição de Perfil

**Passo 1**: Abrir o menu lateral (hambúrguer menu)
```
- Tap no ícone ☰ (menu)
```

**Passo 2**: Clicar em "Ver perfil"
```
- Tap em "Ver perfil" no topo do menu
- Esperado: Navega para /profile/edit
```

**Passo 3**: Verificar layout
```
- Header com gradiente amarelo → azul escuro
- Avatar no meio com borda amarela
- Ícone de câmera no canto inferior direito
- Formulário com campos abaixo
```

**Passo 4**: Testar botão voltar
```
- Tap na seta ← no canto superior esquerdo
- Esperado: Volta para o menu anterior
```

---

### 2. Testar Edição de Perfil

**Passo 1**: Preencher dados
```
- Nome: "João Silva"
- Email: "joao@example.com"
- Telefone: "(11) 99999-9999"
- Endereço: "Rua das Flores, 123"
```

**Passo 2**: Validações
```
- Deixar nome vazio → Mensagem: "Nome e email são obrigatórios"
- Email inválido (ex: "abc") → Mensagem: "Email inválido"
- Email válido (ex: "user@domain.com") → ✅ Aceito
```

**Passo 3**: Salvar
```
- Tap "Salvar alterações"
- Esperado: Loading spinner por 1-2s
- Mensagem: "Perfil atualizado com sucesso!"
- Volta automaticamente para tela anterior
```

---

### 3. Testar Seletor de Tema

**Passo 1**: Abrir menu lateral e clicar em "Configurações"
```
- Tap ☰ (menu)
- Tap "Configurações"
- Esperado: Navega para /settings
```

**Passo 2**: Visualizar seção "Aparência"
```
- Ícone Palette em amarelo
- Três botões: Sistema | Claro | Escuro
- Um deles está destacado em amarelo (tema ativo)
```

**Passo 3**: Testar alternância de tema

**Tema Claro:**
```
- Tap em "☀️ Claro"
- Esperado:
  - Background muda para branco/cinza claro
  - Textos ficar escuros
  - Botão fica amarelo (ativo)
  - Mensagem: "O tema Claro está ativo"
```

**Tema Escuro:**
```
- Tap em "🌙 Escuro"
- Esperado:
  - Background muda para azul escuro (#10142D)
  - Textos ficar brancos
  - Botão fica amarelo (ativo)
  - Mensagem: "O tema Escuro está ativo"
```

**Tema Sistema:**
```
- Tap em "📱 Sistema"
- Esperado:
  - Respeita configuração do SO
  - Se SO está em dark → app fica escuro
  - Se SO está em light → app fica claro
  - Botão fica amarelo (ativo)
  - Mensagem: "O tema Sistema está ativo"
```

**Passo 4**: Persistência
```
- Mudar para tema Claro
- Voltar para home e abrir settings novamente
- Esperado: Tema Claro continua ativo
- Fechar e reabrir app
- Esperado: Tema Claro mantém (salvou em AsyncStorage)
```

---

### 4. Testar Tema em Múltiplas Telas

**Login:**
```
- Aplicar tema Claro → Background branco
- Aplicar tema Escuro → Background azul escuro
```

**Signup:**
```
- Aplicar tema Claro → Background branco
- Aplicar tema Escuro → Background azul escuro
```

**Home:**
```
- Tema persiste de Settings para Home
- Cores aplicadas corretamente
```

**Profile Edit:**
```
- Mudar tema em Settings
- Voltar para Profile Edit
- Esperado: Tema aplicado corretamente
```

---

## 📋 Cores Esperadas por Tema

### Tema Escuro (Dark)
```
Background Principal: #10142D (Hobby Dark)
Container Inputs: #1C213E
Input Background: #2A2F4F
Text: #FFFFFF
Placeholder: #9CA3AF
Botão Primário: #FFD600 (Hobby Yellow)
```

### Tema Claro (Light)
```
Background Principal: #F4F4F6 (Hobby Ice)
Container: #FFFFFF
Input Background: #FFFFFF
Text: #10142D
Placeholder: #6B7280
Botão Primário: #FFD600 (Hobby Yellow)
```

---

## 🐛 Troubleshooting

### Tema não persiste após reload
```
❌ Problema: AsyncStorage não está salvar
✅ Solução: Verificar console para erros de AsyncStorage
✅ Verificar se ThemeProvider está acima de AuthProvider
```

### Avatar não mostra
```
❌ Problema: Apenas mostra círculo vazio
✅ Solução: Se user não tiver avatarUrl, mostra primeira letra do nome
✅ Se user não tiver nome, mostra ícone User
```

### Email não valida corretamente
```
❌ Problema: Email inválido não gera mensagem
✅ Solução: Regex valida formato: usuario@dominio.com
✅ Se falhar, verá: "Email inválido"
```

### Menu Settings não aparece
```
❌ Problema: Não vê "Configurações" no menu
✅ Solução: SideMenu foi atualizado com novo item
✅ Verifique que incluiu a rota /settings
```

---

## ✅ Checklist de Teste Final

- [ ] Navegação para profile/edit funciona
- [ ] Avatar com borda amarela exibindo
- [ ] Validações de email funcionam
- [ ] Botão Salvar com loading state
- [ ] Menu lateral tem opção "Configurações"
- [ ] Navegação para /settings funciona
- [ ] Três opções de tema visíveis (Sistema/Claro/Escuro)
- [ ] Tema Claro muda UI corretamente
- [ ] Tema Escuro muda UI corretamente
- [ ] Tema Sistema respeita configuração do SO
- [ ] Tema persiste após voltar de settings
- [ ] Tema persiste após fechar e reabrir app
- [ ] Ícones Lucide-React exibindo corretamente
- [ ] Nenhum erro no console
- [ ] Acessibilidade OK (botões com tamanho correto)

---

## 📞 Suporte

Se encontrar problemas:

1. **Limpar cache**: `npx expo start -c`
2. **Verificar imports**: Importações de contexto devem estar corretas
3. **Verificar ThemeContext**: Deve estar com themeMode, resolvedTheme, isDark
4. **Verificar AsyncStorage**: Deve estar instalado e funcionando
5. **Logs**: Procure por `console.error` para entender problemas

---

**Última Atualização**: 12 de janeiro de 2026
**Versão**: 1.0.0
