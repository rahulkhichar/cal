import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { CalendarOwner } from '../calendar-owners/entities/calendar-owner.entity';
import { AvailabilityRule } from '../availability-rules/entities/availability-rule.entity';
import { Appointment } from '../appointments/entities/appointment.entity';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 3306),
  username: configService.get<string>('DB_USERNAME', 'root'),
  password: configService.get<string>('DB_PASSWORD', 'password'),
  database: configService.get<string>('DB_DATABASE', 'cal_db'),
  entities: [CalendarOwner, AvailabilityRule, Appointment],
  synchronize: false, // Disable synchronize to avoid conflicts, use migrations instead
  logging: configService.get<string>('NODE_ENV') !== 'production',
  autoLoadEntities: true,
  charset: 'utf8mb4',
  timezone: 'Z',
}); 