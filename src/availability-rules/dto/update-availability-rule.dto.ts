import { IsEnum, IsString, IsOptional, IsBoolean } from 'class-validator';
import { DayOfWeek } from '../entities/availability-rule.entity';

export class UpdateAvailabilityRuleDto {
  @IsOptional()
  @IsEnum(DayOfWeek)
  dayOfWeek?: DayOfWeek;

  @IsOptional()
  @IsString()
  startTime?: string; // Format: HH:MM:SS

  @IsOptional()
  @IsString()
  endTime?: string; // Format: HH:MM:SS

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 