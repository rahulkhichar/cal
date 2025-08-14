import { IsString, IsEmail, IsDateString, IsOptional } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  inviteeName: string;

  @IsEmail()
  inviteeEmail: string;

  @IsDateString()
  startTime: string; // ISO date string

  @IsOptional()
  @IsString()
  notes?: string;
} 