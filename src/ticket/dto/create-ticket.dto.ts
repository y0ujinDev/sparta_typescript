import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';
import { SeatRole } from '../types/seatRole.types';

export class CreateTicketDto {
  @IsNumber()
  @IsNotEmpty({ message: 'User ID is required' })
  userId: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Performance ID is required' })
  performanceId: number;

  @IsEnum(SeatRole)
  @IsNotEmpty({ message: 'Seat ID is required' })
  seatGrade: SeatRole;

  @IsDate()
  @IsNotEmpty({ message: 'Reservation time is required' })
  reservationTime: Date;

  @IsBoolean()
  isCancelled: boolean;
}
