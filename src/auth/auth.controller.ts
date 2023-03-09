import {
  Controller,
  Logger,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { RequestWithUser, validationPipeOptions } from '../types';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from '../decorators/public.decorator';

import { AuthService } from './auth.service';
import { LoginRequestDto, LoginResponseDto } from './dto/login.dto';

@ApiTags('auth')
@UsePipes(new ValidationPipe(validationPipeOptions))
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginRequestDto })
  @ApiOkResponse({ type: LoginResponseDto })
  @Post('/login')
  async login(@Request() request: RequestWithUser) {
    this.logger.debug(`New login: ${request.user?.email}`);
    return this.authService.login(request.user);
  }
}
