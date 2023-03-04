import { Test } from '@nestjs/testing';
import { Model } from 'mongoose';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';

import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../../utils/test.util';

import { Trip, TripDocument, TripSchema } from './schema/trip.schema';

import { TripsService } from './trips.service';

describe('TripsService', () => {
  let tripsService: TripsService;
  let tripModel: Model<Trip>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([{ name: Trip.name, schema: TripSchema }]),
      ],
      providers: [
        TripsService,
        {
          provide: getModelToken(Trip.name),
          useValue: tripModel,
        },
      ],
    }).compile();

    tripModel = module.get<Model<TripDocument>>(getModelToken(Trip.name));
    tripsService = module.get<TripsService>(TripsService);
  });

  it('should be defined', () => {
    expect(tripsService).toBeDefined();
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });
});
