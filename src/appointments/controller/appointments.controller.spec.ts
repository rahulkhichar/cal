import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { SearchAvailableSlotsDto } from '../dto/search-available-slots.dto';
import { Appointment, AppointmentStatus } from '../entities/appointment.entity';
import { AppointmentsService } from '../service/appointments.service';

describe('AppointmentsController', () => {
  let controller: AppointmentsController;
  let service: AppointmentsService;

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

  const mockTimeSlots = [
    {
      startTime: '09:00:00',
      endTime: '10:00:00',
      available: true,
    },
    {
      startTime: '10:00:00',
      endTime: '11:00:00',
      available: false,
    },
  ];

  const mockService = {
    searchAvailableSlots: jest.fn(),
    bookAppointment: jest.fn(),
    getAppointment: jest.fn(),
    cancelAppointment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentsController],
      providers: [
        {
          provide: AppointmentsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AppointmentsController>(AppointmentsController);
    service = module.get<AppointmentsService>(AppointmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('searchAvailableSlots', () => {
    const searchDto: SearchAvailableSlotsDto = {
      date: '2024-01-15',
      calendarOwnerId: 'owner-123',
    };

    it('should return available time slots', async () => {
      mockService.searchAvailableSlots.mockResolvedValue(mockTimeSlots);

      const result = await controller.searchAvailableSlots(searchDto);

      expect(service.searchAvailableSlots).toHaveBeenCalledWith(searchDto);
      expect(result).toEqual(mockTimeSlots);
    });

    it('should return empty array when no slots available', async () => {
      mockService.searchAvailableSlots.mockResolvedValue([]);

      const result = await controller.searchAvailableSlots(searchDto);

      expect(result).toEqual([]);
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
      mockService.bookAppointment.mockResolvedValue(mockAppointment);

      const result = await controller.bookAppointment('owner-123', createAppointmentDto);

      expect(service.bookAppointment).toHaveBeenCalledWith('owner-123', createAppointmentDto);
      expect(result).toEqual(mockAppointment);
    });

    it('should return 201 status code', async () => {
      const bookMethod = AppointmentsController.prototype.bookAppointment;
      const decorators = Reflect.getMetadata('__httpCode__', bookMethod);
      
      expect(decorators).toBe(HttpStatus.CREATED);
    });
  });

  describe('getAppointment', () => {
    it('should return a specific appointment', async () => {
      mockService.getAppointment.mockResolvedValue(mockAppointment);

      const result = await controller.getAppointment('appointment-123');

      expect(service.getAppointment).toHaveBeenCalledWith('appointment-123');
      expect(result).toEqual(mockAppointment);
    });

    it('should return appointment with calendar owner relation', async () => {
      const appointmentWithOwner = { ...mockAppointment, calendarOwner: { id: 'owner-123', firstName: 'John', lastName: 'Doe' } };
      mockService.getAppointment.mockResolvedValue(appointmentWithOwner);

      const result = await controller.getAppointment('appointment-123');

      expect(result).toEqual(appointmentWithOwner);
      expect(result.calendarOwner).toBeDefined();
    });
  });

  describe('cancelAppointment', () => {
    it('should cancel an appointment successfully', async () => {
      const cancelledAppointment = { ...mockAppointment, status: AppointmentStatus.CANCELLED };
      mockService.cancelAppointment.mockResolvedValue(cancelledAppointment);

      const result = await controller.cancelAppointment('appointment-123');

      expect(service.cancelAppointment).toHaveBeenCalledWith('appointment-123');
      expect(result).toEqual(cancelledAppointment);
      expect(result.status).toBe(AppointmentStatus.CANCELLED);
    });

    it('should return cancelled appointment with updated status', async () => {
      const cancelledAppointment = { ...mockAppointment, status: AppointmentStatus.CANCELLED };
      mockService.cancelAppointment.mockResolvedValue(cancelledAppointment);

      const result = await controller.cancelAppointment('appointment-123');

      expect(result.status).toBe(AppointmentStatus.CANCELLED);
    });
  });
}); 