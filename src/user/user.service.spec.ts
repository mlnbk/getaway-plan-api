import { Model } from 'mongoose';
import { Test } from '@nestjs/testing';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';

import { Role } from '../types';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../../utils/test.util';

import { User, UserDocument, UserSchema } from './schema/user.schema';
import { UserService } from './user.service';

describe('UserService', () => {
  let userService: UserService;
  let userModel: Model<User>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
      ],
    }).compile();

    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    userService = module.get<UserService>(UserService);
  });

  describe('findOneByEmail', () => {
    it('should return a user with matching email', async () => {
      const mockUser = await userModel.create({
        email: 'test@example.com',
        name: 'John',
        password: 'password',
        roles: [Role.user],
      });

      const foundUser = await userService.findOneByEmail(mockUser.email);
      expect(foundUser?.email).toEqual(mockUser.email);
    });

    it('should return undefined if no user found with matching email', async () => {
      const email = 'nonexisting@example.com';
      const user = await userService.findOneByEmail(email);
      expect(user).toBeNull();
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });
});
