import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import { CreateTripDto } from './dto/create-trip.dto';
import { GetTripsForUserParameters } from './types';
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

  async getTripsForUser({
    userId,
    filters,
  }: GetTripsForUserParameters): Promise<TripDocument[]> {
    const query: FilterQuery<TripDocument> = {
      user: new Types.ObjectId(userId),
    };

    if (filters) {
      const { destinations, invitedUsers, status } = filters;
      if (destinations) {
        query.destinations = destinations;
      }
      if (invitedUsers) {
        query.invitedUsers = invitedUsers.map(
          (invitedUserId) => new Types.ObjectId(invitedUserId),
        );
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

        query.$or = statusQueries;
      }
    }
    // eslint-disable-next-line unicorn/no-array-callback-reference
    return this.tripModel.find(query);
  }
}
