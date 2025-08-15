import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { AppointmentsService, TimeSlot } from './appointments.service';
import { Appointment, AppointmentStatus } from '../entities/appointment.entity';
import { CalendarOwner } from '../../calendar-owners/entities/calendar-owner.entity';
import { AvailabilityRule, DayOfWeek } from '../../availability-rules/entities/availability-rule.entity';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { SearchAvailableSlotsDto } from '../dto/search-available-slots.dto';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let appointmentRepository: Repository<Appointment>;
  let calendarOwnerRepository: Repository<CalendarOwner>;
  let availabilityRuleRepository: Repository<AvailabilityRule>;

  const mockAppointmentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockCalendarOwnerRepository = {
    findOne: jest.fn(),
  };

  const mockAvailabilityRuleRepository = {
    findOne: jest.fn(),
  };

  const mockCalendarOwner: CalendarOwner = {
    id: 'owner-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'hashedpassword',
    timezone: 'UTC',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    appointments: [],
    availabilityRules: [],
  };

  const mockAvailabilityRule: AvailabilityRule = {
    id: 'rule-123',
    calendarOwnerId: 'owner-123',
    dayOfWeek: DayOfWeek.MONDAY,
    startTime: '09:00:00',
    endTime: '17:00:00',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    calendarOwner: null,
  };

  const mockAppointment: Appointment = {
    id: 'appointment-123',
    calendarOwnerId: 'owner-123',
    inviteeName: 'Jane Smith',
    inviteeEmail: 'jane@example.com',
    startTime: new Date('2024-01-15T10:00:00Z'),
    endTime: new Date('2024-01-15T11:00:00Z'),
    notes: 'Test appointment',
    status: AppointmentStatus.CONFIRMED,
    createdAt: new Date(),
    updatedAt: new Date(),
    calendarOwner: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: getRepositoryToken(Appointment),
          useValue: mockAppointmentRepository,
        },
        {
          provide: getRepositoryToken(CalendarOwner),
          useValue: mockCalendarOwnerRepository,
        },
        {
          provide: getRepositoryToken(AvailabilityRule),
          useValue: mockAvailabilityRuleRepository,
        },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
    appointmentRepository = module.get<Repository<Appointment>>(getRepositoryToken(Appointment));
    calendarOwnerRepository = module.get<Repository<CalendarOwner>>(getRepositoryToken(CalendarOwner));
    availabilityRuleRepository = module.get<Repository<AvailabilityRule>>(getRepositoryToken(AvailabilityRule));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('searchAvailableSlots', () => {
    const searchDto: SearchAvailableSlotsDto = {
      date: '2024-01-15',
      calendarOwnerId: 'owner-123',
    };

    it('should return available time slots when no conflicts exist', async () => {
      mockCalendarOwnerRepository.findOne.mockResolvedValue(mockCalendarOwner);
      mockAvailabilityRuleRepository.findOne.mockResolvedValue(mockAvailabilityRule);
      mockAppointmentRepository.find.mockResolvedValue([]);

      const result = await service.searchAvailableSlots(searchDto);

      expect(mockCalendarOwnerRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'owner-123' },
      });
      expect(mockAvailabilityRuleRepository.findOne).toHaveBeenCalledWith({
        where: {
          calendarOwnerId: 'owner-123',
          dayOfWeek: 1, // Monday
          isActive: true,
        },
      });
      expect(mockAppointmentRepository.find).toHaveBeenCalledWith({
        where: {
          calendarOwnerId: 'owner-123',
          startTime: expect.any(Object),
          status: AppointmentStatus.CONFIRMED,
        },
      });

      expect(result).toHaveLength(8); // 9:00-17:00 in 1-hour slots
      expect(result[0]).toEqual({
        startTime: '09:00:00',
        endTime: '10:00:00',
        available: true,
      });
      expect(result.every(slot => slot.available)).toBe(true);
    });

    it('should throw NotFoundException when calendar owner not found', async () => {
      mockCalendarOwnerRepository.findOne.mockResolvedValue(null);

      await expect(service.searchAvailableSlots(searchDto)).rejects.toThrow(
        new NotFoundException('Calendar owner with ID owner-123 not found'),
      );
    });

    it('should return empty array when no availability rule exists for the day', async () => {
      mockCalendarOwnerRepository.findOne.mockResolvedValue(mockCalendarOwner);
      mockAvailabilityRuleRepository.findOne.mockResolvedValue(null);

      const result = await service.searchAvailableSlots(searchDto);

      expect(result).toEqual([]);
    });

    it('should mark slots as unavailable when conflicts exist', async () => {
      // Create conflicting appointment for 2024-01-15 at 10:00 AM
      const conflictingAppointment = {
        ...mockAppointment,
        startTime: new Date('2024-01-15T10:00:00'),
        endTime: new Date('2024-01-15T11:00:00'),
      };

      mockCalendarOwnerRepository.findOne.mockResolvedValue(mockCalendarOwner);
      mockAvailabilityRuleRepository.findOne.mockResolvedValue(mockAvailabilityRule);
      mockAppointmentRepository.find.mockResolvedValue([conflictingAppointment]);

      const result = await service.searchAvailableSlots(searchDto);

      const conflictingSlot = result.find(slot => slot.startTime === '10:00:00');
      expect(conflictingSlot?.available).toBe(false);
      
      // Other slots should still be available
      const availableSlot = result.find(slot => slot.startTime === '09:00:00');
      expect(availableSlot?.available).toBe(true);
    });

    it('should handle Sunday correctly (day 0 becomes 7)', async () => {
      const sundaySearchDto = { ...searchDto, date: '2024-01-14' }; // Sunday
      
      mockCalendarOwnerRepository.findOne.mockResolvedValue(mockCalendarOwner);
      mockAvailabilityRuleRepository.findOne.mockResolvedValue(mockAvailabilityRule);
      mockAppointmentRepository.find.mockResolvedValue([]);

      await service.searchAvailableSlots(sundaySearchDto);

      expect(mockAvailabilityRuleRepository.findOne).toHaveBeenCalledWith({
        where: {
          calendarOwnerId: 'owner-123',
          dayOfWeek: 7, // Sunday
          isActive: true,
        },
      });
    });
  });

  describe('bookAppointment', () => {
    const createAppointmentDto: CreateAppointmentDto = {
      inviteeName: 'Jane Smith',
      inviteeEmail: 'jane@example.com',
      startTime: '2024-01-15T10:00:00Z',
      notes: 'Test appointment',
    };

    it('should book an appointment successfully', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(10, 0, 0, 0); // Set to 10:00 AM
      const futureAppointmentDto = {
        ...createAppointmentDto,
        startTime: futureDate.toISOString(),
      };

      mockCalendarOwnerRepository.findOne.mockResolvedValue(mockCalendarOwner);
      mockAvailabilityRuleRepository.findOne.mockResolvedValue(mockAvailabilityRule);
      mockAppointmentRepository.find.mockResolvedValue([]);
      mockAppointmentRepository.findOne.mockResolvedValue(null);
      mockAppointmentRepository.create.mockReturnValue(mockAppointment);
      mockAppointmentRepository.save.mockResolvedValue(mockAppointment);

      const result = await service.bookAppointment('owner-123', futureAppointmentDto);

      expect(mockCalendarOwnerRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'owner-123' },
      });
      expect(mockAppointmentRepository.create).toHaveBeenCalledWith({
        calendarOwnerId: 'owner-123',
        inviteeName: 'Jane Smith',
        inviteeEmail: 'jane@example.com',
        startTime: expect.any(Date),
        endTime: expect.any(Date),
        notes: 'Test appointment',
        status: AppointmentStatus.CONFIRMED,
      });
      expect(mockAppointmentRepository.save).toHaveBeenCalledWith(mockAppointment);
      expect(result).toEqual(mockAppointment);
    });

    it('should throw NotFoundException when calendar owner not found', async () => {
      mockCalendarOwnerRepository.findOne.mockResolvedValue(null);

      await expect(service.bookAppointment('owner-123', createAppointmentDto)).rejects.toThrow(
        new NotFoundException('Calendar owner with ID owner-123 not found'),
      );
    });

    it('should throw BadRequestException when appointment is in the past', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const pastAppointmentDto = {
        ...createAppointmentDto,
        startTime: pastDate.toISOString(),
      };

      mockCalendarOwnerRepository.findOne.mockResolvedValue(mockCalendarOwner);

      await expect(service.bookAppointment('owner-123', pastAppointmentDto)).rejects.toThrow(
        new BadRequestException('Appointment must be scheduled in the future'),
      );
    });

    it('should throw ConflictException when time slot is not available', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureAppointmentDto = {
        ...createAppointmentDto,
        startTime: futureDate.toISOString(),
      };

      mockCalendarOwnerRepository.findOne.mockResolvedValue(mockCalendarOwner);
      mockAvailabilityRuleRepository.findOne.mockResolvedValue(mockAvailabilityRule);
      mockAppointmentRepository.find.mockResolvedValue([]);

      await expect(service.bookAppointment('owner-123', futureAppointmentDto)).rejects.toThrow(
        new ConflictException('Requested time slot is not available'),
      );
    });

    it('should throw ConflictException when double booking occurs', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(10, 0, 0, 0); // Set to 10:00 AM
      const futureAppointmentDto = {
        ...createAppointmentDto,
        startTime: futureDate.toISOString(),
      };

      mockCalendarOwnerRepository.findOne.mockResolvedValue(mockCalendarOwner);
      mockAvailabilityRuleRepository.findOne.mockResolvedValue(mockAvailabilityRule);
      mockAppointmentRepository.find.mockResolvedValue([]);
      mockAppointmentRepository.findOne.mockResolvedValue(mockAppointment);

      await expect(service.bookAppointment('owner-123', futureAppointmentDto)).rejects.toThrow(
        new ConflictException('Time slot is already booked'),
      );
    });
  });

  describe('getAppointment', () => {
    it('should return an appointment with calendar owner relation', async () => {
      const appointmentWithOwner = { ...mockAppointment, calendarOwner: mockCalendarOwner };
      mockAppointmentRepository.findOne.mockResolvedValue(appointmentWithOwner);

      const result = await service.getAppointment('appointment-123');

      expect(mockAppointmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'appointment-123' },
        relations: ['calendarOwner'],
      });
      expect(result).toEqual(appointmentWithOwner);
    });

    it('should throw NotFoundException when appointment not found', async () => {
      mockAppointmentRepository.findOne.mockResolvedValue(null);

      await expect(service.getAppointment('appointment-123')).rejects.toThrow(
        new NotFoundException('Appointment with ID appointment-123 not found'),
      );
    });
  });

  describe('cancelAppointment', () => {
    it('should cancel an appointment successfully', async () => {
      const cancelledAppointment = { ...mockAppointment, status: AppointmentStatus.CANCELLED };
      mockAppointmentRepository.findOne.mockResolvedValue(mockAppointment);
      mockAppointmentRepository.save.mockResolvedValue(cancelledAppointment);

      const result = await service.cancelAppointment('appointment-123');

      expect(mockAppointmentRepository.save).toHaveBeenCalledWith({
        ...mockAppointment,
        status: AppointmentStatus.CANCELLED,
      });
      expect(result).toEqual(cancelledAppointment);
    });

    it('should throw NotFoundException when appointment not found', async () => {
      mockAppointmentRepository.findOne.mockResolvedValue(null);

      await expect(service.cancelAppointment('appointment-123')).rejects.toThrow(
        new NotFoundException('Appointment with ID appointment-123 not found'),
      );
    });
  });

  describe('generateTimeSlots (private method)', () => {
    it('should generate correct time slots', () => {
      // Access private method through service instance
      const serviceInstance = service as any;
      const slots = serviceInstance.generateTimeSlots('09:00:00', '12:00:00');

      expect(slots).toEqual([
        { startTime: '09:00:00', endTime: '10:00:00' },
        { startTime: '10:00:00', endTime: '11:00:00' },
        { startTime: '11:00:00', endTime: '12:00:00' },
      ]);
    });

    it('should handle edge case with exact hour boundaries', () => {
      const serviceInstance = service as any;
      const slots = serviceInstance.generateTimeSlots('10:00:00', '11:00:00');

      expect(slots).toEqual([
        { startTime: '10:00:00', endTime: '11:00:00' },
      ]);
    });
  });
}); 