import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { omit } from 'lodash';

import { Role, User } from '../types';

import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { nanoid } from 'nanoid';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let userService: UserService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findOneByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userService = module.get<UserService>(UserService);
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const mockUser: User = {
        _id: nanoid(),
        email: 'test@example.com',
        name: 'John',
        password: 'password',
        roles: [Role.user],
      };

      const expectedPayload = {
        sub: mockUser._id,
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

      const mockUser: User = {
        _id: nanoid(),
        email,
        name: 'John',
        password: hashedPassword,
        roles: [Role.user],
      };

      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(mockUser);

      const result = await authService.validateUser(email, password);

      expect(userService.findOneByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(
        expect.objectContaining(omit(mockUser, 'password')),
      );
    });

    it('should throw UnauthorizedException if email is not found', async () => {
      const email = 'test@example.com';
      const password = 'password';

      // eslint-disable-next-line unicorn/no-useless-undefined
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(undefined);

      await expect(authService.validateUser(email, password)).rejects.toThrow(
        'Wrong email or password',
      );
    });

    it('should throw UnauthorizedException if password is not matching', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash('wrong-password', salt);

      const mockUser: User = {
        _id: nanoid(),
        email,
        name: 'John',
        password: hashedPassword,
        roles: [Role.user],
      };

      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(mockUser);

      await expect(
        authService.validateUser(email, password),
      ).resolves.toBeUndefined();
    });
  });
});
