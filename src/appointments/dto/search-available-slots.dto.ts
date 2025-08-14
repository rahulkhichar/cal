import { IsDateString, IsString } from 'class-validator';

export class SearchAvailableSlotsDto {
  @IsDateString()
  date: string; // ISO date string (YYYY-MM-DD)

  @IsString()
  calendarOwnerId: string;
} 