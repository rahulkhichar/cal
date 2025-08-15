import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarOwnersController } from './controller/calendar-owners.controller';
import { CalendarOwner } from './entities/calendar-owner.entity';
import { CalendarOwnersService } from './service/calendar-owners.service';

@Module({
  imports: [TypeOrmModule.forFeature([CalendarOwner])],
  controllers: [CalendarOwnersController],
  providers: [CalendarOwnersService],
  exports: [CalendarOwnersService],
})
export class CalendarOwnersModule {} 