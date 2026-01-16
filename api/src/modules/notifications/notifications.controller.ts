import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  Put,
  Query,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PrismaService } from '../../database/prisma.service';
import type { NotificationCategory } from '@prisma/client';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly prisma: PrismaService,
  ) {}

  // Buscar notificações do usuário
  @Get('user')
  async getUserNotifications(
    @Query('userId') userId: string,
    @Query('storeId') storeId: string,
  ) {
    if (!userId || !storeId) {
      throw new BadRequestException('userId e storeId são obrigatórios');
    }
    try {
      return await this.prisma.notification.findMany({
        where: { userId, storeId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    } catch (error) {
      throw new InternalServerErrorException('Erro ao buscar notificações do usuário');
    }
  }

  // Buscar preferências do usuário
  @Get('preferences')
  async getPreferences(
    @Query('userId') userId: string,
    @Query('storeId') storeId: string,
  ) {
    if (!userId || !storeId) {
      throw new BadRequestException('userId e storeId são obrigatórios');
    }
    try {
      return await this.prisma.userNotificationPreference.findMany({
        where: { userId, storeId },
      });
    } catch (error) {
      throw new InternalServerErrorException('Erro ao buscar preferências do usuário');
    }
  }

  // Atualizar preferências do usuário
  @Put('preferences')
  async updatePreferences(@Body() body: {
    userId: string;
    storeId: string;
    category: NotificationCategory;
    push?: boolean;
    email?: boolean;
    sms?: boolean;
    whatsapp?: boolean;
  }) {
    const { userId, storeId, category, ...channels } = body;
    if (!userId || !storeId || !category) {
      throw new BadRequestException('userId, storeId e category são obrigatórios');
    }
    try {
      return await this.prisma.userNotificationPreference.upsert({
        where: { userId_storeId_category: { userId, storeId, category } },
        update: channels,
        create: { userId, storeId, category, ...channels },
      });
    } catch (error) {
      throw new InternalServerErrorException('Erro ao atualizar preferências do usuário');
    }
  }

  // Enfileirar notificação
  @Post('enqueue')
  @HttpCode(202)
  async enqueueNotification(@Body() body: {
    userId: string;
    storeId: string;
    category: string;
    payload: any;
  }) {
    if (!body.userId || !body.storeId || !body.category || !body.payload) {
      throw new BadRequestException('Campos obrigatórios ausentes');
    }
    try {
      await this.notificationService.enqueueNotification(body);
      return { status: 'queued' };
    } catch (error) {
      throw new InternalServerErrorException('Erro ao enfileirar notificação');
    }
  }

  // Registrar token de push
  @Post('register-token')
  @HttpCode(200)
  async registerPushToken(@Body() body: { userId: string; deviceId: string; expoToken: string }) {
    if (!body.userId || !body.deviceId || !body.expoToken) {
      throw new BadRequestException('userId, deviceId e expoToken são obrigatórios');
    }
    try {
      // await this.notificationService.registerPushToken(body);
      return { status: 'ok' };
    } catch (error) {
      throw new InternalServerErrorException('Erro ao registrar token de push');
    }
  }
}
