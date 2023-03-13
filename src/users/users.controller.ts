import {
  Controller,
  Get,
  NotFoundException,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { AuthenticatedRequest, validationPipeOptions } from '../types';
import { UserDto } from './dto/user.dto';

import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
@UsePipes(new ValidationPipe(validationPipeOptions))
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/me')
  @ApiOkResponse({ type: UserDto })
  async getProfile(@Request() request: AuthenticatedRequest) {
    const foundUser = await this.usersService.findOneByEmail(
      request.user.email,
    );
    if (!foundUser) {
      throw new NotFoundException('User document not found');
    }
    const transformedUser = plainToClass(UserDto, foundUser.toObject(), {
      excludeExtraneousValues: true,
    });
    transformedUser.profilePic = foundUser
      .toObject()
      .profilePic.toString('base64');
    return transformedUser;
  }
}
