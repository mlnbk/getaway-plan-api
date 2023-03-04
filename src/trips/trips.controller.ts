import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { AuthenticatedRequest } from '../types';
import { CreateTripDto } from './dto/create-trip.dto';
import { TripDto } from './dto/trip.dto';

import { TripsService } from './trips.service';

@ApiTags('trips')
@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post('/add')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: CreateTripDto })
  @ApiOkResponse({ type: TripDto })
  async createTrip(
    @Request() request: AuthenticatedRequest,
    @Body() createTripDto: CreateTripDto,
  ) {
    await this.tripsService.createTrip(request.user._id, createTripDto);
  }
}
