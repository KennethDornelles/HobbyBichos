import { PrismaClient } from '@prisma/client';
import { Expo } from 'expo-server-sdk';

const prisma = new PrismaClient();
const expo = new Expo();

async function main() {
  console.log('🔍 Buscando tokens de push no banco...');
  
  const tokens = await prisma.pushToken.findMany({
    where: { isActive: true },
    orderBy: { updatedAt: 'desc' },
    take: 1,
  });

  if (tokens.length === 0) {
    console.error('❌ Nenhum token de push ativo encontrado no banco.');
    console.log('💡 Dica: Abra o App Mobile e faça login/navigação para registrar um token.');
    return;
  }

  const token = tokens[0].expoToken;
  console.log(`✅ Token encontrado: ${token}`);
  console.log(`👤 Usuário ID: ${tokens[0].userId}`);

  if (!Expo.isExpoPushToken(token)) {
    console.error(`❌ Token inválido: ${token}`);
    return;
  }

  console.log('🚀 Enviando notificação de teste...');

  const messages = [{
    to: token,
    sound: 'default',
    title: 'Teste Manual 📱',
    body: 'Se você leu isso, o sistema de notificações está funcionando! 🚀',
    data: { test: true },
  }];

  try {
    const chunks = expo.chunkPushNotifications(messages as any);
    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log('✅ Ticket gerado:', ticketChunk);
    }
    console.log('🏁 Envio concluído!');
  } catch (error) {
    console.error('❌ Erro ao enviar:', error);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
