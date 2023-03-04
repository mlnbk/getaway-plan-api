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
  const tripsService = {
    createTrip: jest.fn(),
  };
  const mockRequest = {
    user: {
      _id: String(new Types.ObjectId()),
      email: 'terst@test.com',
      roles: [Role.user],
    },
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([{ name: Trip.name, schema: TripSchema }]),
      ],
      providers: [
        {
          provide: TripsService,
          useValue: tripsService,
        },
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
  });

  describe('createTrip', () => {
    const mockCreateTripDto = plainToClass(CreateTripDto, {
      name: 'Test Trip',
      startDate: new Date('2023-03-01T00:00:00.000Z'),
      endDate: new Date('2023-03-07T00:00:00.000Z'),
      destinations: [{ country: 'Test Country' }],
    });

    it('should create a trip successfully', async () => {
      const mockTripDto = await tripModel.create({
        name: 'Test Trip',
        startDate: new Date('2023-03-01T00:00:00.000Z'),
        endDate: new Date('2023-03-07T00:00:00.000Z'),
        destinations: [{ country: 'Test Country' }],
        user: mockRequest.user._id,
      });

      tripsService.createTrip.mockResolvedValueOnce(mockTripDto);

      await tripsController.createTrip(
        mockRequest as AuthenticatedRequest,
        mockCreateTripDto,
      );

      expect(tripsService.createTrip).toHaveBeenCalledWith(
        mockRequest.user._id,
        mockCreateTripDto,
      );
    });

    it('should return the created trip', async () => {
      const mockTripDocument = await tripModel.create({
        name: 'Test Trip',
        startDate: new Date('2023-03-01T00:00:00.000Z'),
        endDate: new Date('2023-03-07T00:00:00.000Z'),
        destinations: [{ country: 'Test Country' }],
        user: mockRequest.user._id,
      });

      tripsService.createTrip.mockResolvedValueOnce(mockTripDocument);

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

  afterAll(async () => {
    await closeInMongodConnection();
  });
});
