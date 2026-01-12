#!/bin/bash

# ProductSelectionScreen - Verificação de Arquivos
# Este script verifica se todos os arquivos foram criados corretamente

echo "════════════════════════════════════════════════════════════════"
echo "  ProductSelectionScreen - Verificação Final de Arquivos"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
CREATED=0
MISSING=0
TOTAL=0

# Array de arquivos
declare -a FILES=(
  "mobile/src/screens/ProductSelectionScreen.tsx:Componente principal"
  "mobile/src/types/product.ts:Tipos e interfaces"
  "mobile/src/utils/constants.ts:Constantes e mock data"
  "mobile/src/screens/ProductSelectionScreen.README.md:Documentação"
  "mobile/src/screens/INTEGRATION_EXAMPLES.ts:Exemplos de integração"
  "mobile/src/screens/ProductSelectionScreen.test.tsx:Testes unitários"
  "mobile/tailwind.config.js:Configuração atualizada"
  "mobile/src/screens/index.ts:Exports atualizados"
  "FINAL_SUMMARY.md:Sumário final"
  "PRODUCT_SELECTION_SUMMARY.md:Sumário detalhado"
  "IMPLEMENTATION_CHECKLIST.md:Checklist de implementação"
  "STRUCTURE.md:Arquitetura do projeto"
  "ANIMATIONS_AND_IMPROVEMENTS.md:Animações futuras"
  "QUICK_REFERENCE.md:Referência rápida"
)

echo "📁 Verificando Arquivos Criados:"
echo "─────────────────────────────────────────────────────────────────"
echo ""

for file_info in "${FILES[@]}"; do
  IFS=':' read -r FILE DESC <<< "$file_info"
  TOTAL=$((TOTAL + 1))
  
  if [ -f "$FILE" ] || [ -f "HobbyBichos/$FILE" ]; then
    echo -e "${GREEN}✅${NC} $FILE"
    echo "   └─ $DESC"
    CREATED=$((CREATED + 1))
  else
    echo -e "${RED}❌${NC} $FILE"
    echo "   └─ FALTANDO: $DESC"
    MISSING=$((MISSING + 1))
  fi
  echo ""
done

echo "─────────────────────────────────────────────────────────────────"
echo ""
echo "📊 Resumo:"
echo "   Total: $TOTAL arquivos"
echo -e "   Criados: ${GREEN}$CREATED${NC}"
echo -e "   Faltando: ${RED}$MISSING${NC}"
echo ""

if [ $MISSING -eq 0 ]; then
  echo -e "${GREEN}✅ TODOS OS ARQUIVOS FORAM CRIADOS COM SUCESSO!${NC}"
  echo ""
  echo "════════════════════════════════════════════════════════════════"
  echo "  🎉 ProductSelectionScreen v1.0.0 - PRONTO PARA USAR!"
  echo "════════════════════════════════════════════════════════════════"
  echo ""
  echo "📖 Próximos Passos:"
  echo ""
  echo "1. Leia a documentação:"
  echo "   → FINAL_SUMMARY.md (começar aqui)"
  echo "   → mobile/src/screens/ProductSelectionScreen.README.md"
  echo ""
  echo "2. Teste o componente:"
  echo "   cd mobile"
  echo "   npm test -- ProductSelectionScreen.test.tsx"
  echo ""
  echo "3. Execute no Expo:"
  echo "   expo start -c"
  echo ""
  echo "4. Integre com React Navigation:"
  echo "   → Ver mobile/src/screens/INTEGRATION_EXAMPLES.ts"
  echo ""
  exit 0
else
  echo -e "${RED}❌ ALGUNS ARQUIVOS ESTÃO FALTANDO${NC}"
  echo ""
  echo "Por favor, verifique se todos os arquivos foram criados corretamente."
  echo ""
  exit 1
fi
