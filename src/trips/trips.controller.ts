import { FileInterceptor } from '@nestjs/platform-express';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiConsumes, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { AuthenticatedRequest, validationPipeOptions } from '../types';
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

import { TransformJsonPipe } from 'utils/transform-json.pipe';

import { CacheService } from '../cache/cache.service';
import { TripsService } from './trips.service';

@ApiTags('trips')
@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripsController {
  private readonly logger = new Logger(TripsController.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly tripsService: TripsService,
  ) {}

  @Delete('/:tripId')
  @UsePipes(new ValidationPipe(validationPipeOptions))
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
  @UseInterceptors(FileInterceptor('tripPic'))
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ type: TripDto })
  async createTrip(
    @Request() request: AuthenticatedRequest,
    @Body(
      'tripInfo',
      new TransformJsonPipe(),
      new ValidationPipe(validationPipeOptions),
    )
    tripInfo: CreateTripDto,
    @UploadedFile() tripPic: Express.Multer.File,
  ) {
    const tripDocument = await this.tripsService.createTrip(
      request.user._id,
      tripInfo,
      tripPic,
    );
    if (!tripDocument) {
      throw new BadRequestException(
        `Creating trip failed for user: ${request.user._id}`,
      );
    }
    await this.cacheService.invalidateKeys(`*${request.user._id}*`);
    return plainToClass(TripDto, tripDocument.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  @Get('/my-trips')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe(validationPipeOptions))
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
    const cacheKey = `home:${request.user._id}:skip=${skip}:limit=${limit}`; // NOTE: sorting and filtering params should be added to the key later when the feature is implemented
    const result = await this.cacheService.getItem(cacheKey);
    if (result) {
      return result;
    }

    const tripDocumentsResponse = await this.tripsService.getTripsForUser({
      userId: request.user._id,
      filters,
      skip,
      limit,
    });

    const getTripsResponse = {
      trips: tripDocumentsResponse.trips.map((tripDocument) =>
        plainToClass(TripDto, tripDocument.toObject(), {
          excludeExtraneousValues: true,
        }),
      ),
      total: tripDocumentsResponse.total,
      hasMore: tripDocumentsResponse.hasMore,
    };

    await this.cacheService.setItem(cacheKey, getTripsResponse);
    return getTripsResponse;
  }
}
