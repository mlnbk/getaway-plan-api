import { setTimeout } from 'node:timers/promises';
import {
  Controller,
  Get,
  NotFoundException,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthenticatedRequest } from '../types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { plainToClass } from 'class-transformer';
import { UserDto } from './dto/user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() request: AuthenticatedRequest) {
    const foundUser = await this.usersService.findOneByEmail(
      request.user.email,
    );
    if (!foundUser) {
      throw new NotFoundException('User document not found');
    }
    // FIXME base64 encode-decode
    const transformedUser = plainToClass(UserDto, foundUser.toObject(), {
      excludeExtraneousValues: true,
    });
    transformedUser.profilePic = foundUser
      .toObject()
      .profilePic.toString('base64');
    return transformedUser;
  }
}
