import { Injectable } from '@nestjs/common';

import { User } from '../types';
import { users } from '../mock-data';

@Injectable()
export class UserService {
  async findOneByEmail(email: string): Promise<User | undefined> {
    // NOTE: temporary until DB is not present
    return users.find((user) => user.email === email);
  }
}
