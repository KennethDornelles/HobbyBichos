import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Gerador de QR Codes Aleatórios para Testes
 * Simula o que o app móvel faria ao escanear um código
 */

async function generateTestQRCodes() {
  console.log('🎲 Gerando QR Codes aleatórios para teste...\n');

  const outputDir = path.join(__dirname, 'qrcodes-test');
  
  // Criar diretório se não existir
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Gerar 5 códigos diferentes (mesmo código em cases diferentes)
  const testCodes = [
    'USER1768492753175',      // UPPERCASE (padrão)
    'user1768492753175',      // lowercase
    'UsEr1768492753175',      // Mixed case
    'USER1768492753175',      // UPPERCASE novamente
    'uSeR1768492753175',      // Different mixed case
  ];

  for (let i = 0; i < testCodes.length; i++) {
    const code = testCodes[i];
    const filename = `qrcode_test_${i + 1}_${code}.png`;
    const filepath = path.join(outputDir, filename);

    try {
      await QRCode.toFile(filepath, code, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 1,
        width: 300,
      });

      console.log(`✅ Gerado: ${filename}`);
      console.log(`   Código: "${code}"`);
      console.log(`   Path: ${filepath}`);
      console.log('');
    } catch (err) {
      console.error(`❌ Erro ao gerar QR code para "${code}":`, err);
    }
  }

  console.log('━'.repeat(60));
  console.log(`📁 QR Codes salvos em: ${outputDir}`);
  console.log('');
  console.log('📱 Para testar com o app:');
  console.log('1. Use seu smartphone para escanear os QR codes gerados');
  console.log('2. Todos devem retornar o MESMO usuário (citext case-insensitive)');
  console.log('');
  console.log('📊 Casos de teste:');
  testCodes.forEach((code, i) => {
    console.log(`${i + 1}. "${code}"`);
  });
  console.log('━'.repeat(60));
}

generateTestQRCodes().catch(console.error);
