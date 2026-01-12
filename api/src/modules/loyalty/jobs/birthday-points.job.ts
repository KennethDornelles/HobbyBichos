/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../database/prisma.service';
import { LoyaltyService } from '../services/loyalty.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class BirthdayPointsJob {
  private readonly logger = new Logger(BirthdayPointsJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly loyaltyService: LoyaltyService,
  ) {}

  @Cron('0 0 * * *')
  async handleBirthdayPoints(): Promise<void> {
    const startTime = Date.now();
    let awardedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    let totalPoints = 0;

    try {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;
      const currentDay = today.getDate();

      this.logger.log({
        job: 'BirthdayPointsJob',
        action: 'started',
        date: today.toISOString(),
      });

      // Buscar usuários que fazem aniversário hoje usando SQL nativo
      const birthdayUsers = await this.prisma.$queryRaw<
        Array<{ id: string; name: string; email: string; createdAt: Date }>
      >`
        SELECT id, name, email, "createdAt"
        FROM users
        WHERE EXTRACT(MONTH FROM "birthDate") = ${currentMonth}
          AND EXTRACT(DAY FROM "birthDate") = ${currentDay}
          AND "birthDate" IS NOT NULL
      `;

      this.logger.log(
        `Found ${birthdayUsers.length} users with birthdays today`,
      );

      const birthdayBonus = Number(process.env.LOYALTY_BIRTHDAY_BONUS ?? 50);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      for (const user of birthdayUsers) {
        try {
          // Verificar se a conta existe há pelo menos 1 ano
          if (new Date(user.createdAt) > oneYearAgo) {
            this.logger.debug({
              job: 'BirthdayPointsJob',
              action: 'skipped_new_account',
              userId: user.id,
              userName: user.name,
              accountAge: Math.floor(
                (Date.now() - new Date(user.createdAt).getTime()) /
                  (1000 * 60 * 60 * 24),
              ),
            });
            skippedCount++;
            continue;
          }

          // Verificar se já recebeu pontos de aniversário este ano
          const existingAward =
            await this.prisma.loyaltyBirthdayAward.findUnique({
              where: {
                userId_year: {
                  userId: user.id,
                  year: currentYear,
                },
              },
            });

          if (existingAward) {
            this.logger.debug({
              job: 'BirthdayPointsJob',
              action: 'skipped_already_awarded',
              userId: user.id,
              userName: user.name,
              awardedAt: existingAward.awardedAt,
            });
            skippedCount++;
            continue;
          }

          // Conceder pontos usando transação atômica
          await this.prisma.$transaction(async (tx) => {
            // Adicionar pontos
            await this.loyaltyService.addPoints({
              userId: user.id,
              points: birthdayBonus,
              type: TransactionType.BIRTHDAY,
              description: 'Feliz aniversário! 🎂',
            });

            // Registrar concessão para evitar duplicação
            await tx.loyaltyBirthdayAward.create({
              data: {
                userId: user.id,
                year: currentYear,
                points: birthdayBonus,
              },
            });
          });

          awardedCount++;
          totalPoints += birthdayBonus;

          this.logger.log({
            job: 'BirthdayPointsJob',
            action: 'awarded',
            userId: user.id,
            userName: user.name,
            email: user.email,
            points: birthdayBonus,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          errorCount++;
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          this.logger.error({
            job: 'BirthdayPointsJob',
            action: 'error',
            userId: user.id,
            userName: user.name,
            error: errorMessage,
          });
        }
      }

      const executionTime = Date.now() - startTime;
      this.logger.log({
        job: 'BirthdayPointsJob',
        action: 'completed',
        metrics: {
          totalProcessed: birthdayUsers.length,
          awarded: awardedCount,
          skipped: skippedCount,
          errors: errorCount,
          totalPoints,
          executionTimeMs: executionTime,
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error({
        job: 'BirthdayPointsJob',
        action: 'failed',
        error: errorMessage,
        stack: errorStack,
      });
    }
  }
}
