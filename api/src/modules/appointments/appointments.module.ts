import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { PrismaService } from 'src/database/prisma.service';
import { ServicesService } from 'src/modules/services/services.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, PrismaService, ServicesService],
})
export class AppointmentsModule {}
