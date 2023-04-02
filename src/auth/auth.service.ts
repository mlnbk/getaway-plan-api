import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { omit } from 'lodash';

import { JwtPayload } from '../types';

import { User, UserDocument } from '../users/schema/user.schema';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginResponseDto } from './dto/login.dto';

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

  async login(user: UserDocument): Promise<LoginResponseDto> {
    const foundUser = await this.usersService.findOneByEmail(user.email);
    if (foundUser?.verifyToken) {
      throw new UnauthorizedException(
        'You have to verify you email before accessing the site!',
      );
    }
    const payload: JwtPayload = {
      sub: String(user._id),
      email: user.email.toLowerCase(),
      roles: user.roles,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signUp(user: CreateUserDto, verifyToken: string): Promise<User> {
    const existingUser = await this.usersService.findOneByEmail(user.email);
    if (existingUser) {
      throw new ConflictException(
        'Email already in use. Please sign up with a new email address!',
      );
    }
    const profilePic = this.usersService.generateProfilePic(user.name);
    user.password = await bcrypt.hash(user.password, 10);
    const createdUser = await this.usersService.createUser(
      user,
      verifyToken,
      profilePic,
    );
    if (!createdUser) {
      throw new BadRequestException(
        'Something went wrong while creating the user!',
      );
    }
    return createdUser;
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
