import { Injectable } from '@nestjs/common';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { 
  CreateOrderDto, 
  MercadoPagoPreferenceResponse, 
  WebhookNotification,
  PaymentItem 
} from './payment.interfaces';

@Injectable()
export class PaymentService {
  private client: MercadoPagoConfig;
  private preference: Preference;

  constructor() {
    // Inicializa o cliente do Mercado Pago
    this.client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-YOUR-ACCESS-TOKEN',
      options: {
        timeout: 5000,
        idempotencyKey: 'abc'
      }
    });
    this.preference = new Preference(this.client);
  }

  async createPreference(orderData: CreateOrderDto): Promise<MercadoPagoPreferenceResponse> {
    try {
      const preference = {
        items: orderData.items.map((item: PaymentItem) => ({
          id: item.id.toString(),
          title: item.name,
          description: item.description,
          picture_url: item.image_url || '',
          category_id: 'pets',
          quantity: item.quantity,
          unit_price: item.price,
          currency_id: 'BRL'
        })),
        payer: {
          name: orderData.payer?.name || '',
          surname: orderData.payer?.surname || '',
          email: orderData.payer?.email || '',
          phone: {
            area_code: orderData.payer?.phone?.area_code || '11',
            number: orderData.payer?.phone?.number || ''
          },
          address: {
            street_name: orderData.payer?.address?.street_name || '',
            street_number: orderData.payer?.address?.street_number || '',
            zip_code: orderData.payer?.address?.zip_code || ''
          }
        },
        back_urls: {
          success: `${process.env.FRONTEND_URL || 'http://localhost:4200'}/pagamento/sucesso`,
          failure: `${process.env.FRONTEND_URL || 'http://localhost:4200'}/pagamento/erro`,
          pending: `${process.env.FRONTEND_URL || 'http://localhost:4200'}/pagamento/pendente`
        },
        auto_return: 'approved' as const,
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [],
          installments: 12
        },
        notification_url: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/payments/webhook`,
        statement_descriptor: 'HobbyBichos',
        external_reference: orderData.external_reference || `order_${Date.now()}`,
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
        metadata: {
          order_id: orderData.order_id,
          customer_id: orderData.customer_id
        }
      };

      const response = await this.preference.create({ body: preference });
      
      return {
        id: response.id!,
        init_point: response.init_point!,
        sandbox_init_point: response.sandbox_init_point!,
        preference_id: response.id!
      };
    } catch (error) {
      console.error('Erro ao criar preferência:', error);
      throw new Error('Falha ao criar preferência de pagamento');
    }
  }

  async getPreference(preferenceId: string) {
    try {
      const response = await this.preference.get({ preferenceId });
      return response;
    } catch (error) {
      console.error('Erro ao buscar preferência:', error);
      throw new Error('Preferência não encontrada');
    }
  }

  processWebhook(webhookData: WebhookNotification) {
    // Processa notificações do Mercado Pago
    console.log('Webhook recebido:', webhookData);
    
    switch (webhookData.type) {
      case 'payment':
        return this.processPaymentNotification(webhookData);
      case 'plan':
        return this.processPlanNotification(webhookData);
      case 'subscription':
        return this.processSubscriptionNotification(webhookData);
      default:
        console.log('Tipo de notificação não reconhecido:', webhookData.type);
    }
  }

  private processPaymentNotification(data: WebhookNotification) {
    // Implementar lógica de processamento de pagamento
    console.log('Processando notificação de pagamento:', data);
    // Aqui você atualizaria o status do pedido no banco de dados
  }

  private processPlanNotification(data: WebhookNotification) {
    // Implementar lógica de processamento de planos
    console.log('Processando notificação de plano:', data);
  }

  private processSubscriptionNotification(data: WebhookNotification) {
    // Implementar lógica de processamento de assinaturas
    console.log('Processando notificação de assinatura:', data);
  }
}
