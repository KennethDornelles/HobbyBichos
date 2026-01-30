// ...existing code...
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class BrevoService {
  private readonly logger = new Logger(BrevoService.name);
  private resend: Resend;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY not found. BrevoService will not send emails.');
    }
    this.resend = new Resend(apiKey);
  }

  /**
   * Envia email de boas-vindas após registro
   */
  async sendWelcomeEmail(email: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from:
          this.configService.get('BREVO_FROM_EMAIL') ||
          'Hobby Bichos <onboarding@resend.dev>',
        to: email,
        subject: 'Bem-vindo ao Hobby Bichos! 🐾',
        html: `
            <h1>Bem-vindo ao Hobby Bichos!</h1>
            <p>Obrigado por se cadastrar em nossa plataforma.</p>
            <p>Estamos felizes em tê-lo conosco!</p>
          `,
      });
      this.logger.log(`Email de boas-vindas enviado para: ${email}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar email de boas-vindas: ${error}`);
      // Não lança erro para não bloquear o registro
    }
  }

  /**
   * Envia código de recuperação de senha por e-mail
   */
  async sendRecoveryCodeEmail(email: string, name: string, code: string) {
    const html = this.getRecoveryEmailTemplate(name, code);

    try {
      this.logger.log(`📧 Enviando código de recuperação para: ${email}`);

      const response = await this.resend.emails.send({
        from: `"Hobby Bichos" <${this.configService.get('BREVO_FROM_EMAIL') || 'onboarding@resend.dev'}>`,
        to: email,
        subject: 'Seu código de recuperação - Hobby Bichos',
        html: html,
        text: `Olá ${name}, seu código de recuperação é: ${code}. Ele expira em 15 minutos.`,
      });

      if (response.error) {
        this.logger.error('❌ Erro ao enviar email:', response.error);
        throw new Error(response.error.message);
      }

      this.logger.log('✅ Email enviado com sucesso!');
      this.logger.log(`Response ID: ${response.data?.id}`);

      return response.data;
    } catch (error) {
      this.logger.error('❌ Erro ao enviar código:', {
        message: error.message,
      });
      throw error;
    }
  }

  /**
   * Método obsoleto: envio de link de redefinição removido. Use sendRecoveryCodeEmail.
   */
  async sendForgotPasswordEmail(email: string, token: string) {
    this.logger.warn(
      'Método obsoleto. Use sendRecoveryCodeEmail para envio de código de recuperação.',
    );
    // Opcional: pode lançar erro ou apenas logar
    return;
  }

  /**
   * Template HTML para email de recuperação
   */
  private getRecoveryEmailTemplate(name: string, code: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: #3b82f6; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">🐾 Hobby Bichos</h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px;">
      <p style="font-size: 16px; color: #374151; margin: 0 0 20px;">
        Olá <strong>${name}</strong>,
      </p>
      
      <p style="font-size: 16px; color: #374151; margin: 0 0 30px;">
        Seu código de recuperação de senha é:
      </p>
      
      <!-- Code Box -->
      <div style="background: #f9fafb; border: 2px dashed #3b82f6; border-radius: 8px; padding: 30px; text-align: center; margin: 0 0 30px;">
        <div style="font-size: 48px; font-weight: bold; color: #3b82f6; letter-spacing: 12px; font-family: 'Courier New', monospace;">
          ${code}
        </div>
      </div>
      
      <p style="font-size: 14px; color: #6b7280; margin: 0 0 20px;">
        ⏰ Este código expira em <strong>15 minutos</strong>.
      </p>
      
      <p style="font-size: 14px; color: #6b7280; margin: 0;">
        Se você não solicitou este código, ignore este email. Sua senha permanecerá segura.
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">
        © 2026 Hobby Bichos - Gestão de Petshops
      </p>
    </div>
    
  </div>
</body>
</html>
    `.trim();
  }
}
