import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CalendarOwnersService } from './calendar-owners.service';
import { CreateCalendarOwnerDto } from './dto/create-calendar-owner.dto';

@Controller('calendar-owners')
export class CalendarOwnersController {
  constructor(private readonly calendarOwnersService: CalendarOwnersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCalendarOwnerDto: CreateCalendarOwnerDto) {
    const calendarOwner = await this.calendarOwnersService.create(createCalendarOwnerDto);
    const { password, ...calendarOwnerWithoutPassword } = calendarOwner;
    return calendarOwnerWithoutPassword;
  }

  @Get()
  async findAll() {
    return await this.calendarOwnersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.calendarOwnersService.findOne(id);
  }



  @Get(':id/appointments')
  async getUpcomingAppointments(@Param('id') id: string) {
    return await this.calendarOwnersService.getUpcomingAppointments(id);
  }
} 