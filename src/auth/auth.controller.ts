import { Controller, Logger, Post, Request, UseGuards } from '@nestjs/common';

import { AuthenticatedRequest } from 'src/types';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from '../decorators/public.decorator';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Request() request: AuthenticatedRequest) {
    this.logger.log(`New login: ${request.user?.email}`);
    return this.authService.login(request.user);
  }
}
