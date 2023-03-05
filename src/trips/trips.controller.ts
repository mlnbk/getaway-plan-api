import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { AuthenticatedRequest } from '../types';
import { CreateTripDto } from './dto/create-trip.dto';
import { GetTripsForUserDto } from './dto/get-trips-for-user.dto';
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
    const tripDocument = await this.tripsService.createTrip(
      request.user._id,
      createTripDto,
    );
    if (!tripDocument) {
      throw new BadRequestException(
        `Creating trip failed for user: ${request.user._id}`,
      );
    }
    return plainToClass(TripDto, tripDocument.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  @Get('/my-trips')
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ type: GetTripsForUserDto })
  @ApiOkResponse({ type: [TripDto] })
  async getTripsForUser(
    @Request() request: AuthenticatedRequest,
    @Query() getTripsForUserDto?: GetTripsForUserDto,
  ) {
    const tripDocuments = await this.tripsService.getTripsForUser({
      userId: request.user._id,
      filters: getTripsForUserDto,
    });

    return tripDocuments.map((tripDocument) =>
      plainToClass(TripDto, tripDocument.toObject(), {
        excludeExtraneousValues: true,
      }),
    );
  }
}
