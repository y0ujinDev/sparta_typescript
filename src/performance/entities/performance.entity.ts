import { Ticket } from 'src/ticket/entities/ticket.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity({
  name: 'performances',
})
export class Performance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'varchar', nullable: false })
  description: string;

  @Column({ type: 'varchar', nullable: false })
  location: string;

  @Column({ type: 'timestamp', nullable: false })
  dateAndTime: Date;

  @Column({ type: 'int', nullable: false })
  price: number;

  @Column({ type: 'varchar', nullable: false })
  image: string;

  @Column({ type: 'varchar', nullable: false })
  category: string;

  @Column({ type: 'int', default: 20 })
  totalVipSeats: number;

  @Column({ type: 'int', default: 50 })
  totalSSeats: number;

  @Column({ type: 'int', default: 100 })
  totalRSeats: number;

  @OneToMany(() => Ticket, (ticket) => ticket.performance)
  tickets: Ticket[];
}
