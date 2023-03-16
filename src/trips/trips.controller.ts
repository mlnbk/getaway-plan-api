import { FileInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';
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
import { ConfigService } from '@nestjs/config';
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
import { GetTripRequestDto } from './dto/get-trip.dto';
import { TripsForUserDto } from './dto/trips-for-user.dto';
import { TripDto } from './dto/trip.dto';
import { User } from '../users/schema/user.schema';

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
    private readonly configServie: ConfigService,
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
    await this.cacheService.invalidateKeys(`*${request.user._id}*`);
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
    @UploadedFile() tripPic?: Express.Multer.File,
  ) {
    if (tripPic) {
      const maxAllowedFileSize =
        this.configServie.get<number>('maxAllowedFileSize') ?? 0;
      const { mimetype, size } = tripPic;
      if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
        throw new BadRequestException(
          'The uploaded file does not have the expected format.',
        );
      } else if (size > maxAllowedFileSize) {
        throw new BadRequestException(
          `The uploaded file's size exceeds the allowed filesize.`,
        );
      }
    }
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
        plainToClass(TripsForUserDto, tripDocument.toObject(), {
          excludeExtraneousValues: true,
        }),
      ),
      total: tripDocumentsResponse.total,
      hasMore: tripDocumentsResponse.hasMore,
    };

    await this.cacheService.setItem(cacheKey, getTripsResponse);
    return getTripsResponse;
  }

  @Get('/:tripId')
  @UsePipes(new ValidationPipe(validationPipeOptions))
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: TripDto })
  async getTripById(
    @Request() request: AuthenticatedRequest,
    @Param() getTripParameter: GetTripRequestDto,
  ) {
    const { tripId } = getTripParameter;
    const foundTripDocument = await this.tripsService.getTripById(tripId);
    if (!foundTripDocument) {
      throw new NotFoundException(`Trip not found for ID: ${tripId}`);
    }
    const canGetTrip =
      String(foundTripDocument.user) === request.user._id ||
      foundTripDocument.invitedUsers?.includes(
        new Types.ObjectId(request.user._id) as unknown as User,
      );
    if (!canGetTrip) {
      throw new ForbiddenException('Users can only see their own trips!');
    }
    return plainToClass(TripDto, foundTripDocument.toObject(), {
      excludeExtraneousValues: true,
    });
  }
}
