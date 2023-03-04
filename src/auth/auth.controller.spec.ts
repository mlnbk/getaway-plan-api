import { Model } from 'mongoose';
import { Test } from '@nestjs/testing';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';

import { RequestWithUser, Role } from '../types';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../../utils/test.util';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User, UserDocument, UserSchema } from '../users/schema/user.schema';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let userModel: Model<User>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      controllers: [AuthController],
      providers: [AuthService, JwtService, UsersService],
    }).compile();

    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return a JWT token for a valid user', async () => {
      const mockUser = await userModel.create({
        email: 'test@example.com',
        name: 'John',
        password: 'password',
        profilePic: Buffer.from(' '),
        roles: [Role.user],
      });
      const tokenResp = { access_token: 'token' };

      jest.spyOn(authService, 'login').mockImplementation((user) => tokenResp);

      const loginRequest = { user: mockUser } as unknown as RequestWithUser;
      const result = await authController.login(loginRequest);

      expect(result).toBe(tokenResp);
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });
});
