import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  async create(@Body() createTicketDto: CreateTicketDto) {
    const ticket = await this.ticketService.create(createTicketDto);

    return {
      message: 'Ticket created successfully',
      data: ticket,
    };
  }

  @Get()
  async findAll() {
    const tickets = await this.ticketService.findAll();

    return {
      message: 'Tickets retrieved successfully',
      data: tickets,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const ticket = await this.ticketService.findById(+id);

    return {
      message: 'Ticket retrieved successfully',
      data: ticket,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const ticket = await this.ticketService.cancel(+id);

    return {
      message: 'Ticket cancelled successfully',
      data: ticket,
    };
  }
}
