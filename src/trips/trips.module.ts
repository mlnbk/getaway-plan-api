import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { Trip, TripSchema } from './schema/trip.schema';

import { TripsService } from './trips.service';

import { LocationsModule } from '../locations/locations.module';

@Module({
  imports: [
    ConfigModule,
    LocationsModule,
    MongooseModule.forFeature([{ name: Trip.name, schema: TripSchema }]),
  ],
  providers: [TripsService],
  exports: [TripsService],
})
export class TripsModule {}
