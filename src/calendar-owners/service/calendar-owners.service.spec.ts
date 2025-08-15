import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CalendarOwnersService } from './calendar-owners.service';
import { CalendarOwner } from '../entities/calendar-owner.entity';
import { CreateCalendarOwnerDto } from '../dto/create-calendar-owner.dto';

describe('CalendarOwnersService', () => {
  let service: CalendarOwnersService;
  let repository: Repository<CalendarOwner>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
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
    availabilityRules: [],
    appointments: [],
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarOwnersService,
        {
          provide: getRepositoryToken(CalendarOwner),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CalendarOwnersService>(CalendarOwnersService);
    repository = module.get<Repository<CalendarOwner>>(getRepositoryToken(CalendarOwner));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateCalendarOwnerDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      timezone: 'UTC',
    };

    it('should create a new calendar owner successfully', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockCalendarOwner);
      mockRepository.save.mockResolvedValue(mockCalendarOwner);

      const result = await service.create(createDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        timezone: 'UTC',
        isActive: true,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockCalendarOwner);
      expect(result).toEqual(mockCalendarOwner);
    });

    it('should throw ConflictException when email already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockCalendarOwner);

      await expect(service.create(createDto)).rejects.toThrow(
        new ConflictException('Calendar owner with this email already exists'),
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should set timezone to UTC by default when not provided', async () => {
      const createDtoWithoutTimezone = { ...createDto };
      delete createDtoWithoutTimezone.timezone;

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockCalendarOwner);
      mockRepository.save.mockResolvedValue(mockCalendarOwner);

      await service.create(createDtoWithoutTimezone);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDtoWithoutTimezone,
        timezone: 'UTC',
        isActive: true,
      });
    });
  });

  describe('findAll', () => {
    it('should return all calendar owners with selected fields', async () => {
      const mockOwners = [mockCalendarOwner];
      mockRepository.find.mockResolvedValue(mockOwners);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        select: ['id', 'firstName', 'lastName', 'email', 'timezone', 'isActive', 'createdAt', 'updatedAt'],
      });
      expect(result).toEqual(mockOwners);
    });

    it('should return empty array when no calendar owners exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a specific calendar owner with availability rules', async () => {
      const calendarOwnerWithRules = { ...mockCalendarOwner, availabilityRules: [] };
      mockRepository.findOne.mockResolvedValue(calendarOwnerWithRules);

      const result = await service.findOne('owner-123');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'owner-123' },
        select: ['id', 'firstName', 'lastName', 'email', 'timezone', 'isActive', 'createdAt', 'updatedAt'],
        relations: ['availabilityRules'],
      });
      expect(result).toEqual(calendarOwnerWithRules);
    });

    it('should throw NotFoundException when calendar owner does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('owner-123')).rejects.toThrow(
        new NotFoundException('Calendar owner with ID owner-123 not found'),
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a calendar owner by email', async () => {
      mockRepository.findOne.mockResolvedValue(mockCalendarOwner);

      const result = await service.findByEmail('john@example.com');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
      expect(result).toEqual(mockCalendarOwner);
    });

    it('should return null when calendar owner with email does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('getUpcomingAppointments', () => {
    const mockAppointments = [
      {
        appointment_id: 'appointment-123',
        appointment_inviteeName: 'Jane Smith',
        appointment_inviteeEmail: 'jane@example.com',
        appointment_startTime: new Date('2024-01-15T10:00:00Z'),
        appointment_endTime: new Date('2024-01-15T11:00:00Z'),
        appointment_notes: 'Test appointment',
        appointment_status: 'confirmed',
        appointment_createdAt: new Date(),
      },
    ];

    it('should return upcoming appointments for a calendar owner', async () => {
      mockRepository.findOne.mockResolvedValue(mockCalendarOwner);
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getRawMany.mockResolvedValue(mockAppointments);

      const result = await service.getUpcomingAppointments('owner-123');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'owner-123' },
        select: ['id', 'firstName', 'lastName', 'email', 'timezone', 'isActive', 'createdAt', 'updatedAt'],
        relations: ['availabilityRules'],
      });
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('owner');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('owner.appointments', 'appointment');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('owner.id = :calendarOwnerId', { calendarOwnerId: 'owner-123' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('appointment.startTime >= :now', { now: expect.any(Date) });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('appointment.status = :status', { status: 'confirmed' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('appointment.startTime', 'ASC');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith([
        'appointment.id',
        'appointment.inviteeName',
        'appointment.inviteeEmail',
        'appointment.startTime',
        'appointment.endTime',
        'appointment.notes',
        'appointment.status',
        'appointment.createdAt',
      ]);
      expect(result).toEqual(mockAppointments);
    });

    it('should throw NotFoundException when calendar owner does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getUpcomingAppointments('owner-123')).rejects.toThrow(
        new NotFoundException('Calendar owner with ID owner-123 not found'),
      );

      expect(mockRepository.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('should return empty array when no upcoming appointments exist', async () => {
      mockRepository.findOne.mockResolvedValue(mockCalendarOwner);
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await service.getUpcomingAppointments('owner-123');

      expect(result).toEqual([]);
    });
  });
}); 