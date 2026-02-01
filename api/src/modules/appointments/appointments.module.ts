import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { MailModule } from '../mail/mail.module';
import { AppointmentsRepository } from './appointments.repository';
import { ServicesModule } from 'src/modules/services/services.module';
import { CommissionsModule } from '../commissions/commissions.module';

@Module({
  imports: [ServicesModule, MailModule, CommissionsModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, AppointmentsRepository],
  exports: [AppointmentsService, AppointmentsRepository],
})
export class AppointmentsModule {}
