import { Test } from '@nestjs/testing';
import mongoose, { Model, Types } from 'mongoose';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { plainToClass } from 'class-transformer';
import * as dayjs from 'dayjs';

import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../../utils/test.util';

import { CreateTripDto } from './dto/create-trip.dto';
import { TripDto } from './dto/trip.dto';
import { Trip, TripDocument, TripSchema } from './schema/trip.schema';

import { GetTripFilter } from './types';
import { TripsService } from './trips.service';
import { TripStatus } from '../types';

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

  describe('getTripsForUser', () => {
    it('should return trips for a user without any filters', async () => {
      const userId = new Types.ObjectId().toHexString();
      const trips = await tripModel.create([
        { user: new Types.ObjectId(userId), name: 'Trip 0' },
        { user: new Types.ObjectId(userId), name: 'Trip 01' },
        {
          user: new Types.ObjectId().toHexString(),
          name: 'Another User Trip',
        },
      ]);

      const result = await tripsService.getTripsForUser({
        userId,
        skip: 0,
        limit: 10,
        sortBy: 'name',
        asc: true,
      });

      const plainResult = plainToClass(TripDto, result.trips, {
        excludeExtraneousValues: true,
      });
      const plainTrips = plainToClass(TripDto, [trips[0], trips[1]], {
        excludeExtraneousValues: true,
      });

      expect(result.total).toEqual(2);
      expect(result.hasMore).toBeFalsy();
      expect(plainResult).toEqual(plainTrips);
    });

    it('should return trips for a user with filters', async () => {
      const userId = new Types.ObjectId();
      const invitedUserId = new Types.ObjectId();
      const filters: GetTripFilter = {
        destinations: [
          { country: 'France', city: 'Paris' },
          { country: 'Germany', city: 'Berlin' },
        ],
        invitedUsers: [invitedUserId.toHexString()],
        status: [TripStatus.current, TripStatus.upcoming],
      };
      const trips = await tripModel.create([
        {
          user: userId,
          name: 'Trip 1',
          destinations: [{ country: 'France', city: 'Paris' }],
          endDate: dayjs().subtract(1, 'day'),
        },
        {
          user: userId,
          name: 'Trip 2',
          destinations: [{ country: 'Germany', city: 'Berlin' }],
          startDate: dayjs().subtract(1, 'day'),
          endDate: dayjs().add(1, 'day'),
        },
        {
          user: userId,
          name: 'Trip 3',
          destinations: [{ country: 'Germany', city: 'Berlin' }],
          startDate: dayjs().add(1, 'day'),
        },
        {
          user: userId,
          name: 'Trip 4',
          destinations: [{ country: 'Norwegia', city: 'Oslo' }],
          invitedUsers: [invitedUserId],
        },
        {
          user: userId,
          name: 'Trip 5',
          destinations: [{ country: 'Finland', city: 'Helsinki' }],
        },
        {
          user: new Types.ObjectId().toHexString(),
          name: 'Another User Trip',
          destinations: [{ country: 'France', city: 'Paris' }],
        },
      ]);

      const result = await tripsService.getTripsForUser({
        userId: userId.toHexString(),
        filters,
        skip: 0,
        limit: 10,
        sortBy: 'name',
        asc: true,
      });

      const plainResult = plainToClass(TripDto, result.trips, {
        excludeExtraneousValues: true,
      });
      const plainTrips = plainToClass(
        TripDto,
        [trips[0], trips[1], trips[2], trips[3]],
        {
          excludeExtraneousValues: true,
        },
      );

      expect(result.total).toBe(4);
      expect(result.hasMore).toBe(false);
      expect(plainResult).toEqual(plainTrips);
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });
});
