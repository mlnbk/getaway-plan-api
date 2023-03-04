import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateTripDto } from './dto/create-trip.dto';
import { Trip, TripDocument } from './schema/trip.schema';

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
}
