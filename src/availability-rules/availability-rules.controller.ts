import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AvailabilityRulesService } from './availability-rules.service';
import { CreateAvailabilityRuleDto } from './dto/create-availability-rule.dto';
import { UpdateAvailabilityRuleDto } from './dto/update-availability-rule.dto';

@Controller('calendar-owners/:calendarOwnerId/availability-rules')
export class AvailabilityRulesController {
  constructor(private readonly availabilityRulesService: AvailabilityRulesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('calendarOwnerId') calendarOwnerId: string,
    @Body() createAvailabilityRuleDto: CreateAvailabilityRuleDto,
  ) {
    return await this.availabilityRulesService.create(calendarOwnerId, createAvailabilityRuleDto);
  }

  @Get()
  async findAll(@Param('calendarOwnerId') calendarOwnerId: string) {
    return await this.availabilityRulesService.findAll(calendarOwnerId);
  }

  @Get(':id')
  async findOne(
    @Param('calendarOwnerId') calendarOwnerId: string,
    @Param('id') id: string,
  ) {
    return await this.availabilityRulesService.findOne(calendarOwnerId, id);
  }

  @Patch(':id')
  async update(
    @Param('calendarOwnerId') calendarOwnerId: string,
    @Param('id') id: string,
    @Body() updateAvailabilityRuleDto: UpdateAvailabilityRuleDto,
  ) {
    return await this.availabilityRulesService.update(calendarOwnerId, id, updateAvailabilityRuleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('calendarOwnerId') calendarOwnerId: string,
    @Param('id') id: string,
  ) {
    await this.availabilityRulesService.remove(calendarOwnerId, id);
  }
} 