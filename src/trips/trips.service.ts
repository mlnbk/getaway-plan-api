import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { DeleteResult } from 'mongodb';

import { CreateTripDto } from './dto/create-trip.dto';
import { GetTripsForUserParameters, GetTripsForUserResponse } from './types';
import { Trip, TripDocument } from './schema/trip.schema';
import { TripStatus } from '../types';

@Injectable()
export class TripsService {
  constructor(@InjectModel(Trip.name) private tripModel: Model<TripDocument>) {}

  async createTrip(
    userId: string,
    trip: CreateTripDto,
  ): Promise<TripDocument | null> {
    return this.tripModel.create({
      ...trip,
      user: new Types.ObjectId(userId),
    });
  }

  async deleteTrip(tripId: string): Promise<DeleteResult> {
    return this.tripModel.deleteOne({ _id: new Types.ObjectId(tripId) });
  }

  async getTripById(tripId: string): Promise<TripDocument | null> {
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

    // eslint-disable-next-line unicorn/no-array-callback-reference
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
