import { Model, Types } from 'mongoose';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { plainToClass } from 'class-transformer';

import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../../utils/test.util';

import { AuthenticatedRequest, Role } from '../types';
import { CreateTripDto } from './dto/create-trip.dto';
import { TripDto } from './dto/trip.dto';
import { Trip, TripDocument, TripSchema } from './schema/trip.schema';

import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';

describe('TripsController', () => {
  let tripsController: TripsController;
  let tripModel: Model<Trip>;
  let tripsService: TripsService;

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
        JwtService,
      ],
      controllers: [TripsController],
    }).compile();

    tripModel = module.get<Model<TripDocument>>(getModelToken(Trip.name));
    tripsController = module.get<TripsController>(TripsController);
    tripsService = module.get<TripsService>(TripsService);
  });

  describe('createTrip', () => {
    const mockRequest = {
      user: {
        _id: String(new Types.ObjectId()),
        email: 'test@test.com',
        roles: [Role.user],
      },
    };
    const mockCreateTripDto = plainToClass(CreateTripDto, {
      name: 'Test Trip',
      startDate: new Date('2023-03-01T00:00:00.000Z'),
      endDate: new Date('2023-03-07T00:00:00.000Z'),
      destinations: [{ country: 'Test Country' }],
    });

    it('should return the created trip', async () => {
      const mockTripDocument = await tripModel.create({
        name: 'Test Trip',
        startDate: new Date('2023-03-01T00:00:00.000Z'),
        endDate: new Date('2023-03-07T00:00:00.000Z'),
        destinations: [{ country: 'Test Country' }],
        user: mockRequest.user._id,
      });

      const plainTripDocument = plainToClass(
        TripDto,
        mockTripDocument?.toObject(),
        {
          excludeExtraneousValues: true,
        },
      );
      const result = await tripsController.createTrip(
        mockRequest as AuthenticatedRequest,
        mockCreateTripDto,
      );

      expect(result).toEqual(plainTripDocument);
    });
  });

  describe('getTripsForUser', () => {
    const userId = new Types.ObjectId();
    const mockRequest = {
      user: {
        _id: userId.toHexString(),
        email: 'test@test.com',
        roles: [Role.user],
      },
    };

    it('should return an array of trip dtos', async () => {
      const trips = await tripModel.create([
        { user: userId, name: 'Trip 1' },
        { user: userId, name: 'Trip 2' },
        {
          user: new Types.ObjectId().toHexString(),
          name: 'Another User Trip',
        },
      ]);
      const response = await tripsController.getTripsForUser(
        mockRequest as AuthenticatedRequest,
        0, // skip
        100, // limit
        'name',
        true,
      );

      const plainResult = plainToClass(TripDto, response.trips, {
        excludeExtraneousValues: true,
      });
      const plainTrips = plainToClass(TripDto, [trips[0], trips[1]], {
        excludeExtraneousValues: true,
      });

      expect(plainResult).toEqual(plainTrips);
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });
});
