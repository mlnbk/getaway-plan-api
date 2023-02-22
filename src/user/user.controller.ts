import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthenticatedRequest } from '../types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('user')
@Controller('user')
export class UserController {
  @Get('/me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() request: AuthenticatedRequest) {
    return request.user;
  }
}
