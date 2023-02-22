import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';

import { AuthenticatedRequest } from '../types';
import { UserService } from '../user/user.service';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, JwtService, UserService],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return a JWT token for a valid user', async () => {
      const user = { email: 'test@example.com', password: 'password' };
      const tokenResp = { access_token: 'token' };

      jest
        .spyOn(authService, 'login')
        .mockImplementation(async (user) => tokenResp);

      const loginRequest = { user } as unknown as AuthenticatedRequest;
      const result = await authController.login(loginRequest);

      expect(result).toBe(tokenResp);
      expect(authService.login).toHaveBeenCalledWith(user);
    });
  });
});
