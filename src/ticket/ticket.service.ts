import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { PerformanceService } from './../performance/performance.service';
import { SeatRole } from './types/seatRole.types';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly performanceSerivce: PerformanceService,
    private readonly jwtService: JwtService,
  ) {}

  async create(createTicketDto: CreateTicketDto) {
    const { performanceId, userId, seatGrade, reservationTime, isCancelled } =
      createTicketDto;

    const performance = await this.performanceSerivce.findById(performanceId);

    if (!performance) {
      throw new NotFoundException('Performance not found');
    }

    const date = new Date();

    if (performance.dateAndTime < date) {
      throw new NotFoundException('Performance is already over');
    }

    await this.ensureSeatAvailability(performanceId, seatGrade);

    await this.performanceSerivce.decreaseSeat(performanceId, seatGrade);

    await this.ticketRepository.save({
      performanceId,
      userId,
      seatGrade,
      reservationTime,
      isCancelled,
    });
  }

  async findAll() {
    return await this.ticketRepository.find({ where: { isCancelled: false } });
  }

  async findById(id: number) {
    return await this.ticketRepository.findOne({
      where: { id, isCancelled: false },
    });
  }

  async cancel(id: number) {
    const ticket = await this.findById(id);

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    ticket.isCancelled = true;

    await this.performanceSerivce.increaseSeat(
      ticket.performanceId,
      ticket.seatGrade,
    );

    await this.ticketRepository.save(ticket);
  }

  async ensureSeatAvailability(performanceId: number, seatGrade: SeatRole) {
    const performance = await this.performanceSerivce.findById(performanceId);

    if (!performance) {
      throw new NotFoundException('Performance not found');
    }

    const existingTickets = await this.ticketRepository.count({
      where: {
        performanceId,
        seatGrade,
      },
    });

    switch (seatGrade) {
      case SeatRole.VIP:
        if (existingTickets >= performance.totalVipSeats) {
          throw new BadRequestException('No more VIP seats available');
        }
        break;
      case SeatRole.S:
        if (existingTickets >= performance.totalSSeats) {
          throw new BadRequestException('No more S seats available');
        }
        break;
      case SeatRole.R:
        if (existingTickets >= performance.totalRSeats) {
          throw new BadRequestException('No more R seats available');
        }
        break;
      default:
        throw new BadRequestException('Invalid seat grade');
    }
  }
}
