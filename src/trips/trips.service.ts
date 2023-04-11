import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import { GetTripsForUserParameters, GetTripsForUserResponse } from './types';
import { TripStatus } from '../types';
import { CreateTripDto } from './dto/create-trip.dto';
import { Trip, TripDocument } from './schema/trip.schema';

import { S3Util } from 'utils/s3.util';

@Injectable()
export class TripsService {
  s3Util: S3Util;
  constructor(
    @InjectModel(Trip.name) private readonly tripModel: Model<TripDocument>,
    private readonly configService: ConfigService,
  ) {
    this.s3Util = new S3Util();
  }

  async createTrip(
    userId: string,
    trip: CreateTripDto,
    tripPic?: Express.Multer.File | string,
  ) {
    const createParameters: any = {
      ...trip,
      user: new Types.ObjectId(userId),
    };
    if (tripPic) {
      createParameters.pictures = [];
      if (typeof tripPic === 'string') {
        createParameters.pictures.push(tripPic);
      } else {
        const uploadResult = await this.s3Util.upload({
          Bucket: this.configService.get('S3_PICTURES_BUCKET') ?? '',
          file: tripPic,
        });
        if (uploadResult) {
          createParameters.pictures.push(uploadResult);
        }
      }
    }

    return this.tripModel.create(createParameters);
  }

  async deleteTrip(tripId: string) {
    return this.tripModel.deleteOne({ _id: new Types.ObjectId(tripId) });
  }

  async getTripById(tripId: string) {
    return this.tripModel.findById(new Types.ObjectId(tripId));
  }

  async getTripsForUser({
    userId,
    filters,
    skip,
    limit,
    sortBy,
    asc,
  }: GetTripsForUserParameters): Promise<GetTripsForUserResponse> {
    const query: FilterQuery<TripDocument> = {
      user: new Types.ObjectId(userId),
      $or: [],
    };

    if (filters) {
      const { destinations, invitedUsers, status } = filters;
      const queries: Record<string, unknown>[] = [];
      if (destinations) {
        queries.push({ destinations: { $in: destinations } });
      }
      if (invitedUsers) {
        queries.push({
          invitedUsers: invitedUsers.map(
            (invitedUserId) => new Types.ObjectId(invitedUserId),
          ),
        });
      }
      if (queries.length > 0) {
        query.$or?.push({ $or: queries });
      } else {
        delete query.$or;
      }

      if (status?.length) {
        const currentDate = new Date();
        const statusQueries: Record<string, unknown>[] = [];

        if (status.includes(TripStatus.past)) {
          statusQueries.push({ endDate: { $lt: currentDate } });
        }

        if (status.includes(TripStatus.current)) {
          statusQueries.push({
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate },
          });
        }

        if (status.includes(TripStatus.upcoming)) {
          statusQueries.push({ startDate: { $gt: currentDate } });
        }

        if (statusQueries.length > 0) {
          query.$or?.push({ $or: statusQueries });
        }
      }
    }

    const trips = await this.tripModel.find(
      query,
      {},
      { skip, limit, sort: { [sortBy ?? 'createdAt']: asc ? 'asc' : 'desc' } },
    );
    const total = await this.tripModel.countDocuments(query);

    const hasMore = total > skip + limit ? true : false;
    return { total, trips, hasMore };
  }
}
