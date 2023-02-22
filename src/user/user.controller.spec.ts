import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedRequest } from '../types';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserController } from './user.controller';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: JwtAuthGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  describe('getProfile', () => {
    it('should return the authenticated user', () => {
      const user = { email: 'user@test.com', roles: ['user'] };

      const request = { user } as unknown as AuthenticatedRequest;
      const result = controller.getProfile(request);

      expect(result).toEqual(user);
    });
  });
});
