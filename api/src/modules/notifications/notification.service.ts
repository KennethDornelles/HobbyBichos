import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../database/prisma.service';
import { RegisterTokenDto } from './dto/register-token.dto';
import { EnqueueNotificationDto } from './dto/enqueue-notification.dto';
import { NotificationCategory } from '@prisma/client';
import { createHash } from 'crypto';

@Injectable()
export class NotificationService {
  /**
   * Cache de deduplicação: Map<hash, timestamp>
   * O(1) para lookup e inserção
   */
  private readonly recentNotifications = new Map<string, number>();
  /**
   * Janela de deduplicação em ms (default 5s, configurável via env se desejar)
   */
  private readonly DEDUP_WINDOW_MS = Number(process.env.NOTIF_DEDUP_WINDOW_MS) || 5000;
  /**
   * Logger estruturado
   */
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectQueue('notification_queue')
    private readonly notificationQueue: Queue,
    private readonly prisma: PrismaService,
  ) {
    // Limpeza automática do cache de deduplicação a cada 1 min
    setInterval(() => {
      const now = Date.now();
      let removed = 0;
      for (const [hash, timestamp] of this.recentNotifications.entries()) {
        if (now - timestamp > this.DEDUP_WINDOW_MS) {
          this.recentNotifications.delete(hash);
          removed++;
        }
      }
      if (removed > 0) {
        this.logger.debug(`[${new Date().toISOString()}] Limpeza do cache de deduplicação: ${removed} entradas removidas.`);
      }
    }, 60000);
  }

  /**
   * Gera hash SHA-256 único para deduplicação
   */
  private generateNotificationHash(dto: EnqueueNotificationDto): string {
    const content = `${dto.userId}|${dto.category}|${dto.payload?.title ?? ''}|${dto.payload?.body ?? ''}`;
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Enfileira uma notificação multi-canal com deduplicação e logging detalhado
   */
  async enqueueNotification(dto: EnqueueNotificationDto): Promise<void> {
    const timestamp = Date.now();
    const notificationHash = this.generateNotificationHash(dto);
    const lastSent = this.recentNotifications.get(notificationHash);
    const nowIso = new Date(timestamp).toISOString();
    this.logger.log(`[${nowIso}] ➡️ Entrada enqueueNotification userId=${dto.userId} category=${dto.category} title="${dto.payload?.title}"`);

    // Deduplicação: verifica se já foi enviada recentemente
    if (lastSent && timestamp - lastSent < this.DEDUP_WINDOW_MS) {
      this.logger.warn(`⚠️ [${nowIso}] Notificação duplicada detectada e ignorada | hash=${notificationHash} | userId=${dto.userId} | category=${dto.category} | title="${dto.payload?.title}"`);
      return;
    }
    this.recentNotifications.set(notificationHash, timestamp);

    let storeId = dto.storeId;
    try {
      // Busca storeId do usuário se não informado
      if (!storeId) {
        const user = await this.prisma.user.findUnique({
          where: { id: dto.userId },
          select: { storeId: true },
        });
        if (user?.storeId) storeId = user.storeId;
      }

      // Salva notificação no banco
      const notification = await this.prisma.notification.create({
        data: {
          userId: dto.userId,
          storeId,
          category: dto.category as NotificationCategory,
          title: dto.payload.title || 'Nova Notificação',
          body: dto.payload.body || '',
          data: dto.payload.data ?? {},
          read: false,
        },
      });

      // Adiciona job na fila BullMQ com jobId único
      const jobId = `${notification.id}-${timestamp}`;
      await this.notificationQueue.add(
        'send',
        { ...dto, storeId, notificationId: notification.id },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: true,
          removeOnFail: false,
          jobId,
        }
      );
      this.logger.log(`✅ [${nowIso}] Notificação enfileirada com sucesso | id=${notification.id} | userId=${dto.userId} | jobId=${jobId}`);
    } catch (error) {
      this.logger.error(`❌ [${nowIso}] Erro ao enfileirar notificação | userId=${dto.userId} | category=${dto.category} | title="${dto.payload?.title}" | erro: ${error?.message ?? error}`);
      throw error;
    }
  }

  async registerPushToken(dto: RegisterTokenDto) {
    this.logger.log(`➡️ registerPushToken userId=${dto.userId} deviceId=${dto.deviceId}`);
    return this.prisma.pushToken.upsert({
      where: {
        userId_deviceId: {
          userId: dto.userId,
          deviceId: dto.deviceId,
        },
      },
      update: {
        expoToken: dto.expoToken,
        isActive: true,
      },
      create: {
        userId: dto.userId,
        deviceId: dto.deviceId,
        expoToken: dto.expoToken,
      },
    });
  }

  async findOne(id: string) {
    this.logger.log(`➡️ findOne id=${id}`);
    return this.prisma.notification.findUnique({
      where: { id },
    });
  }

  async markAsRead(id: string) {
    this.logger.log(`➡️ markAsRead id=${id}`);
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async delete(id: string) {
    this.logger.log(`➡️ delete id=${id}`);
    return this.prisma.notification.delete({
      where: { id },
    });
  }
}
