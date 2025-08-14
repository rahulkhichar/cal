import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { AvailabilityRule } from '../../availability-rules/entities/availability-rule.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';

@Entity('calendar_owners')
@Index('IDX_CALENDAR_OWNERS_EMAIL', ['email'], { unique: true })
export class CalendarOwner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  firstName: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  lastName: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false, select: false })
  password: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  timezone: string;

  @Column({ type: 'boolean' })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => AvailabilityRule, (availabilityRule) => availabilityRule.calendarOwner)
  availabilityRules: AvailabilityRule[];

  @OneToMany(() => Appointment, (appointment) => appointment.calendarOwner)
  appointments: Appointment[];
} 