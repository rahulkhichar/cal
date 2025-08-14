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

export enum AppointmentStatus {
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  PENDING = 'pending',
}

@Entity('appointments')
@Index('IDX_APPOINTMENTS_OWNER_TIME', ['calendarOwnerId', 'startTime'])
@Index('IDX_APPOINTMENTS_INVITEE_TIME', ['inviteeEmail', 'startTime'])
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, nullable: false })
  calendarOwnerId: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  inviteeName: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  inviteeEmail: string;

  @Column({ type: 'datetime', nullable: false })
  startTime: Date;

  @Column({ type: 'datetime', nullable: false })
  endTime: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  notes: string;

  @Column({ 
    type: 'enum', 
    enum: AppointmentStatus
  })
  status: AppointmentStatus;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => CalendarOwner, (calendarOwner) => calendarOwner.appointments)
  @JoinColumn({ name: 'calendarOwnerId' })
  calendarOwner: CalendarOwner;
} 