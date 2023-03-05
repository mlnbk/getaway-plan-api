import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Trip, TripSchema } from './schema/trip.schema';

import { TripsService } from './trips.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Trip.name, schema: TripSchema }]),
  ],
  providers: [TripsService],
  exports: [TripsService],
})
export class TripsModule {}
