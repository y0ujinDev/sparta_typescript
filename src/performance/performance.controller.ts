import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { JwtService } from '@nestjs/jwt';
import { CreatePerformanceDto } from './dto/create-performance.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/user/types/userRole.type';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('performance')
export class PerformanceController {
  constructor(
    private readonly performanceService: PerformanceService,
    private readonly jwtService: JwtService,
  ) {}

  // 백엔드만 구현할거라 이미지 업로드는 따로 처리 안함.
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post('/')
  async createPerfromance(@Body() createDto: CreatePerformanceDto) {
    const performance = await this.performanceService.create(createDto);

    return {
      message: 'Performance created successfully',
      data: performance,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/')
  async getPerformances(@Query() qeury: any) {
    const performances = await this.performanceService.findAll(qeury);

    return {
      message: 'Performances retrieved successfully',
      data: performances,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/search')
  async searchPerformances(@Query() query: any) {
    return await this.performanceService.search(query);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/:id')
  async getPerformanceById(@Param('id') id: string) {
    const performance = await this.performanceService.findone(+id);

    return {
      message: 'Performance retrieved successfully',
      data: performance,
    };
  }

  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @Delete('/:id')
  async deletePerformance(@Param('id') id: string) {
    const performance = await this.performanceService.delete(+id);

    return {
      message: 'Performance deleted successfully',
      data: performance,
    };
  }
}
