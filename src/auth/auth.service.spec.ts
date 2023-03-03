import { Model } from 'mongoose';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { omit } from 'lodash';

import { Role } from '../types';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../../utils/test.util';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User, UserDocument, UserSchema } from '../users/schema/user.schema';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let usersService: UsersService;
  let userModel: Model<User>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const mockUser = await userModel.create({
        email: 'test@example.com',
        name: 'John',
        password: 'password',
        profilePic: Buffer.from(' '),
        roles: [Role.user],
      });
      const expectedPayload = {
        sub: String(mockUser._id),
        email: mockUser.email.toLowerCase(),
        roles: mockUser.roles,
      };
      const expectedToken = 'mockToken';

      jest.spyOn(jwtService, 'sign').mockReturnValue(expectedToken);

      const result = await authService.login(mockUser);

      expect(jwtService.sign).toHaveBeenCalledWith(expectedPayload);
      expect(result.access_token).toEqual(expectedToken);
    });
  });

  describe('validateUser', () => {
    it('should return user if email and password are valid', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      const mockUser = await userModel.create({
        email,
        name: 'John',
        password: hashedPassword,
        profilePic: Buffer.from(' '),
        roles: [Role.user],
      });

      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(mockUser);

      const result = await authService.validateUser(email, password);

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(
        expect.objectContaining(omit(mockUser, 'password')),
      );
    });

    it('should throw UnauthorizedException if email is not found', async () => {
      const email = 'test@example.com';
      const password = 'password';

      // eslint-disable-next-line unicorn/no-useless-undefined
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(undefined);

      await expect(authService.validateUser(email, password)).rejects.toThrow(
        'Wrong email or password',
      );
    });

    it('should throw UnauthorizedException if password is not matching', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash('wrong-password', salt);

      const mockUser = await userModel.create({
        email,
        name: 'John',
        password: hashedPassword,
        profilePic: Buffer.from(' '),
        roles: [Role.user],
      });

      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(mockUser);

      await expect(
        authService.validateUser(email, password),
      ).resolves.toBeUndefined();
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });
});
