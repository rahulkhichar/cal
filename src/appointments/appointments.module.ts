import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { Appointment } from './entities/appointment.entity';
import { CalendarOwner } from '../calendar-owners/entities/calendar-owner.entity';
import { AvailabilityRule } from '../availability-rules/entities/availability-rule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, CalendarOwner, AvailabilityRule])],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {} 