import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { CalendarOwner } from '../../calendar-owners/entities/calendar-owner.entity';

export enum DayOfWeek {
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
  SUNDAY = 7,
}

@Entity('availability_rules')
@Index('IDX_AVAILABILITY_RULES_OWNER_DAY', ['calendarOwnerId', 'dayOfWeek'])
export class AvailabilityRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, nullable: false })
  calendarOwnerId: string;

  @Column({ type: 'enum', enum: DayOfWeek, nullable: false })
  dayOfWeek: DayOfWeek;

  @Column({ type: 'time', nullable: false })
  startTime: string; // Format: HH:MM:SS

  @Column({ type: 'time', nullable: false })
  endTime: string; // Format: HH:MM:SS

  @Column({ type: 'boolean' })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => CalendarOwner, (calendarOwner) => calendarOwner.availabilityRules)
  @JoinColumn({ name: 'calendarOwnerId' })
  calendarOwner: CalendarOwner;
} 