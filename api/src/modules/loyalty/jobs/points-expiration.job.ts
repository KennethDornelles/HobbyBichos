import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../database/prisma.service';
import { LoyaltyService } from '../services/loyalty.service';
import { NotificationService } from '../../notifications/notification.service';
import { TransactionType, NotificationCategory } from '@prisma/client';

@Injectable()
export class PointsExpirationJob {
  private readonly logger = new Logger(PointsExpirationJob.name);
  private readonly BATCH_SIZE = 50;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 1000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly loyaltyService: LoyaltyService,
    private readonly notificationService: NotificationService,
  ) {}

  @Cron('0 1 * * *')
  async handlePointsExpiration(): Promise<void> {
    const startTime = Date.now();
    let totalProcessed = 0;
    let successCount = 0;
    let failureCount = 0;
    let totalPointsExpired = 0;
    let skippedCount = 0;

    const isDryRun = process.env.LOYALTY_EXPIRATION_DRY_RUN === 'true';

    try {
      const now = new Date();

      this.logger.log({
        job: 'PointsExpirationJob',
        action: 'started',
        isDryRun,
        timestamp: now.toISOString(),
      });

      const expiredTransactions = await this.prisma.loyaltyTransaction.findMany(
        {
          where: {
            expiresAt: { lt: now },
            expired: false,
          },
          include: {
            account: {
              select: {
                id: true,
                currentPoints: true,
                userId: true,
              },
            },
          },
        },
      );

      this.logger.log(
        `Found ${expiredTransactions.length} expired transactions to process`,
      );

      // Processar em batches
      for (let i = 0; i < expiredTransactions.length; i += this.BATCH_SIZE) {
        const batch = expiredTransactions.slice(i, i + this.BATCH_SIZE);

        for (const transaction of batch) {
          totalProcessed++;
          const originalPointsToExpire = Math.abs(transaction.points);

          try {
            // FIX: Em vez de pular, calculamos o máximo que podemos debitar.
            // Se o usuário tem menos pontos do que vai expirar, é porque ele já gastou
            // os pontos "velhos" (sistema FIFO implícito).
            // Debitamos apenas o que sobrou (se houver) e marcamos como expirado.
            const pointsToDebit = Math.min(
              transaction.account.currentPoints,
              originalPointsToExpire,
            );

            if (isDryRun) {
              this.logger.debug({
                job: 'PointsExpirationJob',
                action: 'dry_run',
                transactionId: transaction.id,
                accountId: transaction.accountId,
                pointsToDebit,
                originalPointsToExpire,
              });
              successCount++;
              if (pointsToDebit > 0) totalPointsExpired += pointsToDebit;
              continue;
            }

            // Tentar expirar com retry logic
            const success = await this.expireTransactionWithRetry(
              transaction,
              pointsToDebit,
            );

            if (success) {
              successCount++;
              if (pointsToDebit > 0) totalPointsExpired += pointsToDebit;
              this.logger.debug({
                job: 'PointsExpirationJob',
                action: 'expired',
                transactionId: transaction.id,
                accountId: transaction.accountId,
                userId: transaction.account.userId,
                pointsDebited: pointsToDebit,
              });
            } else {
              failureCount++;
            }
          } catch (error) {
            failureCount++;
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error';
            this.logger.error({
              job: 'PointsExpirationJob',
              action: 'error',
              transactionId: transaction.id,
              accountId: transaction.accountId,
              error: errorMessage,
            });
          }
        }

        // Log progresso após cada batch
        this.logger.log({
          job: 'PointsExpirationJob',
          action: 'batch_completed',
          batchNumber: Math.floor(i / this.BATCH_SIZE) + 1,
          processed: Math.min(i + this.BATCH_SIZE, expiredTransactions.length),
          total: expiredTransactions.length,
        });
      }

      const executionTime = Date.now() - startTime;
      this.logger.log({
        job: 'PointsExpirationJob',
        action: 'completed',
        isDryRun,
        metrics: {
          totalProcessed,
          success: successCount,
          failures: failureCount,
          skipped: skippedCount,
          totalPointsExpired,
          executionTimeMs: executionTime,
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error({
        job: 'PointsExpirationJob',
        action: 'failed',
        error: errorMessage,
        stack: errorStack,
      });
    }
  }

  private async expireTransactionWithRetry(
    transaction: { id: string; accountId: string; description: string },
    pointsToDebit: number,
  ): Promise<boolean> {
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const operations: any[] = [
          // 1. Marca a transação original como expirada para não processar de novo
          this.prisma.loyaltyTransaction.update({
            where: { id: transaction.id },
            data: { expired: true },
          }),
        ];

        // 2. Se houver pontos a debitar, cria a transação de débito e atualiza o saldo
        if (pointsToDebit > 0) {
          operations.push(
            this.prisma.loyaltyTransaction.create({
              data: {
                accountId: transaction.accountId,
                points: -pointsToDebit,
                type: TransactionType.EXPIRATION,
                description: `Expiração de pontos (${transaction.description})`,
                referenceId: transaction.id,
              },
            }),
          );
          operations.push(
            this.prisma.loyaltyAccount.update({
              where: { id: transaction.accountId },
              data: {
                currentPoints: { decrement: pointsToDebit },
              },
            }),
          );
        }

        await this.prisma.$transaction(operations);
        return true;
      } catch (error) {
        if (attempt < this.MAX_RETRIES) {
          const delay = this.RETRY_DELAY_MS * Math.pow(2, attempt - 1);
          this.logger.warn({
            job: 'PointsExpirationJob',
            action: 'retry',
            transactionId: transaction.id,
            attempt,
            nextRetryDelayMs: delay,
          });
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          this.logger.error({
            job: 'PointsExpirationJob',
            action: 'max_retries_exceeded',
            transactionId: transaction.id,
            error: errorMessage,
          });
          return false;
        }
      }
    }
    return false;
  }

  @Cron('0 0 * * *')
  async notifyExpiringPoints(): Promise<void> {
    try {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      // Ajuste para pegar o fim do dia para garantir cobertura
      thirtyDaysFromNow.setHours(23, 59, 59, 999);

      this.logger.log({
        job: 'PointsExpirationJob',
        action: 'notify_started',
        timestamp: new Date().toISOString(),
      });

      const expiringTransactions =
        await this.prisma.loyaltyTransaction.findMany({
          where: {
            expiresAt: {
              gte: new Date(),
              lte: thirtyDaysFromNow,
            },
            expired: false,
          },
          include: {
            account: { include: { user: true } },
          },
        });

      const userMap = new Map<string, number>();

      for (const transaction of expiringTransactions) {
        const userId = transaction.account.user.id;
        userMap.set(
          userId,
          (userMap.get(userId) ?? 0) + Math.abs(transaction.points),
        );
      }

      this.logger.log({
        job: 'PointsExpirationJob',
        action: 'notify_summary',
        usersToNotify: userMap.size,
        totalPointsExpiring: Array.from(userMap.values()).reduce(
          (a, b) => a + b,
          0,
        ),
      });

      for (const [userId, points] of userMap.entries()) {
        try {
          // Envia notificação Push
          await this.notificationService.enqueueNotification({
            userId,
            category: NotificationCategory.MARKETING, // Categoria apropriada para lembretes
            payload: {
              title: '⏳ Seus pontos vão expirar!',
              body: `Você tem ${points} pontos vencendo nos próximos 30 dias. Use-os agora!`,
              data: { type: 'points_expiration', points },
            },
          });

          this.logger.debug({
            job: 'PointsExpirationJob',
            action: 'notify_user',
            userId,
            pointsExpiring: points,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          this.logger.error({
            job: 'PointsExpirationJob',
            action: 'notify_error',
            userId,
            error: errorMessage,
          });
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error({
        job: 'PointsExpirationJob',
        action: 'notify_failed',
        error: errorMessage,
        stack: errorStack,
      });
    }
  }
}
