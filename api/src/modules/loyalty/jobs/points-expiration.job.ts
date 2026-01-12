import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../database/prisma.service';
import { LoyaltyService } from '../services/loyalty.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class PointsExpirationJob {
  private readonly logger = new Logger(PointsExpirationJob.name);
  private readonly BATCH_SIZE = 50;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 1000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly loyaltyService: LoyaltyService,
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
          const pointsToExpire = Math.abs(transaction.points);

          try {
            // Validar saldo antes de expirar
            if (transaction.account.currentPoints < pointsToExpire) {
              this.logger.warn({
                job: 'PointsExpirationJob',
                action: 'skipped_insufficient_balance',
                transactionId: transaction.id,
                accountId: transaction.accountId,
                currentPoints: transaction.account.currentPoints,
                pointsToExpire,
              });
              skippedCount++;
              continue;
            }

            if (isDryRun) {
              this.logger.debug({
                job: 'PointsExpirationJob',
                action: 'dry_run',
                transactionId: transaction.id,
                accountId: transaction.accountId,
                pointsToExpire,
              });
              successCount++;
              totalPointsExpired += pointsToExpire;
              continue;
            }

            // Tentar expirar com retry logic
            const success = await this.expireTransactionWithRetry(
              transaction,
              pointsToExpire,
            );

            if (success) {
              successCount++;
              totalPointsExpired += pointsToExpire;
              this.logger.debug({
                job: 'PointsExpirationJob',
                action: 'expired',
                transactionId: transaction.id,
                accountId: transaction.accountId,
                userId: transaction.account.userId,
                points: pointsToExpire,
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
    pointsToExpire: number,
  ): Promise<boolean> {
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        await this.prisma.$transaction([
          this.prisma.loyaltyTransaction.create({
            data: {
              accountId: transaction.accountId,
              points: -pointsToExpire,
              type: TransactionType.EXPIRATION,
              description: `Expiração de pontos (${transaction.description})`,
              referenceId: transaction.id,
            },
          }),
          this.prisma.loyaltyTransaction.update({
            where: { id: transaction.id },
            data: { expired: true },
          }),
          this.prisma.loyaltyAccount.update({
            where: { id: transaction.accountId },
            data: {
              currentPoints: { decrement: pointsToExpire },
            },
          }),
        ]);
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
          // TODO: Implementar serviço de notificação (email/push)
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
