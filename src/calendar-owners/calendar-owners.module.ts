import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarOwnersService } from './calendar-owners.service';
import { CalendarOwnersController } from './calendar-owners.controller';
import { CalendarOwner } from './entities/calendar-owner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CalendarOwner])],
  controllers: [CalendarOwnersController],
  providers: [CalendarOwnersService],
  exports: [CalendarOwnersService],
})
export class CalendarOwnersModule {} 