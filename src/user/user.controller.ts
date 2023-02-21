import { Controller, Get, Request, UseGuards } from '@nestjs/common';

import { AuthenticatedRequest } from 'src/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('user')
export class UserController {
  @Get('/me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() request: AuthenticatedRequest) {
    return request.user;
  }
}
