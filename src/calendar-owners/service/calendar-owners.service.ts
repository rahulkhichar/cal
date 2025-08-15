import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalendarOwner } from '../entities/calendar-owner.entity';
import { CreateCalendarOwnerDto } from '../dto/create-calendar-owner.dto';

@Injectable()
export class CalendarOwnersService {
  constructor(
    @InjectRepository(CalendarOwner)
    private readonly calendarOwnerRepository: Repository<CalendarOwner>,
  ) {}

  async create(createCalendarOwnerDto: CreateCalendarOwnerDto): Promise<CalendarOwner> {
    const existingOwner = await this.calendarOwnerRepository.findOne({
      where: { email: createCalendarOwnerDto.email },
    });

    if (existingOwner) {
      throw new ConflictException('Calendar owner with this email already exists');
    }

    const calendarOwner = this.calendarOwnerRepository.create({
      ...createCalendarOwnerDto,
      timezone: createCalendarOwnerDto.timezone || 'UTC',
      isActive: true,
    });
    return await this.calendarOwnerRepository.save(calendarOwner);
  }

  async findAll(): Promise<CalendarOwner[]> {
    return await this.calendarOwnerRepository.find({
      select: ['id', 'firstName', 'lastName', 'email', 'timezone', 'isActive', 'createdAt', 'updatedAt'],
    });
  }

  async findOne(id: string): Promise<CalendarOwner> {
    const calendarOwner = await this.calendarOwnerRepository.findOne({
      where: { id },
      select: ['id', 'firstName', 'lastName', 'email', 'timezone', 'isActive', 'createdAt', 'updatedAt'],
      relations: ['availabilityRules'],
    });

    if (!calendarOwner) {
      throw new NotFoundException(`Calendar owner with ID ${id} not found`);
    }

    return calendarOwner;
  }

  async findByEmail(email: string): Promise<CalendarOwner | null> {
    return await this.calendarOwnerRepository.findOne({
      where: { email },
    });
  }

  async getUpcomingAppointments(calendarOwnerId: string): Promise<any[]> {
    await this.findOne(calendarOwnerId);

    const now = new Date();
    
    return await this.calendarOwnerRepository
      .createQueryBuilder('owner')
      .leftJoinAndSelect('owner.appointments', 'appointment')
      .where('owner.id = :calendarOwnerId', { calendarOwnerId })
      .andWhere('appointment.startTime >= :now', { now })
      .andWhere('appointment.status = :status', { status: 'confirmed' })
      .orderBy('appointment.startTime', 'ASC')
      .select([
        'appointment.id',
        'appointment.inviteeName',
        'appointment.inviteeEmail',
        'appointment.startTime',
        'appointment.endTime',
        'appointment.notes',
        'appointment.status',
        'appointment.createdAt',
      ])
      .getRawMany();
  }
} 