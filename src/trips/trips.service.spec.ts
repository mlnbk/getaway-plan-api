import { Test } from '@nestjs/testing';
import { Model, Types } from 'mongoose';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { plainToClass } from 'class-transformer';

import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../../utils/test.util';

import { CreateTripDto } from './dto/create-trip.dto';
import { TripDto } from './dto/trip.dto';
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

  describe('createTrip', () => {
    const mockUserId = String(new Types.ObjectId());
    const mockTripId = new Types.ObjectId();
    const mockCreateTripDto = plainToClass(CreateTripDto, {
      name: 'Test Trip',
      startDate: new Date('2023-03-01T00:00:00.000Z'),
      endDate: new Date('2023-03-07T00:00:00.000Z'),
      destinations: [{ country: 'Test Country' }],
    });

    it('should create a new trip document with the given user ID and return it', async () => {
      const mockTripDocument = await tripModel.create({
        _id: mockTripId,
        name: 'Test Trip',
        startDate: new Date('2023-03-01T00:00:00.000Z'),
        endDate: new Date('2023-03-07T00:00:00.000Z'),
        destinations: [{ country: 'Test Country' }],
        user: mockUserId,
      });

      const result = await tripsService.createTrip(
        mockUserId,
        mockCreateTripDto,
      );

      const plainTripDocument = plainToClass(
        TripDto,
        mockTripDocument?.toObject(),
        {
          excludeExtraneousValues: true,
        },
      );
      const plainResult = plainToClass(TripDto, result?.toObject(), {
        excludeExtraneousValues: true,
      });

      expect(plainResult).toEqual(plainTripDocument);
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });
});
