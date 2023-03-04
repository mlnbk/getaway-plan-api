import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';

import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../../utils/test.util';

import { Trip, TripSchema } from './schema/trip.schema';

import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';

describe('TripsController', () => {
  let tripsController: TripsController;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([{ name: Trip.name, schema: TripSchema }]),
      ],
      controllers: [TripsController],
      providers: [TripsService, JwtService],
    }).compile();

    tripsController = module.get<TripsController>(TripsController);
  });

  it('should be defined', () => {
    expect(tripsController).toBeDefined();
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });
});
