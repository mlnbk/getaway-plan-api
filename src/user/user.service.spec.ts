import { Test } from '@nestjs/testing';

import { UserService } from './user.service';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  // NOTE: temporary until DB is not present

  describe('findOneByEmail', () => {
    it('should return a user with matching email', async () => {
      const email = 'arn@old.com';
      const user = await userService.findOneByEmail(email);
      expect(user?.email).toEqual(email);
    });

    it('should return undefined if no user found with matching email', async () => {
      const email = 'nonexisting@example.com';
      const user = await userService.findOneByEmail(email);
      expect(user).toBeUndefined();
    });
  });
});
