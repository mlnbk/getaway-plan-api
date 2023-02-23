import { Model } from 'mongoose';
import { Test } from '@nestjs/testing';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';

import { AuthenticatedRequest, AuthenticatedUser, Role } from '../types';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../../utils/test.util';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserController } from './user.controller';
import { User, UserDocument, UserSchema } from './schema/user.schema';

describe('UserController', () => {
  let controller: UserController;
  let userModel: Model<User>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      controllers: [UserController],
      providers: [
        {
          provide: JwtAuthGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
      ],
    }).compile();

    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    controller = module.get<UserController>(UserController);
  });

  describe('getProfile', () => {
    it('should return the authenticated user', async () => {
      const mockUser = await userModel.create({
        email: 'test@example.com',
        name: 'John',
        password: 'password',
        roles: [Role.user],
      });

      const requestUser: AuthenticatedUser = {
        _id: String(mockUser._id),
        email: mockUser.email,
        roles: mockUser.roles,
      };

      const request = {
        user: requestUser,
      } as unknown as AuthenticatedRequest;
      const result = controller.getProfile(request);

      expect(result).toEqual(requestUser);
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });
});
