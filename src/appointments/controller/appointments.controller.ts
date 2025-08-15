import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { SearchAvailableSlotsDto } from '../dto/search-available-slots.dto';
import { AppointmentsService } from '../service/appointments.service';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post('search-available-slots')
  async searchAvailableSlots(@Body() searchDto: SearchAvailableSlotsDto) {
    return await this.appointmentsService.searchAvailableSlots(searchDto);
  }

  @Post(':calendarOwnerId/book')
  @HttpCode(HttpStatus.CREATED)
  async bookAppointment(
    @Param('calendarOwnerId') calendarOwnerId: string,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    return await this.appointmentsService.bookAppointment(
      calendarOwnerId,
      createAppointmentDto,
    );
  }

  @Get(':id')
  async getAppointment(@Param('id') id: string) {
    return await this.appointmentsService.getAppointment(id);
  }

  @Patch(':id/cancel')
  async cancelAppointment(@Param('id') id: string) {
    return await this.appointmentsService.cancelAppointment(id);
  }
}