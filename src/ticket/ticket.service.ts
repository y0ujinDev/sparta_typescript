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
import { UserService } from './../user/user.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly performanceSerivce: PerformanceService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async create(createTicketDto: CreateTicketDto) {
    const { performanceId, userId, seatGrade, reservationTime, isCancelled } =
      createTicketDto;

    const performance = await this.findPerformanceById(performanceId);

    const date = new Date();

    if (performance.dateAndTime < date) {
      throw new NotFoundException('Performance is already over');
    }

    await this.ensureSeatAvailability(performanceId, seatGrade);

    await this.performanceSerivce.updateSeat(performanceId, seatGrade, true);

    const price = await this.performanceSerivce.getPrice(
      performanceId,
      seatGrade,
    );

    const user = await this.userService.findById(userId);

    if (user.point < price) {
      throw new BadRequestException('Not enough points');
    }

    await this.userService.decreasePoint(userId, price);

    const newTicket = await this.ticketRepository.save({
      performanceId,
      userId,
      seatGrade,
      reservationTime,
      isCancelled,
    });

    return newTicket;
  }

  async findAll(user: User) {
    return await this.ticketRepository.find({
      where: {
        userId: user.id,
      },
    });
  }

  async findById(id: number) {
    return await this.ticketRepository.findOne({
      where: { id },
    });
  }

  async cancel(id: number, user: User) {
    const ticket = await this.ticketRepository.findOne({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found or not authorized');
    }

    if (ticket.isCancelled) {
      throw new BadRequestException('Ticket already cancelled');
    }

    ticket.isCancelled = true;

    await this.performanceSerivce.updateSeat(
      ticket.performanceId,
      ticket.seatGrade,
      false,
    );

    const cancelledTicket = await this.ticketRepository.save(ticket);

    return cancelledTicket;
  }

  async ensureSeatAvailability(performanceId: number, seatGrade: SeatRole) {
    const performance = await this.findPerformanceById(performanceId);

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

  async findPerformanceById(id: number) {
    return await this.performanceSerivce.findById(id);
  }
}
