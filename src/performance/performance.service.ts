import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePerformanceDto } from './dto/create-performance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, ILike, In, LessThan, MoreThan, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Performance } from './entities/performance.entity';
import { SeatRole } from 'src/ticket/types/seatRole.types';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectRepository(Performance)
    private readonly performanceRepository: Repository<Performance>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createDto: CreatePerformanceDto) {
    const {
      title,
      description,
      location,
      dateAndTime,
      vipPrice,
      sSeatPrice,
      rSeatPrice,
      image,
      category,
    } = createDto;
    const existingPerformance = await this.performanceRepository.findOneBy({
      title,
      location,
      dateAndTime: In(dateAndTime),
    });

    if (existingPerformance) {
      throw new ConflictException('Performance already exists');
    }

    const savePerformance = await this.performanceRepository.save({
      title,
      description,
      location,
      dateAndTime,
      vipPrice,
      sSeatPrice,
      rSeatPrice,
      image,
      category,
    });

    return savePerformance;
  }

  async findAll(query: any) {
    if (query.title) {
      return await this.performanceRepository.find({
        where: {
          title: ILike(`%${query.title}%`),
        },
      });
    }

    return await this.performanceRepository.find();
  }

  async search(query: any) {
    const where = {};
    console.log(query);

    if (query.title) {
      where['title'] = ILike(`%${query.title}%`);
    }
    if (query.category) {
      where['category'] = ILike(`%${query.category}%`);
    }
    if (query.location) {
      where['location'] = ILike(`%${query.location}%`);
    }
    if (query.startDate && query.endDate) {
      where['dateAndTime'] = Between(query.startDate, query.endDate);
    } else {
      if (query.startDate) {
        where['dateAndTime'] = MoreThan(query.startDate);
      }
      if (query.endDate) {
        where['dateAndTime'] = LessThan(query.endDate);
      }
    }

    return await this.performanceRepository.find({ where });
  }

  async findone(id: number) {
    const performance = await this.findById(id);

    if (!performance) {
      throw new NotFoundException('Performance not found');
    }

    const isBookable = performance.dateAndTime > new Date();

    return { ...performance, isBookable };
  }

  async findById(id: number) {
    return await this.performanceRepository.findOneBy({ id });
  }

  // async decreaseSeat(performanceId: number, grade: SeatRole) {
  //   const performance = await this.findById(performanceId);
  //   switch (grade) {
  //     case SeatRole.VIP:
  //       performance.totalVipSeats--;
  //       break;
  //     case SeatRole.S:
  //       performance.totalSSeats--;
  //       break;
  //     case SeatRole.R:
  //       performance.totalRSeats--;
  //       break;
  //   }
  //   await this.performanceRepository.save(performance);
  // }

  // async increaseSeat(performanceId: number, grade: SeatRole) {
  //   const performance = await this.findById(performanceId);
  //   switch (grade) {
  //     case SeatRole.VIP:
  //       performance.totalVipSeats++;
  //       break;
  //     case SeatRole.S:
  //       performance.totalSSeats++;
  //       break;
  //     case SeatRole.R:
  //       performance.totalRSeats++;
  //       break;
  //   }
  //   await this.performanceRepository.save(performance);
  // }

  async updateSeat(performanceId: number, grade: SeatRole, increase: boolean) {
    const performance = await this.findone(performanceId);
    const seatSelector = {
      [SeatRole.VIP]: 'totalVipSeats',
      [SeatRole.S]: 'totalSSeats',
      [SeatRole.R]: 'totalRSeats',
    };

    performance[seatSelector[grade]] += increase ? 1 : -1;
    await this.performanceRepository.save(performance);
  }

  async getPrice(performanceId: number, grade: SeatRole) {
    const performance = await this.findone(performanceId);
    const priceSelector = {
      [SeatRole.VIP]: 'vipPrice',
      [SeatRole.S]: 'sSeatPrice',
      [SeatRole.R]: 'rSeatPrice',
    };

    return performance[priceSelector[grade]];
  }
}
