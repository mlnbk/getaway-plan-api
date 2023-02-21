import { Injectable } from '@nestjs/common';

import { User } from 'src/types';
import { users } from '../mock-data';

@Injectable()
export class UserService {
  async findOneByEmail(email: string): Promise<User | undefined> {
    return users.find((user) => user.email === email);
  }
}
