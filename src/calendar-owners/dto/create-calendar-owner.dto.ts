import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';

export class CreateCalendarOwnerDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  timezone?: string;
} 