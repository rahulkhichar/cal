import { IsEnum, IsString, IsOptional } from 'class-validator';
import { DayOfWeek } from '../entities/availability-rule.entity';

export class CreateAvailabilityRuleDto {
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsString()
  startTime: string; // Format: HH:MM:SS

  @IsString()
  endTime: string; // Format: HH:MM:SS

  @IsOptional()
  isActive?: boolean;
} 