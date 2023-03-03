import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { omit } from 'lodash';

import { JwtPayload } from '../types';

import { User, UserDocument } from '../users/schema/user.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  private async checkPassword(
    password: string,
    hashed: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashed);
  }

  async login(user: UserDocument) {
    const payload: JwtPayload = {
      sub: String(user._id),
      email: user.email.toLowerCase(),
      roles: user.roles,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | undefined> {
    try {
      const user = await this.usersService.findOneByEmail(email);
      if (!user) {
        throw new UnauthorizedException();
      }
      const isPasswordMatching = await this.checkPassword(
        password,
        user.password,
      );
      if (user && isPasswordMatching) {
        return omit(user, 'password');
      }
      return undefined;
    } catch {
      throw new UnauthorizedException('Wrong email or password');
    }
  }
}
