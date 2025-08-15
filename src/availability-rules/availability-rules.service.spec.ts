import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AvailabilityRulesService } from './availability-rules.service';
import { AvailabilityRule, DayOfWeek } from './entities/availability-rule.entity';
import { CreateAvailabilityRuleDto } from './dto/create-availability-rule.dto';
import { UpdateAvailabilityRuleDto } from './dto/update-availability-rule.dto';

describe('AvailabilityRulesService', () => {
  let service: AvailabilityRulesService;
  let repository: Repository<AvailabilityRule>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityRulesService,
        {
          provide: getRepositoryToken(AvailabilityRule),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AvailabilityRulesService>(AvailabilityRulesService);
    repository = module.get<Repository<AvailabilityRule>>(getRepositoryToken(AvailabilityRule));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateAvailabilityRuleDto = {
      dayOfWeek: DayOfWeek.MONDAY,
      startTime: '09:00:00',
      endTime: '17:00:00',
      isActive: true,
    };

    it('should create a new availability rule successfully', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockAvailabilityRule);
      mockRepository.save.mockResolvedValue(mockAvailabilityRule);

      const result = await service.create('owner-123', createDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          calendarOwnerId: 'owner-123',
          dayOfWeek: DayOfWeek.MONDAY,
        },
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        calendarOwnerId: 'owner-123',
        isActive: true,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockAvailabilityRule);
      expect(result).toEqual(mockAvailabilityRule);
    });

    it('should throw ConflictException when rule already exists for the day', async () => {
      mockRepository.findOne.mockResolvedValue(mockAvailabilityRule);

      await expect(service.create('owner-123', createDto)).rejects.toThrow(
        new ConflictException('Availability rule for day 1 already exists'),
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          calendarOwnerId: 'owner-123',
          dayOfWeek: DayOfWeek.MONDAY,
        },
      });
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should set isActive to true by default when not provided', async () => {
      const createDtoWithoutActive = { ...createDto };
      delete createDtoWithoutActive.isActive;

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockAvailabilityRule);
      mockRepository.save.mockResolvedValue(mockAvailabilityRule);

      await service.create('owner-123', createDtoWithoutActive);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDtoWithoutActive,
        calendarOwnerId: 'owner-123',
        isActive: true,
      });
    });
  });

  describe('findAll', () => {
    it('should return all availability rules for a calendar owner', async () => {
      const mockRules = [mockAvailabilityRule];
      mockRepository.find.mockResolvedValue(mockRules);

      const result = await service.findAll('owner-123');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { calendarOwnerId: 'owner-123' },
        order: { dayOfWeek: 'ASC' },
      });
      expect(result).toEqual(mockRules);
    });

    it('should return empty array when no rules exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll('owner-123');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a specific availability rule', async () => {
      mockRepository.findOne.mockResolvedValue(mockAvailabilityRule);

      const result = await service.findOne('owner-123', 'rule-123');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'rule-123', calendarOwnerId: 'owner-123' },
      });
      expect(result).toEqual(mockAvailabilityRule);
    });

    it('should throw NotFoundException when rule does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('owner-123', 'rule-123')).rejects.toThrow(
        new NotFoundException('Availability rule with ID rule-123 not found'),
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateAvailabilityRuleDto = {
      startTime: '10:00:00',
      endTime: '18:00:00',
    };

    it('should update an availability rule successfully', async () => {
      const updatedRule = { ...mockAvailabilityRule, ...updateDto };
      mockRepository.findOne.mockResolvedValue(mockAvailabilityRule);
      mockRepository.save.mockResolvedValue(updatedRule);

      const result = await service.update('owner-123', 'rule-123', updateDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'rule-123', calendarOwnerId: 'owner-123' },
      });
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockAvailabilityRule,
        ...updateDto,
      });
      expect(result).toEqual(updatedRule);
    });

    it('should throw NotFoundException when rule does not exist', async () => {
      mockRepository.findOne.mockRejectedValue(
        new NotFoundException('Availability rule with ID rule-123 not found'),
      );

      await expect(service.update('owner-123', 'rule-123', updateDto)).rejects.toThrow(
        new NotFoundException('Availability rule with ID rule-123 not found'),
      );
    });
  });

  describe('remove', () => {
    it('should remove an availability rule successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockAvailabilityRule);
      mockRepository.remove.mockResolvedValue(mockAvailabilityRule);

      await service.remove('owner-123', 'rule-123');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'rule-123', calendarOwnerId: 'owner-123' },
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockAvailabilityRule);
    });

    it('should throw NotFoundException when rule does not exist', async () => {
      mockRepository.findOne.mockRejectedValue(
        new NotFoundException('Availability rule with ID rule-123 not found'),
      );

      await expect(service.remove('owner-123', 'rule-123')).rejects.toThrow(
        new NotFoundException('Availability rule with ID rule-123 not found'),
      );
    });
  });
}); 