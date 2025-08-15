import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { CalendarOwner } from '../calendar-owners/entities/calendar-owner.entity';
import { AvailabilityRule, DayOfWeek } from '../availability-rules/entities/availability-rule.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { SearchAvailableSlotsDto } from './dto/search-available-slots.dto';

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(CalendarOwner)
    private readonly calendarOwnerRepository: Repository<CalendarOwner>,
    @InjectRepository(AvailabilityRule)
    private readonly availabilityRuleRepository: Repository<AvailabilityRule>,
  ) {}

  async searchAvailableSlots(searchDto: SearchAvailableSlotsDto): Promise<TimeSlot[]> {
    const { date, calendarOwnerId } = searchDto;

    const calendarOwner = await this.calendarOwnerRepository.findOne({
      where: { id: calendarOwnerId },
    });

    if (!calendarOwner) {
      throw new NotFoundException(`Calendar owner with ID ${calendarOwnerId} not found`);
    }

    const searchDate = new Date(date);
    const dayOfWeek = searchDate.getDay() === 0 ? 7 : searchDate.getDay(); 

    // Get availability rule for this day
    const availabilityRule = await this.availabilityRuleRepository.findOne({
      where: {
        calendarOwnerId,
        dayOfWeek: dayOfWeek as DayOfWeek,
        isActive: true,
      },
    });

    if (!availabilityRule) {
      return []; // No availability for this day
    }

    // Generate time slots for the day
    const timeSlots = this.generateTimeSlots(availabilityRule.startTime, availabilityRule.endTime);
    
    // Get existing appointments for this date
    const startOfDay = new Date(searchDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(searchDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await this.appointmentRepository.find({
      where: {
        calendarOwnerId,
        startTime: Between(startOfDay, endOfDay),
        status: AppointmentStatus.CONFIRMED,
      },
    });

    // Mark slots as unavailable if they conflict with existing appointments
    const availableSlots = timeSlots.map(slot => {
      const slotStart = new Date(`${date}T${slot.startTime}`);
      const slotEnd = new Date(`${date}T${slot.endTime}`);

      const isConflict = existingAppointments.some(appointment => {
        const appointmentStart = new Date(appointment.startTime);
        const appointmentEnd = new Date(appointment.endTime);
        
        return (
          (slotStart >= appointmentStart && slotStart < appointmentEnd) ||
          (slotEnd > appointmentStart && slotEnd <= appointmentEnd) ||
          (slotStart <= appointmentStart && slotEnd >= appointmentEnd)
        );
      });

      return {
        startTime: slot.startTime,
        endTime: slot.endTime,
        available: !isConflict,
      };
    });

    return availableSlots;
  }

  async bookAppointment(calendarOwnerId: string, createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const { startTime, inviteeName, inviteeEmail, notes } = createAppointmentDto;

    // Verify calendar owner exists
    const calendarOwner = await this.calendarOwnerRepository.findOne({
      where: { id: calendarOwnerId },
    });

    if (!calendarOwner) {
      throw new NotFoundException(`Calendar owner with ID ${calendarOwnerId} not found`);
    }

    // Parse start time
    const appointmentStart = new Date(startTime);
    const appointmentEnd = new Date(appointmentStart.getTime() + 60 * 60 * 1000); // Add 1 hour

    // Validate appointment time is in the future
    if (appointmentStart <= new Date()) {
      throw new BadRequestException('Appointment must be scheduled in the future');
    }

    // Check if the time slot is available
    const availableSlots = await this.searchAvailableSlots({
      date: appointmentStart.toISOString().split('T')[0],
      calendarOwnerId,
    });

    const requestedSlot = availableSlots.find(
      slot => slot.startTime === appointmentStart.toTimeString().slice(0, 5) + ':00'
    );

    if (!requestedSlot || !requestedSlot.available) {
      throw new ConflictException('Requested time slot is not available');
    }

    // Check for double booking
    const conflictingAppointment = await this.appointmentRepository.findOne({
      where: {
        calendarOwnerId,
        startTime: Between(appointmentStart, appointmentEnd),
        status: AppointmentStatus.CONFIRMED,
      },
    });

    if (conflictingAppointment) {
      throw new ConflictException('Time slot is already booked');
    }

    // Create the appointment
    const appointment = this.appointmentRepository.create({
      calendarOwnerId,
      inviteeName,
      inviteeEmail,
      startTime: appointmentStart,
      endTime: appointmentEnd,
      notes,
      status: AppointmentStatus.CONFIRMED,
    });

    return await this.appointmentRepository.save(appointment);
  }

  async getAppointment(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['calendarOwner'],
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return appointment;
  }

  async cancelAppointment(id: string): Promise<Appointment> {
    const appointment = await this.getAppointment(id);
    
    appointment.status = AppointmentStatus.CANCELLED;
    return await this.appointmentRepository.save(appointment);
  }

  private generateTimeSlots(startTime: string, endTime: string): { startTime: string; endTime: string }[] {
    const slots: { startTime: string; endTime: string }[] = [];
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    let current = new Date(start);
    
    while (current < end) {
      const slotStart = current.toTimeString().slice(0, 5) + ':00';
      current.setHours(current.getHours() + 1);
      const slotEnd = current.toTimeString().slice(0, 5) + ':00';
      
      if (current <= end) {
        slots.push({
          startTime: slotStart,
          endTime: slotEnd,
        });
      }
    }
    
    return slots;
  }
} 