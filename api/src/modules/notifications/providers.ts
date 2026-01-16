import { Expo } from 'expo-server-sdk';

export class PushProvider {
  private expo = new Expo();

  async send(tokens: string[], message: { title: string; body: string; data?: any }): Promise<boolean> {
    if (!tokens || tokens.length === 0) return false;
    
    const messages = tokens
      .filter((token) => Expo.isExpoPushToken(token))
      .map((token) => ({
        to: token,
        sound: 'default',
        title: message.title,
        body: message.body,
        data: message.data || {},
      }));
    
    if (messages.length === 0) return false;
    
    try {
      const chunks = this.expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        await this.expo.sendPushNotificationsAsync(chunk);
      }
      return true;
    } catch (err) {
      console.error('Erro ao enviar push via Expo:', err);
      return false;
    }
  }
} // ✅ Apenas UMA chave de fechamento

export class WhatsAppProvider {
  async send(phone: string, templateId: string, params: any): Promise<boolean> {
    // TODO: Integrar com API oficial Meta/Zenvia
    return true;
  }
}

export class SmsProvider {
  async send(phone: string, message: string): Promise<boolean> {
    // TODO: Integrar com Zenvia
    return true;
  }
}

export class EmailProvider {
  async send(email: string, subject: string, body: string): Promise<boolean> {
    // TODO: Integrar com SendGrid
    return true;
  }
}
