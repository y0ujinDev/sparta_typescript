import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { UserInfo } from 'src/auth/userInfo.decorater';
import { User } from 'src/user/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('/:id')
  async create(
    @UserInfo() user: User,
    @Param('id') performanceId: string,
    @Body() createTicketDto: CreateTicketDto,
  ) {
    createTicketDto.userId = user.id;
    const ticket = await this.ticketService.create(createTicketDto);

    return {
      message: 'Ticket created successfully',
      data: ticket,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/')
  async findAll(@UserInfo() user: User) {
    const tickets = await this.ticketService.findAll(user);

    return {
      message: 'Tickets retrieved successfully',
      data: tickets,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const ticket = await this.ticketService.findById(+id);

    return {
      message: 'Ticket retrieved successfully',
      data: ticket,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async cancel(@Param('id') id: string, @UserInfo() user: User) {
    const ticket = await this.ticketService.cancel(+id, user);

    return {
      message: 'Ticket cancelled successfully',
      data: ticket,
    };
  }
}
