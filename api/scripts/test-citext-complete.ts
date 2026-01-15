#!/usr/bin/env node

/**
 * 🧪 Script de Teste Automático para CITEXT MemberCode
 * 
 * Este script testa toda a funcionalidade do citext sem precisar do app móvel.
 * 
 * Uso:
 * 1. Inicie a API: npm run start:dev
 * 2. Em outro terminal: npm run test:citext
 * 
 * Ou directamente: npx ts-node test-citext-complete.ts
 */

import axios from 'axios';

interface TestResult {
  testCase: string;
  code: string;
  success: boolean;
  error?: string;
  user?: { id: string; name: string; email: string };
}

const API_BASE = 'http://localhost:3000';
const results: TestResult[] = [];

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function assignMemberCode(email: string, code: string): Promise<boolean> {
  try {
    console.log(`\n📝 Atribuindo código "${code}" ao usuário "${email}"...`);
    
    // Para este teste, vamos usar o endpoint sem autenticação se possível
    // Ou você pode adicionar um token JWT aqui
    const response = await axios.post(
      `${API_BASE}/users/member-code`,
      { email, code },
      {
        validateStatus: () => true, // Aceitar qualquer status
      }
    );

    if (response.status === 201 || response.status === 200) {
      console.log(`✅ Código atribuído com sucesso`);
      return true;
    } else if (response.status === 401) {
      console.log(`⚠️  Autenticação necessária. Pulando atribuição.`);
      console.log(`💡 Dica: Forneça um token JWT válido`);
      return false;
    } else if (response.status === 404) {
      console.log(`❌ Usuário não encontrado: ${email}`);
      return false;
    } else {
      console.log(`⚠️  Status: ${response.status}`);
      return response.status < 400;
    }
  } catch (error: any) {
    console.log(`⚠️  Erro ao atribuir código: ${error.message}`);
    return false;
  }
}

async function testMemberCodeLookup(code: string): Promise<TestResult> {
  try {
    console.log(`🔍 Buscando código: "${code}"`);
    
    const response = await axios.get(`${API_BASE}/users/code/${code}`, {
      validateStatus: () => true,
    });

    if (response.status === 200) {
      console.log(`✅ Encontrado! Usuário: ${response.data.name} (${response.data.email})`);
      return {
        testCase: `Buscar "${code}"`,
        code,
        success: true,
        user: {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
        },
      };
    } else if (response.status === 404) {
      console.log(`❌ Código não encontrado`);
      return {
        testCase: `Buscar "${code}"`,
        code,
        success: false,
        error: 'Código não encontrado (404)',
      };
    } else {
      console.log(`⚠️  Status: ${response.status}`);
      return {
        testCase: `Buscar "${code}"`,
        code,
        success: false,
        error: `Status HTTP: ${response.status}`,
      };
    }
  } catch (error: any) {
    console.log(`❌ Erro: ${error.message}`);
    return {
      testCase: `Buscar "${code}"`,
      code,
      success: false,
      error: error.message,
    };
  }
}

async function printResults() {
  console.log('\n' + '═'.repeat(70));
  console.log('📊 RESULTADOS DOS TESTES');
  console.log('═'.repeat(70));

  const passedTests = results.filter(r => r.success).length;
  const totalTests = results.length;
  const successRate = ((passedTests / totalTests) * 100).toFixed(0);

  results.forEach((result, index) => {
    const icon = result.success ? '✅' : '❌';
    console.log(`\n${index + 1}. ${icon} ${result.testCase}`);
    console.log(`   Código: "${result.code}"`);
    
    if (result.success && result.user) {
      console.log(`   ✅ Usuário: ${result.user.name} (${result.user.email})`);
    } else if (result.error) {
      console.log(`   ❌ Erro: ${result.error}`);
    }
  });

  console.log('\n' + '═'.repeat(70));
  console.log(`📈 Resultado Final: ${passedTests}/${totalTests} testes passaram (${successRate}%)`);
  console.log('═'.repeat(70));

  if (passedTests === totalTests && totalTests > 0) {
    console.log('🎉 SUCESSO! CITEXT está funcionando perfeitamente!');
  } else if (totalTests === 0) {
    console.log('⚠️  Nenhum teste foi executado. Verifique a API.');
  } else {
    console.log('⚠️  Alguns testes falharam. Verifique os erros acima.');
  }
}

async function main() {
  console.log('═'.repeat(70));
  console.log('🧪 TESTE DE CITEXT - MemberCode Case-Insensitive');
  console.log('═'.repeat(70));
  console.log(`API: ${API_BASE}`);
  console.log('');

  // Verificar se API está disponível
  try {
    await axios.get(`${API_BASE}/users/lookup?id=test`, {
      validateStatus: () => true,
    });
    console.log('✅ API está respondendo');
  } catch (error) {
    console.log('❌ API não está disponível. Inicie com: npm run start:dev');
    process.exit(1);
  }

  console.log('\n' + '─'.repeat(70));
  console.log('FASE 1: Atribuir Código de Membro');
  console.log('─'.repeat(70));

  // Usar um email de teste - você pode criar este usuário antes
  const testEmail = 'teste.citext@example.com';
  const testCode = 'USER1768492753175';

  const codeAssigned = await assignMemberCode(testEmail, testCode);

  if (!codeAssigned) {
    console.log('\n💡 Sugestão: Crie um usuário primeiro ou forneça um email válido');
    console.log('   Você pode criar um usuário via POST /auth/register');
  } else {
    await sleep(1000); // Aguardar um pouco

    console.log('\n' + '─'.repeat(70));
    console.log('FASE 2: Testar Diferentes Cases');
    console.log('─'.repeat(70));
    console.log(`\nTestando o código em diferentes casos:\n`);

    const testCases = [
      'USER1768492753175',    // UPPERCASE (exato)
      'user1768492753175',    // lowercase
      'UsEr1768492753175',    // Mixed case 1
      'uSeR1768492753175',    // Mixed case 2
      'USER1768492753175',    // UPPERCASE novamente (deve encontrar)
    ];

    for (const code of testCases) {
      const result = await testMemberCodeLookup(code);
      results.push(result);
      await sleep(500); // Pequeno delay entre requisições
    }
  }

  await printResults();

  console.log('\n💡 Dicas para os testes:');
  console.log('   1. Se todos os testes falharem, verifique se o usuário existe');
  console.log('   2. Use POST /auth/register para criar um novo usuário');
  console.log('   3. Depois atribua um código e teste novamente');
  console.log('   4. Verifique os logs da API com: npm run start:dev');
  console.log('');
}

main().catch(error => {
  console.error('❌ Erro crítico:', error.message);
  process.exit(1);
});
