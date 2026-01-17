import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  Patch,
  Delete,
  Param,
  Put,
  Query,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { EnqueueNotificationDto } from './dto/enqueue-notification.dto';
import { RegisterTokenDto } from './dto/register-token.dto';
import { NotificationService } from './notification.service';
import { PrismaService } from '../../database/prisma.service';
import type { NotificationCategory } from '@prisma/client';

@ApiTags('notifications')
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
    @Query('storeId') storeId?: string,
  ) {
    if (!userId) {
      throw new BadRequestException('userId é obrigatório');
    }
    try {
      const where: any = { userId };
      if (storeId) {
        where.storeId = storeId;
      }
      return await this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao buscar notificações do usuário',
      );
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
      throw new InternalServerErrorException(
        'Erro ao buscar preferências do usuário',
      );
    }
  }

  // Atualizar preferências do usuário
  @Put('preferences')
  async updatePreferences(
    @Body()
    body: {
      userId: string;
      storeId: string;
      category: NotificationCategory;
      push?: boolean;
      email?: boolean;
      sms?: boolean;
      whatsapp?: boolean;
    },
  ) {
    const { userId, storeId, category, ...channels } = body;
    if (!userId || !storeId || !category) {
      throw new BadRequestException(
        'userId, storeId e category são obrigatórios',
      );
    }
    try {
      return await this.prisma.userNotificationPreference.upsert({
        where: { userId_storeId_category: { userId, storeId, category } },
        update: channels,
        create: { userId, storeId, category, ...channels },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao atualizar preferências do usuário',
      );
    }
  }

  // Enfileirar notificação
  @Post('enqueue')
  @HttpCode(202)
  @ApiBody({ type: EnqueueNotificationDto })
  async enqueueNotification(@Body() body: EnqueueNotificationDto) {
    if (!body.userId || !body.category || !body.payload) {
      throw new BadRequestException('Campos obrigatórios ausentes');
    }
    try {
      await this.notificationService.enqueueNotification(body);
      return { status: 'queued' };
    } catch (error) {
      console.error('Erro ao enfileirar notificação:', error);
      throw new InternalServerErrorException('Erro ao enfileirar notificação');
    }
  }

  // Registrar token de push
  @Post('register-token')
  @HttpCode(200)
  async registerPushToken(@Body() body: RegisterTokenDto) {
    try {
      await this.notificationService.registerPushToken(body);
      return { status: 'ok' };
    } catch (error) {
      throw new InternalServerErrorException('Erro ao registrar token de push');
    }
  }

  // Buscar notificação por ID
  @Get(':id')
  async getNotification(@Param('id') id: string) {
    try {
      return await this.notificationService.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException('Erro ao buscar notificação');
    }
  }

  // Marcar como lida
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    try {
      return await this.notificationService.markAsRead(id);
    } catch (error) {
      throw new InternalServerErrorException('Erro ao marcar notificação como lida');
    }
  }

  // Excluir notificação
  @Delete(':id')
  async deleteNotification(@Param('id') id: string) {
    try {
      return await this.notificationService.delete(id);
    } catch (error) {
      throw new InternalServerErrorException('Erro ao excluir notificação');
    }
  }
}
