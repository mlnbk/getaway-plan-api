import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { AuthenticatedRequest } from '../types';
import { GetTripsForUserResponse } from './types';
import { CreateTripDto } from './dto/create-trip.dto';
import {
  DeleteTripRequestDto,
  DeleteTripResponseDto,
} from './dto/delete-trip.dto';
import {
  GetTripsForUserDto,
  GetTripsForUserFiltersDto,
} from './dto/get-trips-for-user.dto';
import { TripDto } from './dto/trip.dto';

import { TripsService } from './trips.service';

@ApiTags('trips')
@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Delete('/:tripId')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: DeleteTripResponseDto })
  async deleteTripById(
    @Request() request: AuthenticatedRequest,
    @Param() deleteTripParameter: DeleteTripRequestDto,
  ) {
    const { tripId } = deleteTripParameter;
    const foundTripDocument = await this.tripsService.getTripById(tripId);
    if (!foundTripDocument) {
      throw new NotFoundException(`Trip not found for ID: ${tripId}`);
    }
    if (String(foundTripDocument.user) !== request.user._id) {
      throw new ForbiddenException('Users can only delete their own trips!');
    }
    const deleteTripResult = await this.tripsService.deleteTrip(tripId);
    if (!deleteTripResult.acknowledged || deleteTripResult.deletedCount !== 1) {
      throw new BadRequestException(
        `Deleting trip failed for user: ${request.user._id}, and trip ID: ${tripId}`,
      );
    }
    return { ok: true };
  }

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
  @ApiOkResponse({ type: GetTripsForUserResponse })
  async getTripsForUser(
    @Request() request: AuthenticatedRequest,
    @Query('skip') skip: number,
    @Query('limit') limit: number,
    @Query('sortBy') sortBy: string,
    @Query('asc') asc: boolean,
    @Query('filters') filters?: GetTripsForUserFiltersDto,
  ) {
    const tripDocumentsResponse = await this.tripsService.getTripsForUser({
      userId: request.user._id,
      filters,
      skip,
      limit,
    });

    return {
      trips: tripDocumentsResponse.trips.map((tripDocument) =>
        plainToClass(TripDto, tripDocument.toObject(), {
          excludeExtraneousValues: true,
        }),
      ),
      total: tripDocumentsResponse.total,
      hasMore: tripDocumentsResponse.hasMore,
    };
  }
}
