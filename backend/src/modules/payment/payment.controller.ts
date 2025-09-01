import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Param, 
  HttpException, 
  HttpStatus,
  Headers,
  BadRequestException 
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreateOrderDto, WebhookNotification } from './payment.interfaces';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-preference')
  async createPreference(@Body() createOrderDto: CreateOrderDto) {
    try {
      // Validações básicas
      if (!createOrderDto.items || createOrderDto.items.length === 0) {
        throw new BadRequestException('Items são obrigatórios');
      }

      // Validar items
      for (const item of createOrderDto.items) {
        if (!item.name || !item.price || !item.quantity || item.quantity <= 0) {
          throw new BadRequestException('Dados do item inválidos');
        }
        if (item.price <= 0) {
          throw new BadRequestException('Preço do item deve ser maior que zero');
        }
      }

      const preference = await this.paymentService.createPreference(createOrderDto);
      
      return {
        success: true,
        data: preference,
        message: 'Preferência criada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao criar preferência:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
      throw new HttpException(
        {
          success: false,
          message: errorMessage,
          error: 'PREFERENCE_CREATION_FAILED'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('preference/:id')
  async getPreference(@Param('id') preferenceId: string) {
    try {
      if (!preferenceId) {
        throw new BadRequestException('ID da preferência é obrigatório');
      }

      const preference = await this.paymentService.getPreference(preferenceId);
      
      return {
        success: true,
        data: preference,
        message: 'Preferência encontrada'
      };
    } catch (error) {
      console.error('Erro ao buscar preferência:', error);
      const errorMessage = error instanceof Error ? error.message : 'Preferência não encontrada';
      throw new HttpException(
        {
          success: false,
          message: errorMessage,
          error: 'PREFERENCE_NOT_FOUND'
        },
        HttpStatus.NOT_FOUND
      );
    }
  }

  @Post('webhook')
  handleWebhook(
    @Body() webhookData: WebhookNotification,
    @Headers('x-signature') signature: string,
    @Headers('x-request-id') requestId: string
  ) {
    try {
      console.log('Webhook recebido:', {
        signature,
        requestId,
        data: webhookData
      });

      // TODO: Verificar assinatura do webhook para segurança
      // const isValidSignature = this.verifyWebhookSignature(webhookData, signature);
      // if (!isValidSignature) {
      //   throw new HttpException('Assinatura inválida', HttpStatus.UNAUTHORIZED);
      // }

      this.paymentService.processWebhook(webhookData);
      
      return {
        success: true,
        message: 'Webhook processado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Erro ao processar webhook',
          error: 'WEBHOOK_PROCESSING_FAILED'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Endpoint para simular sucesso (desenvolvimento)
  @Get('success/:external_reference')
  paymentSuccess(@Param('external_reference') externalReference: string) {
    return {
      success: true,
      message: 'Pagamento realizado com sucesso',
      external_reference: externalReference
    };
  }

  // Endpoint para simular falha (desenvolvimento)
  @Get('failure/:external_reference')
  paymentFailure(@Param('external_reference') externalReference: string) {
    return {
      success: false,
      message: 'Falha no pagamento',
      external_reference: externalReference
    };
  }

  // Endpoint para simular pendente (desenvolvimento)
  @Get('pending/:external_reference')
  paymentPending(@Param('external_reference') externalReference: string) {
    return {
      success: true,
      message: 'Pagamento pendente',
      external_reference: externalReference,
      status: 'pending'
    };
  }

  // Método privado para verificar assinatura (implementar futuramente)
  // private verifyWebhookSignature(data: any, signature: string): boolean {
  //   // Implementar verificação de assinatura do Mercado Pago
  //   // Referência: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
  //   return true;
  // }
}
