import { Module } from '@nestjs/common';
import { ManagerController } from './manager.controller';
import { ManagerService } from './manager.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [ManagerController],
  providers: [ManagerService, PrismaService],
  exports: [ManagerService],
})
export class ManagerModule {}
