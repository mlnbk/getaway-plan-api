import { Model } from 'mongoose';
import { Test } from '@nestjs/testing';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';

import { Role } from '../types';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../../utils/test.util';

import { User, UserDocument, UserSchema } from './schema/user.schema';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let usersService: UsersService;
  let userModel: Model<User>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
      ],
    }).compile();

    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    usersService = module.get<UsersService>(UsersService);
  });

  describe('findOneByEmail', () => {
    it('should return a user with matching email', async () => {
      const mockUser = await userModel.create({
        email: 'test@example.com',
        name: 'John',
        password: 'password',
        profilePic: Buffer.from(' '),
        roles: [Role.user],
      });

      const foundUser = await usersService.findOneByEmail(mockUser.email);
      expect(foundUser?.email).toEqual(mockUser.email);
    });

    it('should return undefined if no user found with matching email', async () => {
      const email = 'nonexisting@example.com';
      const user = await usersService.findOneByEmail(email);
      expect(user).toBeNull();
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });
});
