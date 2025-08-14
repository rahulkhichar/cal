import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AvailabilityRule } from './entities/availability-rule.entity';
import { CreateAvailabilityRuleDto } from './dto/create-availability-rule.dto';
import { UpdateAvailabilityRuleDto } from './dto/update-availability-rule.dto';

@Injectable()
export class AvailabilityRulesService {
  constructor(
    @InjectRepository(AvailabilityRule)
    private readonly availabilityRuleRepository: Repository<AvailabilityRule>,
  ) {}

  async create(
    calendarOwnerId: string,
    createAvailabilityRuleDto: CreateAvailabilityRuleDto,
  ): Promise<AvailabilityRule> {
    // Check if rule already exists for this day
    const existingRule = await this.availabilityRuleRepository.findOne({
      where: {
        calendarOwnerId,
        dayOfWeek: createAvailabilityRuleDto.dayOfWeek,
      },
    });

    if (existingRule) {
      throw new ConflictException(`Availability rule for day ${createAvailabilityRuleDto.dayOfWeek} already exists`);
    }

    const availabilityRule =  this.availabilityRuleRepository.create({
      ...createAvailabilityRuleDto,
      calendarOwnerId,
      isActive: createAvailabilityRuleDto.isActive !== undefined ? createAvailabilityRuleDto.isActive : true,
    });

    return await this.availabilityRuleRepository.save(availabilityRule);
  }

  async findAll(calendarOwnerId: string): Promise<AvailabilityRule[]> {
    return await this.availabilityRuleRepository.find({
      where: { calendarOwnerId },
      order: { dayOfWeek: 'ASC' },
    });
  }

  async findOne(calendarOwnerId: string, ruleId: string): Promise<AvailabilityRule> {
    const availabilityRule = await this.availabilityRuleRepository.findOne({
      where: { id: ruleId, calendarOwnerId },
    });

    if (!availabilityRule) {
      throw new NotFoundException(`Availability rule with ID ${ruleId} not found`);
    }

    return availabilityRule;
  }

  async update(
    calendarOwnerId: string,
    ruleId: string,
    updateAvailabilityRuleDto: UpdateAvailabilityRuleDto,
  ): Promise<AvailabilityRule> {
    const availabilityRule = await this.findOne(calendarOwnerId, ruleId);

    Object.assign(availabilityRule, updateAvailabilityRuleDto);
    return await this.availabilityRuleRepository.save(availabilityRule);
  }

  async remove(calendarOwnerId: string, ruleId: string): Promise<void> {
    const availabilityRule = await this.findOne(calendarOwnerId, ruleId);
    await this.availabilityRuleRepository.remove(availabilityRule);
  }
} 