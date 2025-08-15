import { Test, TestingModule } from '@nestjs/testing';
import { CreateAvailabilityRuleDto } from '../dto/create-availability-rule.dto';
import { UpdateAvailabilityRuleDto } from '../dto/update-availability-rule.dto';
import { AvailabilityRule, DayOfWeek } from '../entities/availability-rule.entity';
import { HttpStatus } from '@nestjs/common';
import { AvailabilityRulesController } from './availability-rules.controller';
import { AvailabilityRulesService } from '../service/availability-rules.service';

describe('AvailabilityRulesController', () => {
  let controller: AvailabilityRulesController;
  let service: AvailabilityRulesService;

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

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvailabilityRulesController],
      providers: [
        {
          provide: AvailabilityRulesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AvailabilityRulesController>(AvailabilityRulesController);
    service = module.get<AvailabilityRulesService>(AvailabilityRulesService);
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

    it('should create a new availability rule', async () => {
      mockService.create.mockResolvedValue(mockAvailabilityRule);

      const result = await controller.create('owner-123', createDto);

      expect(service.create).toHaveBeenCalledWith('owner-123', createDto);
      expect(result).toEqual(mockAvailabilityRule);
    });

    it('should return 201 status code', async () => {
      const createMethod = AvailabilityRulesController.prototype.create;
      const decorators = Reflect.getMetadata('__httpCode__', createMethod);
      
      expect(decorators).toBe(HttpStatus.CREATED);
    });
  });

  describe('findAll', () => {
    it('should return all availability rules for a calendar owner', async () => {
      const mockRules = [mockAvailabilityRule];
      mockService.findAll.mockResolvedValue(mockRules);

      const result = await controller.findAll('owner-123');

      expect(service.findAll).toHaveBeenCalledWith('owner-123');
      expect(result).toEqual(mockRules);
    });

    it('should return empty array when no rules exist', async () => {
      mockService.findAll.mockResolvedValue([]);

      const result = await controller.findAll('owner-123');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a specific availability rule', async () => {
      mockService.findOne.mockResolvedValue(mockAvailabilityRule);

      const result = await controller.findOne('owner-123', 'rule-123');

      expect(service.findOne).toHaveBeenCalledWith('owner-123', 'rule-123');
      expect(result).toEqual(mockAvailabilityRule);
    });
  });

  describe('update', () => {
    const updateDto: UpdateAvailabilityRuleDto = {
      startTime: '10:00:00',
      endTime: '18:00:00',
    };

    it('should update an availability rule', async () => {
      const updatedRule = { ...mockAvailabilityRule, ...updateDto };
      mockService.update.mockResolvedValue(updatedRule);

      const result = await controller.update('owner-123', 'rule-123', updateDto);

      expect(service.update).toHaveBeenCalledWith('owner-123', 'rule-123', updateDto);
      expect(result).toEqual(updatedRule);
    });
  });

  describe('remove', () => {
    it('should remove an availability rule', async () => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove('owner-123', 'rule-123');

      expect(service.remove).toHaveBeenCalledWith('owner-123', 'rule-123');
    });

    it('should return 204 status code', async () => {
      const removeMethod = AvailabilityRulesController.prototype.remove;
      const decorators = Reflect.getMetadata('__httpCode__', removeMethod);
      
      expect(decorators).toBe(HttpStatus.NO_CONTENT);
    });
  });


}); 