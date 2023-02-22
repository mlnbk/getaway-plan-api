import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { omit } from 'lodash';

import { AuthenticatedUser, JwtPayload } from '../types';

import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UserService,
  ) {}

  private async checkPassword(
    password: string,
    hashed: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashed);
  }

  async login(user: AuthenticatedUser) {
    const payload: JwtPayload = {
      sub: String(user._id),
      email: user.email.toLowerCase(),
      roles: user.roles,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
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
