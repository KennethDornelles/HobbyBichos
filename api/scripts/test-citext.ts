/**
 * Script de teste para validar funcionalidade citext
 * 
 * Este script testa se o campo `code` da tabela `member_codes`
 * está funcionando como case-insensitive após a migration.
 * 
 * Uso: npx ts-node test-citext.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCitextFunctionality() {
  console.log('🧪 Iniciando testes de case-insensitivity para MemberCode...\n');

  try {
    // Limpar dados anteriores
    await prisma.memberCode.deleteMany({});
    console.log('✅ Banco limpo\n');

    // Criar um código de teste
    const testCode = 'USER1768492753175';
    const userId = '12345'; // Use um userId válido ou crie um usuário teste

    console.log(`📝 Criando código teste: "${testCode}"`);
    const created = await prisma.memberCode.create({
      data: {
        code: testCode,
        userId: userId,
      },
    });
    console.log(`✅ Código criado: ${JSON.stringify(created)}\n`);

    // Teste 1: Buscar com case exato
    console.log('🔍 Teste 1: Buscar com case exato (USER1768492753175)');
    const result1 = await prisma.memberCode.findUnique({
      where: { code: 'USER1768492753175' },
    });
    console.log(result1 ? '✅ SUCESSO - Encontrado' : '❌ FALHA - Não encontrado');
    console.log('');

    // Teste 2: Buscar com lowercase
    console.log('🔍 Teste 2: Buscar com lowercase (user1768492753175)');
    const result2 = await prisma.memberCode.findUnique({
      where: { code: 'user1768492753175' },
    });
    console.log(result2 ? '✅ SUCESSO - Encontrado' : '❌ FALHA - Não encontrado');
    console.log('');

    // Teste 3: Buscar com mixed case
    console.log('🔍 Teste 3: Buscar com mixed case (UsEr1768492753175)');
    const result3 = await prisma.memberCode.findUnique({
      where: { code: 'UsEr1768492753175' },
    });
    console.log(result3 ? '✅ SUCESSO - Encontrado' : '❌ FALHA - Não encontrado');
    console.log('');

    // Teste 4: Buscar com espaços (trimmed)
    console.log('🔍 Teste 4: Buscar com espaços (  USER1768492753175  )');
    const result4 = await prisma.memberCode.findUnique({
      where: { code: '  USER1768492753175  ' },
    });
    console.log(result4 ? '✅ SUCESSO - Encontrado' : '❌ FALHA - Não encontrado');
    console.log('');

    // Resumo
    const allResults = [result1, result2, result3, result4];
    const passedTests = allResults.filter(r => r !== null).length;
    const totalTests = allResults.length;

    console.log('━'.repeat(50));
    console.log(`📊 Resultado Final: ${passedTests}/${totalTests} testes passaram`);
    
    if (passedTests === totalTests) {
      console.log('🎉 TODOS OS TESTES PASSARAM - citext está funcionando!');
    } else {
      console.log('⚠️  Alguns testes falharam - verifique a configuração');
    }
    console.log('━'.repeat(50));

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCitextFunctionality();
