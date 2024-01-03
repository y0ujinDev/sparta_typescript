import { Performance } from 'src/performance/entities/performance.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SeatRole } from '../types/seatRole.types';

@Entity({
  name: 'ticket',
})
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'int', nullable: false })
  performanceId: number;

  @Column({ type: 'enum', enum: SeatRole, nullable: false })
  seatGrade: SeatRole;

  @Column({ type: 'timestamp', nullable: false })
  reservationTime: Date;

  @Column({ type: 'boolean', default: false })
  isCancelled: boolean;

  @ManyToOne(() => Performance, (performance) => performance)
  @JoinColumn({ name: 'performanceId' })
  performance: Performance;
}
